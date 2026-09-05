#!/usr/bin/env node
// scripts/audit-model-names.mjs
//
// 2026-08-25: EVERY FREE MODEL NAMED IN THIS CODEBASE WAS RETIRED, and nothing
// noticed. Found by exercising the javari-spirits sommelier end to end - it
// returned 500, and the cause was:
//
//   404 model_not_found — "llama-3.3-70b-versatile does not exist"
//
// Verified dead against the live provider lists on 2026-08-25:
//   llama-3.3-70b-versatile   RETIRED   (COST LAW tier 1)
//   llama-3.1-8b-instant      RETIRED
//   mixtral-8x7b-32768        RETIRED
//   gemma2-9b-it              RETIRED
//   deepseek-v4-flash:free    RETIRED   (OpenRouter tier 1)
//   gemini-2.0-flash-exp      RETIRED
//
// A MODEL NAME IS A CREDENTIAL-LIKE DEPENDENCY THAT EXPIRES WITHOUT WARNING, and
// no existing check could see it. /api/health/apis calls /v1/models, gets 200 and
// reports the provider healthy - the KEY is fine. It is the name in the code that
// is dead. A health check that verifies the door opens tells you nothing about
// whether the room still exists.
//
// This gate reads the provider's LIVE model list and fails when a name in the
// codebase is absent from it. Network-dependent, so it SKIPS rather than fails
// when a key is missing - a gate that breaks offline gets disabled, and a disabled
// gate is worse than none.
//
// CR AudioViz AI, LLC · EIN 39-3646201
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".next", ".git", "dist", "build", "coverage"]);

// Only names matching a provider's own shape. Deliberately narrow: a false
// finding on a working model is how a gate gets switched off.
const GROQ_RE = /["'`](llama-[\d.]+-[\w.-]+|mixtral-[\w-]+|gemma\d?-[\w-]+|openai\/gpt-oss-[\w-]+|groq\/compound[\w-]*|qwen\/[\w.-]+)["'`]/g;
const OR_RE = /["'`]([\w-]+\/[\w.-]+:free)["'`]/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e) || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(e)) out.push(p);
  }
  return out;
}

async function liveModels(url, key, header = "Authorization", prefix = "Bearer ") {
  if (!key) return null; // skip, do not fail
  try {
    const res = await fetch(url, {
      headers: {
        [header]: `${prefix}${key}`,
        // Cloudflare returns 403/1010 to a bare fetch and that is NOT an auth
        // failure - a lesson that cost a wrong "dead key" report on 2026-08-25.
        "User-Agent": "Mozilla/5.0 (compatible; craudiovizai-gate)",
      },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return new Set((body.data ?? []).map((m) => m.id));
  } catch {
    return null;
  }
}

const groq = await liveModels("https://api.groq.com/openai/v1/models", process.env.GROQ_API_KEY);
const openrouter = await liveModels("https://openrouter.ai/api/v1/models", process.env.OPENROUTER_API_KEY);

if (!groq && !openrouter) {
  console.log("audit-model-names: skipped (no provider keys available)");
  process.exit(0);
}

const findings = [];
for (const root of ["app", "lib", "scripts"]) {
  let files = [];
  try { files = walk(join(REPO_ROOT, root)); } catch { continue; }
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    src.split("\n").forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return; // comments document dead names on purpose
      for (const [re, live, provider] of [[GROQ_RE, groq, "groq"], [OR_RE, openrouter, "openrouter"]]) {
        if (!live) continue;
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line))) {
          const name = m[1];
          const bare = name.replace(/^groq\//, "");
          if (live.has(name) || live.has(bare) || live.has(`groq/${name}`)) continue;
          findings.push({ file: file.replace(REPO_ROOT + "/", ""), line: i + 1, name, provider });
        }
      }
    });
  }
}

if (findings.length) {
  console.error(`\naudit-model-names: ${findings.length} reference(s) to models the provider NO LONGER SERVES\n`);
  const seen = new Set();
  for (const f of findings) {
    const k = `${f.name}`;
    if (seen.has(k)) continue;
    seen.add(k);
    console.error(`  ${f.name}  (${f.provider})  first seen ${f.file}:${f.line}`);
  }
  console.error(`\n  ${seen.size} distinct dead model name(s) across ${findings.length} references.`);
  console.error("  The KEY is fine; the NAME is dead. A key-presence check cannot see this.\n");
  process.exit(1);
}
console.log("audit-model-names: clean (every named model is live).");
