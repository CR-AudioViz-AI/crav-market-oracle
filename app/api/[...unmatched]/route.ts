// app/api/[...unmatched]/route.ts
//
// Answers honestly when an API path does not exist.
//
// THE DEFECT THIS CLOSES. A POST to any missing /api path returned HTTP 200 with
// the application's HTML shell. A client sending JSON received a web page and a
// success status, so nothing in the response said the endpoint was absent -
// measured on /api/nope, /api/vault/documents, /api/crm/deals and
// /api/support/chat, all 200.
//
// GET already 404s correctly. Next renders the not-found page for an unmatched
// path, and for GET that carries a 404; for POST it does not.
//
// This is the same class as the webhook stubs deleted on 3 September, which
// returned {ok:true} to any unsigned payload: an endpoint that answers
// successfully when it has done nothing is worse than one that is absent,
// because the caller stops looking.
//
// A catch-all cannot shadow a real route. Next resolves specific segments before
// dynamic ones and dynamic before catch-all, so this only ever handles paths that
// genuinely have no handler.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · 2026-09-04

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function notFound(req: NextRequest): NextResponse {
  const path = new URL(req.url).pathname;
  return NextResponse.json(
    {
      error: "Not found",
      code: "ROUTE_NOT_FOUND",
      path,
      // Said plainly, because the caller may have been getting 200 for a long
      // time and reasonably believed this endpoint existed.
      detail:
        "No handler is registered for this path. If you were receiving a successful " +
        "response here before, it was the application's HTML page rather than this API.",
    },
    { status: 404 },
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function PUT(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function HEAD(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return notFound(req);
}
