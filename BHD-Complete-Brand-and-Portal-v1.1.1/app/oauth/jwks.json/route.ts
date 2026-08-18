import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** HS256 identity tokens do not publish a public JWK. RSA keys will appear here later. */
export async function GET() {
  return NextResponse.json(
    { keys: [] },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, noarchive" } },
  );
}
