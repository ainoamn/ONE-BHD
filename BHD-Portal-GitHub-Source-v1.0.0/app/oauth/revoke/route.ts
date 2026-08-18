import { NextResponse } from "next/server";
import { verifyClientSecret } from "../../lib/identity/crypto";
import { consumeTicket } from "../../lib/identity/tickets";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = new URLSearchParams(await request.text());
  const client = verifyClientSecret(form.get("client_id") || "", form.get("client_secret") || "");
  if (!client) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }
  const token = form.get("token") || form.get("refresh_token") || "";
  if (token) {
    await consumeTicket(token, "refresh");
  }
  return NextResponse.json({ ok: true });
}
