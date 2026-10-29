import { NextResponse } from "next/server";
import { allowedBhdUrl } from "../../lib/identity/client";
import { DEFAULT_IDENTITY_ISSUER } from "../../lib/identity/issuer";
import { consumeTicket } from "../../lib/identity/tickets";
import { setHandoffCookie } from "../../lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticket = url.searchParams.get("ticket") || "";
  const next = allowedBhdUrl(url.searchParams.get("next") || "");
  if (!ticket || !next) {
    return NextResponse.redirect(new URL("/account", DEFAULT_IDENTITY_ISSUER));
  }
  const consumed = await consumeTicket(ticket, "handoff");
  const token = consumed?.payload?.token;
  if (!token) {
    return NextResponse.redirect(next);
  }
  const response = NextResponse.redirect(next);
  setHandoffCookie(response.cookies, token);
  return response;
}
