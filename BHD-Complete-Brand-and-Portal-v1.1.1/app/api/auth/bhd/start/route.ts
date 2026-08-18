import { NextResponse } from "next/server";
import { randomUrlToken, sha256Base64Url } from "../../../../lib/identity/crypto";
import { getIdentityClient, isAllowedRedirect } from "../../../../lib/identity/clients";
import { oauthStateCookie } from "../../../../lib/identity/issuer";
import { authSecret } from "../../../../lib/auth/config";

export const runtime = "nodejs";

const STATE_COOKIE = "bhd_oauth_state";

export async function GET(request: Request) {
  if (!authSecret()) {
    return NextResponse.json({ message: "AUTH_SECRET غير مُعدّ." }, { status: 503 });
  }
  const url = new URL(request.url);
  const origin = url.origin;
  const client = getIdentityClient("bhd-portal");
  if (!client) {
    return NextResponse.json({ message: "عميل البوابة غير مسجّل." }, { status: 500 });
  }
  const redirectUri = `${origin}/api/auth/bhd/callback`;
  if (!isAllowedRedirect(client, redirectUri, origin)) {
    return NextResponse.json({ message: "redirect_uri غير مسموح لهذا المنشأ." }, { status: 400 });
  }

  const state = randomUrlToken();
  const nonce = randomUrlToken();
  const verifier = randomUrlToken(48);
  const challenge = sha256Base64Url(verifier);
  const returnTo = url.searchParams.get("returnTo") || "/";

  const authorize = new URL("/oauth/authorize", origin);
  authorize.searchParams.set("client_id", "bhd-portal");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid profile email");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorize);
  response.cookies.set(
    STATE_COOKIE,
    JSON.stringify({ state, nonce, verifier, returnTo, redirectUri }),
    oauthStateCookie(),
  );
  return response;
}
