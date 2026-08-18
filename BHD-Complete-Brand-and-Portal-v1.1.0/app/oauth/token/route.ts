import { NextResponse } from "next/server";
import { verifyClientSecret, verifyPkce, randomUrlToken } from "../../lib/identity/crypto";
import { identityIssuer } from "../../lib/identity/issuer";
import { consumeTicket, saveTicket } from "../../lib/identity/tickets";
import { signAccessToken, signIdToken, tokenTtl } from "../../lib/identity/tokens";
import { getUserById, getSelfContact } from "../../lib/auth/users";
import { authSecret } from "../../lib/auth/config";

export const runtime = "nodejs";

async function readForm(request: Request) {
  const text = await request.text();
  return new URLSearchParams(text);
}

export async function POST(request: Request) {
  if (!authSecret()) {
    return NextResponse.json({ error: "temporarily_unavailable" }, { status: 503 });
  }

  const form = await readForm(request);
  const grantType = form.get("grant_type") || "";
  const clientId = form.get("client_id") || "";
  const clientSecret = form.get("client_secret") || "";
  const client = verifyClientSecret(clientId, clientSecret);
  if (!client) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const issuer = identityIssuer(request);

  if (grantType === "authorization_code") {
    const code = form.get("code") || "";
    const redirectUri = form.get("redirect_uri") || "";
    const verifier = form.get("code_verifier") || "";
    const ticket = await consumeTicket(code, "code");
    if (!ticket || ticket.clientId !== clientId || ticket.payload.redirect_uri !== redirectUri) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    if (!verifyPkce(verifier, ticket.payload.code_challenge)) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    const user = await getUserById(ticket.userId);
    if (!user) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    const self = await getSelfContact(user.id);
    const idToken = await signIdToken({
      issuer,
      audience: clientId,
      nonce: ticket.payload.nonce,
      claims: {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        preferred_username: user.username,
        phone_number: self?.phone || user.phone,
        email_verified: user.emailVerified,
      },
    });
    const accessToken = await signAccessToken({ issuer, audience: clientId, sub: user.id });
    const refreshJti = randomUrlToken();
    await saveTicket({
      jti: refreshJti,
      kind: "refresh",
      clientId,
      userId: user.id,
      expiresAt: new Date(Date.now() + tokenTtl.refresh * 1000),
      payload: { nonce: ticket.payload.nonce },
    });

    return NextResponse.json({
      token_type: "Bearer",
      expires_in: tokenTtl.access,
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshJti,
    });
  }

  if (grantType === "refresh_token") {
    const refresh = form.get("refresh_token") || "";
    const ticket = await consumeTicket(refresh, "refresh");
    if (!ticket || ticket.clientId !== clientId) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    const user = await getUserById(ticket.userId);
    if (!user) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    const self = await getSelfContact(user.id);
    const nextRefresh = randomUrlToken();
    await saveTicket({
      jti: nextRefresh,
      kind: "refresh",
      clientId,
      userId: user.id,
      expiresAt: new Date(Date.now() + tokenTtl.refresh * 1000),
      payload: ticket.payload,
    });
    return NextResponse.json({
      token_type: "Bearer",
      expires_in: tokenTtl.access,
      access_token: await signAccessToken({ issuer, audience: clientId, sub: user.id }),
      id_token: await signIdToken({
        issuer,
        audience: clientId,
        nonce: ticket.payload.nonce || randomUrlToken(16),
        claims: {
          sub: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          preferred_username: user.username,
          phone_number: self?.phone || user.phone,
          email_verified: user.emailVerified,
        },
      }),
      refresh_token: nextRefresh,
    });
  }

  return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
}
