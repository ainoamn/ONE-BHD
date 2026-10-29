import { NextResponse } from "next/server";
import { createSessionToken, getCurrentSession } from "../../../lib/auth/session";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";
import { randomUrlToken } from "../../../lib/identity/crypto";
import { saveTicket } from "../../../lib/identity/tickets";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function POST(request: Request) {
  const headers = new Headers(productCorsHeaders(request));
  headers.set("Cache-Control", "no-store");
  const session = await getCurrentSession(request);
  if (!session) {
    return NextResponse.json({ message: "يلزم تسجيل الدخول." }, { status: 401, headers });
  }
  const ticket = randomUrlToken();
  const token = await createSessionToken(session);
  await saveTicket({
    jti: ticket,
    kind: "handoff",
    clientId: "bhd-window",
    userId: session.sub,
    payload: { token },
    expiresAt: new Date(Date.now() + 45_000),
  });
  return NextResponse.json({ ticket, sub: session.sub }, { headers });
}
