import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Safe admin landing. Products copy this file as-is if their console is `/admin`. */
function adminReturnTo(request: Request): string {
  const raw = new URL(request.url).searchParams.get("next")?.trim() || "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://") || raw.includes("\\")) {
    return "/admin";
  }
  return raw;
}

/**
 * Product + identity: never send admins to `?local=1` password login.
 * Forwards to the site's BHD start so the same identity session opens `/admin`.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const returnTo = adminReturnTo(request);
  return NextResponse.redirect(new URL(`/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`, origin));
}
