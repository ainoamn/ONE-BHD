import { NextResponse } from "next/server";
import { identityIssuer } from "../../lib/identity/issuer";
import { readAccessToken } from "../../lib/identity/tokens";
import { getSelfContact, getUserById } from "../../lib/auth/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  try {
    const payload = await readAccessToken(token, request);
    const user = await getUserById(String(payload.sub));
    if (!user) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const self = await getSelfContact(user.id);
    return NextResponse.json({
      sub: user.id,
      email: user.email,
      email_verified: user.emailVerified,
      name: user.name,
      picture: user.picture,
      preferred_username: user.username,
      phone_number: self?.phone || user.phone,
    });
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
}

void identityIssuer;
