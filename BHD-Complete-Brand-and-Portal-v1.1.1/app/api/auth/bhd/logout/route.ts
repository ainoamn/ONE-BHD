import { NextResponse } from "next/server";
import { clearSessionCookies } from "../../../../lib/auth/session";
import { identityIssuer, oauthStateCookie } from "../../../../lib/identity/issuer";
import { isSafeNextPath } from "../../../../lib/identity/safe-next";

export const runtime = "nodejs";

const STATE_COOKIE = "bhd_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const cont = url.searchParams.get("continue") || "";
  const issuer = identityIssuer(request);
  const clientId = process.env.BHD_OAUTH_CLIENT_ID?.trim() || "bhd-portal";

  let target: string;
  if (cont.startsWith("https://") || cont.startsWith("http://")) {
    try {
      const next = new URL(cont);
      const issuerHost = new URL(issuer).host;
      const allowed =
        next.origin === origin ||
        next.host === issuerHost ||
        next.pathname.startsWith("/api/auth/bhd/");
      target = allowed ? cont : `${issuer}/oauth/end-session?post_logout_redirect_uri=${encodeURIComponent(`${origin}/`)}&client_id=${encodeURIComponent(clientId)}`;
    } catch {
      target = `${issuer}/oauth/end-session?post_logout_redirect_uri=${encodeURIComponent(`${origin}/`)}&client_id=${encodeURIComponent(clientId)}`;
    }
  } else if (isSafeNextPath(cont)) {
    target = new URL(cont, origin).toString();
  } else {
    const endSession = new URL("/oauth/end-session", issuer);
    endSession.searchParams.set("post_logout_redirect_uri", `${origin}/`);
    endSession.searchParams.set("client_id", clientId);
    target = endSession.toString();
  }

  const response = NextResponse.redirect(target, 303);
  clearSessionCookies(response.cookies);
  response.cookies.set(STATE_COOKIE, "", { ...oauthStateCookie(), maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const POST = GET;
