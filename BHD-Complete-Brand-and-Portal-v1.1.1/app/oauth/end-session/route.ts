import { NextResponse } from "next/server";
import { resolveIdentityClient, isAllowedLogoutRedirect } from "../../lib/identity/clients";
import { applyIdentityLogout, getCurrentSession, readSessionRoster } from "../../lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id") || "bhd-portal";
  const post = url.searchParams.get("post_logout_redirect_uri") || "";
  const all = url.searchParams.get("all") === "1";
  const client = await resolveIdentityClient(clientId);
  const target =
    client && post && isAllowedLogoutRedirect(client, post)
      ? post
      : new URL("/", url.origin).toString();

  const response = NextResponse.redirect(target);
  const current = await getCurrentSession();
  const roster = await readSessionRoster();
  await applyIdentityLogout(response.cookies, current, roster, all);
  return response;
}
