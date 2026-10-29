import { NextResponse } from "next/server";
import {
  applyIdentityLogin,
  getCurrentSession,
  portalSessionFromUser,
  readSessionRoster,
} from "../../../../lib/auth/session";
import { authSecret } from "../../../../lib/auth/config";
import { identityIssuer } from "../../../../lib/identity/issuer";
import { isSafeNextPath } from "../../../../lib/identity/safe-next";

export const runtime = "nodejs";

async function profileFromWindowToken(token: string, request: Request) {
  const issuer = identityIssuer(request);
  const response = await fetch(`${issuer}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`me_${response.status}`);
  const body = (await response.json()) as {
    user?: { id?: string; email?: string; name?: string; picture?: string | null } | null;
  };
  const user = body.user;
  const email = typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!user?.id || !email) throw new Error("claims");
  return portalSessionFromUser({
    id: user.id,
    email,
    name: typeof user.name === "string" && user.name.trim() ? user.name.trim() : email,
    picture: typeof user.picture === "string" ? user.picture : null,
  });
}

async function rebind(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  if (!authSecret()) {
    return NextResponse.json({ message: "AUTH_SECRET غير مُعدّ." }, { status: 503 });
  }

  let token = "";
  let returnTo = "/";
  const contentType = request.headers.get("content-type") || "";
  if (request.method === "POST" && contentType.includes("application/json")) {
    const json = (await request.json().catch(() => ({}))) as { token?: string; returnTo?: string };
    token = typeof json.token === "string" ? json.token.trim() : "";
    returnTo = isSafeNextPath(json.returnTo) ? json.returnTo : "/";
  } else if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    token = String(form?.get("token") || "").trim();
    const rt = String(form?.get("returnTo") || "");
    returnTo = isSafeNextPath(rt) ? rt : "/";
  } else {
    returnTo = isSafeNextPath(url.searchParams.get("returnTo")) ? url.searchParams.get("returnTo")! : "/";
  }

  const header = request.headers.get("authorization");
  if (!token && header?.toLowerCase().startsWith("bearer ")) token = header.slice(7).trim();

  if (!token || token.length < 20) {
    return NextResponse.redirect(
      new URL(`/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`, origin),
      303,
    );
  }

  try {
    const profile = await profileFromWindowToken(token, request);
    const current = await getCurrentSession(request);
    if (current?.sub === profile.sub) {
      const response = NextResponse.redirect(new URL(returnTo, origin), 303);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    const roster = await readSessionRoster(request);
    const response = NextResponse.redirect(new URL(returnTo, origin), 303);
    await applyIdentityLogin(response.cookies, profile, roster);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(
      new URL(
        `/api/auth/bhd/logout?continue=${encodeURIComponent(`/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`)}`,
        origin,
      ),
      303,
    );
  }
}

export const GET = rebind;
export const POST = rebind;
