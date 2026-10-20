import { NextResponse } from "next/server";
import { BHD_APPS } from "../../lib/bhd/apps";
import { DEFAULT_IDENTITY_ISSUER } from "../../lib/identity/issuer";
import { getCurrentSession } from "../../lib/auth/session";

export const runtime = "nodejs";

function allowed(value: string) {
  try {
    const url = new URL(value);
    if (url.origin === DEFAULT_IDENTITY_ISSUER) return url;
    if (BHD_APPS.some((app) => app.origin.replace(/\/$/, "") === url.origin)) return url;
    if (url.hostname === "bhd-om.com" || url.hostname.endsWith(".bhd-om.com")) return url;
  } catch {
    /* ignore */
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = allowed(url.searchParams.get("to") || "");
  if (!target) {
    return NextResponse.redirect(new URL("/account", DEFAULT_IDENTITY_ISSUER));
  }
  const session = await getCurrentSession();
  if (!session) {
    const login = new URL("/login", DEFAULT_IDENTITY_ISSUER);
    login.searchParams.set("next", `/auth/continue?to=${encodeURIComponent(target.toString())}`);
    return NextResponse.redirect(login);
  }
  if (target.origin === DEFAULT_IDENTITY_ISSUER || target.origin === url.origin) {
    return NextResponse.redirect(target);
  }
  const start = new URL("/api/auth/bhd/start", target.origin);
  start.searchParams.set("returnTo", `${target.pathname}${target.search || ""}` || "/");
  return NextResponse.redirect(start);
}
