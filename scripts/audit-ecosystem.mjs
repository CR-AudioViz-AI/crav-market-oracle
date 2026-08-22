#!/usr/bin/env node
// scripts/audit-ecosystem.mjs
//
// THE SIGN-OFF LAW, MADE ENFORCEABLE. Roy, 2026-08-18: "we look at every single
// piece of code in the ecosystem and sign off or fix then sign off. I am tired
// of finding the same things over and over again."
//
// Every class below was found by eye at least once, in more than one place,
// weeks apart, because finding them depended on somebody noticing. Encoded here,
// each is found once and then never again — the build fails instead.
//
// Companion to scripts/audit-route-auth.mjs, which owns the IDOR class. Both run
// in prebuild. Exit 1 on any BLOCKER; WARN findings are reported, not fatal.
//
// SELF-EXCLUSION: this file necessarily contains the strings it hunts for. The
// patterns are assembled at runtime from fragments so this file cannot match
// itself, and scripts/ is excluded from the scan besides. On its first run the
// earlier version matched its own echo-route check and was deleted by the sweep
// it had just produced. That is the sort of thing a scanner should survive.
//
// Usage:
//   node scripts/audit-ecosystem.mjs            human readable, exits 1 on blockers
//   node scripts/audit-ecosystem.mjs --json     machine readable, always exits 0
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const JSON_OUT = process.argv.includes("--json");
const SKIP_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", ".vercel", "coverage", "scripts",
]);

// Assembled from fragments so this source cannot match its own patterns.
const P_AUTOSTUB_MARKER = "Auto-implemented" + " from stub";
// 2026-08-18: the check above hunted ONE spelling. 82 files used another -
// "auto-stub - malformed createClient replaced" - and walked straight past a
// check built specifically to catch them. Any file announcing itself as a stub
// is a stub, however it spells it.
const P_STUB_WORD = new RegExp("auto" + "-stub", "i");
// A handler that returns {ok:true} and nothing else. 23 API routes did this for
// GET, POST, PUT and DELETE simultaneously.
const P_OK_TRUE = new RegExp("NextResponse\\.json\\(\\{\\s*ok:\\s*true\\s*\\}\\)");
// A page component that renders nothing. Serves HTTP 200 with a header, a
// footer and a blank middle - which is worse than a 404, because a 404 tells
// the truth and this does not.
const P_NULL_PAGE = new RegExp("export default function \\w*\\s*\\([^)]*\\)\\s*\\{\\s*return null\\s*\\}");
const P_ECHO_RECEIVED = new RegExp("received:\\s*body");
const P_ECHO_ENDPOINT = new RegExp("endpoint:\\s*['\"`]");
const P_STUB_CTOR = new RegExp("constructor\\(_\\?: any\\)\\s*\\{\\s*\\}");
const P_STUB_DEFAULT = new RegExp("^export default \\{\\}\\s*$", "m");
const P_STUB_PASSTHRU = new RegExp("export const \\w+: any = \\([^)]*\\) => \\w+ \\?\\? \\{\\}");
const P_AWIN = new RegExp("awinmid=\\d|['\"`]" + "26923" + "70['\"`]");

