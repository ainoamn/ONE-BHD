import { NextResponse } from "next/server";
import { resolveIdentityClient, isAllowedLogoutRedirect } from "../../lib/identity/clients";
import { clearSessionCookies } from "../../lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id") || "bhd-portal";
  const post = url.searchParams.get("post_logout_redirect_uri") || "";
  const client = await resolveIdentityClient(clientId);
  const target =
    client && post && isAllowedLogoutRedirect(client, post)
      ? post
      : new URL("/", url.origin).toString();

  const response = NextResponse.redirect(target);
  clearSessionCookies(response.cookies);
  return response;
}
