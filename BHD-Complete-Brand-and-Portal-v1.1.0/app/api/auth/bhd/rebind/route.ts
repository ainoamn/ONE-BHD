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

function bindReturnPath(returnTo: string, sub: string) {
  const safe = isSafeNextPath(returnTo) ? returnTo : "/";
  try {
    const url = new URL(safe, "https://bhd.local");
    url.searchParams.set("au", sub);
    url.searchParams.set("_bhd", String(Date.now()));
    return `${url.pathname}${url.search}`;
  } catch {
    return safe;
  }
}

function wantsJson(request: Request) {
  return (request.headers.get("accept") || "").includes("application/json");
}

async function rebind(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const json = wantsJson(request);

  if (!authSecret()) {
    if (json) return NextResponse.json({ ok: false, error: "secret" }, { status: 503 });
    return NextResponse.json({ message: "AUTH_SECRET غير مُعدّ." }, { status: 503 });
  }

  let token = "";
  let returnTo = "/";
  const contentType = request.headers.get("content-type") || "";
  if (request.method === "POST" && contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { token?: string; returnTo?: string };
    token = typeof body.token === "string" ? body.token.trim() : "";
    returnTo = isSafeNextPath(body.returnTo) ? body.returnTo! : "/";
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
    if (json) return NextResponse.json({ ok: false, error: "token" }, { status: 401 });
    return NextResponse.redirect(
      new URL(`/api/auth/bhd/start?returnTo=${encodeURIComponent(returnTo)}`, origin),
      303,
    );
  }

  try {
    const profile = await profileFromWindowToken(token, request);
    const current = await getCurrentSession(request);
    const bound = bindReturnPath(returnTo, profile.sub);

    if (current?.sub === profile.sub) {
      if (json) {
        return NextResponse.json(
          {
            ok: true,
            unchanged: true,
            user: { id: profile.sub, email: current.email, name: current.name },
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
      const response = NextResponse.redirect(new URL(bound, origin), 303);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    const roster = await readSessionRoster(request);
    if (json) {
      const response = NextResponse.json(
        { ok: true, user: { id: profile.sub, email: profile.email, name: profile.name } },
        { headers: { "Cache-Control": "no-store" } },
      );
      await applyIdentityLogin(response.cookies, profile, roster);
      return response;
    }

    const response = NextResponse.redirect(new URL(bound, origin), 303);
    await applyIdentityLogin(response.cookies, profile, roster);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    if (json) return NextResponse.json({ ok: false, error: "rebind" }, { status: 401 });
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
