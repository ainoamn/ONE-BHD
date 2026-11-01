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
  // Always land on the requested account — bind ?au= so /account SSR matches this tab.
  const destUrl = new URL(dest, url.origin);
  const boundSub = target?.sub || (sub && roster.some((item) => item.sub === sub) ? sub : "");
  if (boundSub) destUrl.searchParams.set("au", boundSub);
  const response = NextResponse.redirect(destUrl);
  if (target && target.sub !== session.sub) {
    await applyIdentitySwitch(response.cookies, target.sub, roster, true);
  }
  return response;
}
