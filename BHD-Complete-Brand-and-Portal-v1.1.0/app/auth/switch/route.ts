import { NextResponse } from "next/server";
import { applyIdentitySwitch, getCurrentSession, readSessionRoster } from "../../lib/auth/session";
import { isSafeNextPath } from "../../lib/identity/safe-next";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sub = (url.searchParams.get("sub") || "").trim();
  const next = url.searchParams.get("next") || "/account";
  const dest = isSafeNextPath(next) ? next : "/account";
  const session = await getCurrentSession();
  if (!session) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("next", `/auth/switch?sub=${encodeURIComponent(sub)}&next=${encodeURIComponent(dest)}`);
    return NextResponse.redirect(login);
  }
  const roster = await readSessionRoster();
  const target = roster.find((item) => item.sub === sub || item.email === sub);
  const response = NextResponse.redirect(new URL(dest, url.origin));
  if (target && target.sub !== session.sub) {
    await applyIdentitySwitch(response.cookies, target.sub, roster);
  }
  return response;
}
