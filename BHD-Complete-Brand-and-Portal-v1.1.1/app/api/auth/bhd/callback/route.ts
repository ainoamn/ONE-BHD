import { NextResponse } from "next/server";
import { clientSecretFor } from "../../../../lib/identity/crypto";
import { getIdentityClient } from "../../../../lib/identity/clients";
import { identityIssuer, oauthStateCookie } from "../../../../lib/identity/issuer";
import { applySessionCookies, createSessionToken } from "../../../../lib/auth/session";
import { isSafeNextPath } from "../../../../lib/identity/safe-next";
import { jwtVerify } from "jose";
import { signingKey } from "../../../../lib/identity/crypto";

export const runtime = "nodejs";

const STATE_COOKIE = "bhd_oauth_state";

type StatePayload = {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  redirectUri: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const cookieHeader = request.headers.get("cookie") || "";
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  const clear = NextResponse.redirect(new URL("/login", url.origin));
  clear.cookies.set(STATE_COOKIE, "", { ...oauthStateCookie(), maxAge: 0 });

  if (error || !raw) {
    return clear;
  }

  let saved: StatePayload;
  try {
    saved = JSON.parse(decodeURIComponent(raw)) as StatePayload;
  } catch {
    return clear;
  }
  if (saved.state !== state || !code) {
    return clear;
  }

  const client = getIdentityClient("bhd-portal");
  if (!client) return clear;
  const issuer = identityIssuer(request);
  const tokenRes = await fetch(`${url.origin}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: saved.redirectUri,
      client_id: "bhd-portal",
      client_secret: clientSecretFor(client),
      code_verifier: saved.verifier,
    }),
  });
  if (!tokenRes.ok) {
    return clear;
  }
  const tokens = (await tokenRes.json()) as { id_token?: string };
  if (!tokens.id_token) return clear;

  const { payload } = await jwtVerify(tokens.id_token, signingKey(), {
    issuer,
    audience: "bhd-portal",
  });
  if (payload.nonce !== saved.nonce || typeof payload.sub !== "string" || typeof payload.email !== "string") {
    return clear;
  }

  const session = await createSessionToken({
    sub: payload.sub,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : payload.email,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  });
  const dest = isSafeNextPath(saved.returnTo) ? saved.returnTo : "/";
  const response = NextResponse.redirect(new URL(dest, url.origin));
  applySessionCookies(response.cookies, session);
  response.cookies.set(STATE_COOKIE, "", { ...oauthStateCookie(), maxAge: 0 });
  return response;
}