const CHECKS = [
  {
    id: "auto-stub",
    level: "BLOCKER",
    why: "A module whose implementation was stripped, leaving shape-only exports so builds pass. Found in lib/platform-secrets/crypto.ts (silently broke every vault read for months), lib/security/javari-security.ts (requireOwner returns whatever it is handed — it authorises everyone), types/database.ts (every table typed 'never'), lib/roadmap-engine/*, chamber/controller.ts.",
    test: (src, path) => {
      if (path.endsWith(".d.ts")) return null;
      const code = src.split("\n").filter(
        (l) => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("*"),
      );
      // A page that redirects is doing real work: it sends the visitor to the
      // page that exists. Only a page rendering NOTHING is the defect.
      // redirect() sends the visitor to the page that exists; notFound() tells
      // them honestly that it does not. Both are real behaviour. Only a page
      // that renders NOTHING while answering 200 is the defect.
      // Read CODE, not comments - for the second time. The remediation note in a
      // rewritten file quotes the old body, and matching that flags the fix as
      // the defect. A check that accuses its own repair gets switched off.
      const bodyOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      if (P_NULL_PAGE.test(bodyOnly) && !/\b(redirect|notFound)\(/.test(bodyOnly)) {
        return "page component renders null - serves 200 with a blank body";
      }
      if (P_STUB_WORD.test(src) && code.length < 30) return "file announces itself as an auto-stub";
      // Match on CODE, not comments. The remediation note in each rewritten
      // file quotes the old body, and matching that flagged the fix as the bug.
      const codeOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      if (P_OK_TRUE.test(codeOnly) && code.length < 20) {
        return "every handler returns {ok:true} and nothing else";
      }
      const stubby =
        P_STUB_CTOR.test(src) || P_STUB_DEFAULT.test(src) || P_STUB_PASSTHRU.test(src);
      return stubby && code.length < 30 ? "shape-only export with no implementation" : null;
    },
  },
  {
    id: "echo-route",
    level: "BLOCKER",
    why: "An auto-generated endpoint that returns its own request body with ok:true and answers 200 while doing nothing. 174 found in javari-ai and 64 more already in core on 2026-08-18, including /api/bots/support, /api/autonomous/heal and the whole command-center set. A 200 that does nothing is worse than a 404 — it looks finished.",
    test: (src) => {
      if (src.includes(P_AUTOSTUB_MARKER)) return "auto-generated echo endpoint";
      return P_ECHO_RECEIVED.test(src) && P_ECHO_ENDPOINT.test(src) && src.length < 1800
        ? "returns its own request body"
        : null;
    },
  },
  {
    id: "supabase-ssr-browser",
    level: "BLOCKER",
    why: "createBrowserClient from @supabase/ssr is forbidden by the auth architecture locked 2026-07-15. Chunked cookies (a Discord session spans three) get clobbered by racing client instances and the session dies. javari-spirits used it and its collection feature could never hold a session.",
    test: (src, path) => {
      // Must be a real import FROM @supabase/ssr. 2026-08-18: an earlier version
      // matched lib/auth-context.tsx, which imports the CORRECT singleton under
      // the alias createBrowserClient and merely mentioned @supabase/ssr in a
      // stale comment. A check that cries wolf gets switched off.
      if (path.includes("middleware")) return null;
      // Both halves of @supabase/ssr are cookie-based and both are wrong here.
      // createBrowserClient kills the session by chunking it across cookies;
      // createServerClient READS a cookie session that this platform never
      // writes, so six routes - including GDPR/CCPA rights requests and billing -
      // answered 401/403 to everyone. Found 2026-08-19 while clearing the last
      // Data Cache warnings.
      const importsBrowser = /import\s*\{[^}]*createBrowserClient[^}]*\}\s*from\s*['"]@supabase\/ssr['"]/.test(src);
      if (importsBrowser) return "@supabase/ssr browser client — use the localStorage singleton";
      const codeOnly = src.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
      // An explicit @auth-reviewed note is a recorded DECISION with reasoning in
      // the file. The OAuth callback genuinely needs cookie write access because
      // it is the code that creates the session.
      if (/@auth-reviewed/.test(src)) return null;
      const usesServer = /createServerClient\s*\(/.test(codeOnly)
        && /@supabase\/ssr/.test(codeOnly)
        && !path.includes("middleware");
      return usesServer
        ? "@supabase/ssr createServerClient reads a cookie session this platform never writes — use requireUser()"
        : null;
    },
  },
  {
    id: "auth-helpers-cookie-client",
    level: "BLOCKER",
    why: "@supabase/auth-helpers-nextjs is deprecated AND reads the session from cookies. This platform keeps sessions in localStorage (lib/supabase/client.ts, locked 2026-07-15) and nothing writes a Supabase auth cookie, so every route using it saw no user and answered 401 to everyone - signed in or not. It did not error; it took the unauthenticated path and looked like it worked. 26 routes and 11 pages were affected, including the whole /api/customer surface: profile, billing, dashboard, tickets, notifications. Removed from package.json 2026-08-18 so it cannot be imported by accident.",
    test: (src) => {
      // Honour @auth-reviewed, exactly as the supabase-ssr-browser check does.
      // 2026-08-20: it did not, so the OAuth callbacks that legitimately WRITE a
      // session stayed flagged after being annotated. Two checks for the same
      // family must agree, or an annotation looks like it did not work and the
      // next person annotates twice or gives up.
      if (/@auth-reviewed/.test(src)) return null;
      const codeOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      return /@supabase\/auth-helpers/.test(codeOnly)
        ? "deprecated cookie-based auth client - use requireUser() or the localStorage singleton"
        : null;
    },
  },
  {
    id: "duplicate-import",
    level: "BLOCKER",
    why: "Two import lines binding the same name is a hard build failure in Next - 'X redefined here' - and it has broken three deployments in one session. Every occurrence came from an automated edit adding an import that was already present under different quoting or whitespace, which a naive 'is it imported?' string test does not see. The build catches it, but only after a four-minute deploy; catching it in prebuild costs a second.",
    test: (src) => {
      // Strip template literals first. lib/module-factory.ts GENERATES code and
      // its templates contain import lines that are not this file's imports -
      // flagging them would accuse a code generator of the bug it writes about.
      const withoutTemplates = src.replace(/`(?:\\[\s\S]|[^\\`])*`/g, "``");
      const bound = new Map();
      for (const line of withoutTemplates.split("\n")) {
        if (line.trim().startsWith("//")) continue;
        const m = /^\s*import \{([^}]*)\} from ['"]([^'"]+)['"]/.exec(line);
        if (!m) continue;
        for (const raw of m[1].split(",")) {
          const name = raw.trim().split(" as ").pop()?.trim();
          if (!name) continue;
          if (bound.has(name)) return `duplicate import of '${name}'`;
          bound.set(name, m[2]);
        }
      }
      return null;
    },
  },
  {
    id: "page-level-redirect",
    level: "BLOCKER",
    why: "redirect() or permanentRedirect() called in a page component returns HTTP 200 with a rendered shell in this app - a BLANK PAGE, not a redirect. Route retirement belongs in next.config.js redirects(), where it is a real 308 at the edge that crawlers follow. I hit this on 2026-07-24, wrote a note in next.config.js. Hit it again on 2026-08-12, wrote a SECOND note explicitly saying I had repeated the first. Hit it a THIRD time on 2026-08-19 across twenty pages and spent an hour re-diagnosing it. A comment is not a control; this is.",
    test: (src, path) => {
      if (!/[\\/]page\.tsx?$/.test(path)) return null;
      const codeOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      return /\b(?:permanentRedirect|redirect)\s*\(\s*["'`]/.test(codeOnly)
        ? "page-level redirect returns 200 with a blank shell - move it to next.config.js redirects()"
        : null;
    },
  },
  {
    id: "unguarded-model-fallback",
    level: "BLOCKER",
    why: "completeWithFallback returns model:\"fallback\" with the text \"I'm experiencing high demand\" when EVERY model in the cascade is exhausted (lib/javari/intelligence.ts). A route that returns result.text without checking result.model hands the user an outage message dressed as their resume, their marketing copy, their document summary. Worse, app/api/community/posts used it for SAFETY MODERATION with safe=true as the default - the fallback string contains no \"unsafe\", so every post published UNMODERATED whenever the models were busy. Found 2026-08-21 across six routes, including the universal /api/tools/[tool] handler that serves 20 tools.",
    test: (src, path) => {
      if (!/[\\/]route\.tsx?$/.test(path)) return null;
      const codeOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      if (!/completeWithFallback\s*\(/.test(codeOnly)) return null;
      return /\bmodel\s*(===|!==)\s*["']fallback["']/.test(codeOnly)
        ? null
        : "uses completeWithFallback without checking result.model === 'fallback'";
    },
  },
  {
    id: "unchecked-send",
    level: "BLOCKER",
    why: "A fetch() to a mail or payment provider whose response is never examined. fetch does NOT throw on 4xx or 5xx, so a rejection - bad address, rate limit, suspended account, declined card - is indistinguishable from success. Found five times on 2026-08-21: email-automation marked queue rows 'sent' even with no API key, wish/threads discarded both promise handlers, email/welcome returned success:true for nothing, wanted-matcher marked matches notified so they were never retried, and mortgage-rate-monitor told users verification failed when it had succeeded. Each one recorded success for work that never happened.",
    test: (src, path) => {
      if (!/[\\/]route\.tsx?$/.test(path)) return null;
      const codeOnly = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
        .join("\n");
      if (!/api\.resend\.com|api\.stripe\.com/.test(codeOnly)) return null;
      // Any of these count as examining the outcome.
      // 2026-08-22: the first version of this regex flagged three routes that DO
      // check - billing, stripe/setup and stripe/verify all capture the result
      // into a variable and read it. A gate that cries wolf gets ignored, which is
      // worse than no gate. Capturing the response into a const counts as
      // examining it; only a bare `await fetch(...)` whose result is discarded is
      // the defect.
      const checked = /\.\s*ok\b|\.status\b|\bconst\s+\w+\s*=\s*await\s+fetch\s*\(/.test(codeOnly);
      return checked ? null : "calls a mail/payment provider without checking the response";
    },
  },
  {
    id: "hardcoded-affiliate-id",
    level: "BLOCKER",
    why: "The AWIN publisher id rendered in page copy invites link hijacking, and hardcoded awinmid values were fabricated — 14 checked against affiliate_merchants on 2026-08-17, zero matched, and a customer clicking 'Vivino' reached a French clothing retailer. Merchant ids come from affiliate_merchants on is_approved and is_active; the publisher id comes from the vault.",
    test: (src) => {
      const line = src
        .split("\n")
        .find((l) => P_AWIN.test(l) && !l.trim().startsWith("//") && !l.trim().startsWith("*"));
      return line ? "hardcoded AWIN merchant or publisher id" : null;
    },
  },
  {
    id: "datacache-unsafe-read",
    level: "WARN",
    why: "Next 14 caches outbound GETs from Route Handlers, so supabase-js reads return stale rows. dynamic='force-dynamic' does NOT prevent it, and x-vercel-cache reports MISS throughout, which makes it invisible. Cost a full day on javari-spirits; 369 of 389 core GET routes were exposed.",
    test: (src, path) => {
      if (!/app[\\/]api[\\/].*route\.ts$/.test(path)) return null;
      if (!/export async function GET/.test(src)) return null;
      // Require an actual QUERY, not merely the word "supabase" somewhere in the
      // file. 2026-08-18: 12 findings were routes that mention Supabase in a
      // comment and never read a row. A check that reports work which does not
      // exist is a check people learn to skim.
      // A Supabase table read is `.from('name')` on a CLIENT. Buffer.from("...")
      // matches the same shape, which is why /api/notify and /api/javari/avatar -
      // routes that only build Basic auth headers for Twilio and D-ID - were
      // reported as unsafe database reads.
      const reads = /(?<!Buffer)\.from\(\s*['"`][a-z_][a-z0-9_]*['"`]\s*\)/.test(src)
        || /\.rpc\(\s*['"`]/.test(src);
      if (!reads) return null;
      // Safe if the route pins no-store itself, OR imports a factory that
      // already does. 2026-08-18: an earlier version only looked for the literal
      // in the route file, so 166 routes importing the fixed shared clients were
      // reported as unsafe forever — and a check that reports 438 findings that
      // are not real gets ignored, which is how this class survived since July.
      // Every module that builds a client and pins no-store. Kept as one list
      // so adding a seventh client module is a deliberate act, not a silent one.
      const SAFE_FACTORY =
        /from ['"]@\/lib\/supabase(\/(server|service))?['"]|from ['"]@\/lib\/supabase-server['"]|from ['"]@\/lib\/expenses\/supabase-server['"]|adminDb\(|lazyAdminDb\(|createServiceClient\(|createUserClient\(|createAnonClient\(|supabaseAdmin\b/;
      if (/no-store|force-no-store/.test(src)) return null;
      if (SAFE_FACTORY.test(src)) return null;
      return "GET reads data with an inline client that does not pin no-store — may serve a stale snapshot";
    },
  },
  {
    id: "shipped-todo",
    level: "WARN",
    why: "Placeholder code that compiles and ships. app/api/tools/subtitle-generator/process called a function that did not exist and said so in its own comments.",
    test: (src) =>
      /\/\/\s*(Placeholder for|TODO: implement|Assume a function)/i.test(src)
        ? "placeholder implementation"
        : null,
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) out.push(p);
  }
  return out;
}

const findings = [];
let scanned = 0;

for (const dir of ["app", "lib", "components", "src", "chamber", "pages", "platform-tools"]) {
  const full = join(ROOT, dir);
  if (!existsSync(full)) continue;
  for (const file of walk(full)) {
    scanned++;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const rel = relative(ROOT, file);
    for (const check of CHECKS) {
      const detail = check.test(src, rel);
      if (detail) findings.push({ check: check.id, level: check.level, file: rel, detail });
    }
  }
}

const blockers = findings.filter((f) => f.level === "BLOCKER");
const warns = findings.filter((f) => f.level === "WARN");

if (JSON_OUT) {
  console.log(JSON.stringify({ repo: ROOT.split("/").pop(), scanned, findings }, null, 2));
  process.exit(0);
}

const bar = "─".repeat(60);
console.log(`\n${bar}\nECOSYSTEM DEFECT SCAN\nscanned: ${scanned} source files\n${bar}`);
for (const check of CHECKS) {
  const hits = findings.filter((f) => f.check === check.id);
  console.log(`${check.level === "BLOCKER" ? "BLOCK" : " WARN"}  ${check.id.padEnd(24)} ${hits.length}`);
}
if (blockers.length) {
  console.log(`\n── BLOCKERS ──`);
  for (const f of blockers) console.log(`  [${f.check}] ${f.file}\n      ${f.detail}`);
  console.log(`\n  Why these block:`);
  for (const id of [...new Set(blockers.map((f) => f.check))]) {
    console.log(`   ${id}: ${CHECKS.find((c) => c.id === id).why}`);
  }
}
if (warns.length) {
  console.log(`\n── WARN (${warns.length}) ──`);
  for (const f of warns.slice(0, 25)) console.log(`  [${f.check}] ${f.file}`);
  if (warns.length > 25) console.log(`  ... and ${warns.length - 25} more`);
}
console.log(bar);
console.log(
  blockers.length
    ? `RESULT: FAIL — ${blockers.length} blocker(s). Fix them; do not annotate around them.`
    : `RESULT: PASS — no blocking defects.`,
);
console.log(`${bar}\n`);
process.exit(blockers.length ? 1 : 0);
