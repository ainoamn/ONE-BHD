import { NextResponse } from "next/server";
import { getIdentityClient, isAllowedRedirect } from "../../lib/identity/clients";
import { randomUrlToken } from "../../lib/identity/crypto";
import { loginRedirectForAuthorize } from "../../lib/identity/safe-next";
import { saveTicket } from "../../lib/identity/tickets";
import { allowRequest, clientKey } from "../../lib/auth/rate-limit";
import { getCurrentSession } from "../../lib/auth/session";
import { authSecret } from "../../lib/auth/config";

export const runtime = "nodejs";

function oauthErrorRedirect(redirectUri: string, error: string, state?: string | null) {
  const url = new URL(redirectUri);
  url.searchParams.set("error", error);
  if (state) url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!allowRequest(`authorize:${clientKey(request)}`)) {
    return new NextResponse("slow_down", { status: 429 });
  }
  if (!authSecret()) {
    return new NextResponse("identity is not configured", { status: 503 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id") || "";
  const redirectUri = url.searchParams.get("redirect_uri") || "";
  const responseType = url.searchParams.get("response_type") || "";
  const scope = url.searchParams.get("scope") || "";
  const state = url.searchParams.get("state");
  const nonce = url.searchParams.get("nonce") || "";
  const challenge = url.searchParams.get("code_challenge") || "";
  const method = url.searchParams.get("code_challenge_method") || "";

  const client = getIdentityClient(clientId);
  const origin = url.origin;
  if (!client || !isAllowedRedirect(client, redirectUri, origin)) {
    return new NextResponse("unauthorized_client or invalid redirect_uri", { status: 400 });
  }
  if (responseType !== "code" || !scope.split(/[ +]/).includes("openid") || method !== "S256" || !challenge || !nonce || !state) {
    return oauthErrorRedirect(redirectUri, "invalid_request", state);
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.redirect(loginRedirectForAuthorize(url.origin, url.searchParams));
  }

  const jti = randomUrlToken();
  await saveTicket({
    jti,
    kind: "code",
    clientId,
    userId: session.sub,
    expiresAt: new Date(Date.now() + 60_000),
    payload: {
      redirect_uri: redirectUri,
      nonce,
      code_challenge: challenge,
      email: session.email,
      name: session.name,
      picture: session.picture || "",
    },
  });

  const next = new URL(redirectUri);
  next.searchParams.set("code", jti);
  next.searchParams.set("state", state);
  return NextResponse.redirect(next);
}
