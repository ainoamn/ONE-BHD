import { NextResponse } from "next/server";
import { resolveOAuthClient, verifyPkce, randomUrlToken } from "../../lib/identity/crypto";
import { identityIssuer } from "../../lib/identity/issuer";
import { consumeTicket, saveTicketSoon } from "../../lib/identity/tickets";
import { signAccessToken, signIdToken, tokenTtl } from "../../lib/identity/tokens";
import { getUserById, getSelfContact } from "../../lib/auth/users";
import { authSecret } from "../../lib/auth/config";
import { ensurePlatformAdminEmailVerified } from "../../lib/auth/platform-admin";
import { withTimeout } from "../../lib/fast";

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
  const client = await resolveOAuthClient(clientId, clientSecret);
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

    const user = await withTimeout(getUserById(ticket.userId), 800);
    const email = user?.email || ticket.payload.email;
    const name = user?.name || ticket.payload.name || email;
    if (!email) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    const emailVerified = user ? (await withTimeout(ensurePlatformAdminEmailVerified(user), 400)) || false : false;
    const self = user ? await withTimeout(getSelfContact(user.id), 400) : null;
    const idToken = await signIdToken({
      issuer,
      audience: clientId,
      nonce: ticket.payload.nonce,
      claims: {
        sub: user?.id || ticket.userId,
        email,
        name,
        picture: user?.picture || ticket.payload.picture || null,
        preferred_username: user?.username,
        phone_number: self?.phone || user?.phone,
        email_verified: emailVerified,
      },
    });
    const accessToken = await signAccessToken({ issuer, audience: clientId, sub: user?.id || ticket.userId });
    const refreshJti = randomUrlToken();
    saveTicketSoon({
      jti: refreshJti,
      kind: "refresh",
      clientId,
      userId: user?.id || ticket.userId,
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
    const user = await withTimeout(getUserById(ticket.userId), 800);
    if (!user && !ticket.payload.email) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }
    const emailVerified = user ? (await withTimeout(ensurePlatformAdminEmailVerified(user), 400)) || false : false;
    const self = user ? await withTimeout(getSelfContact(user.id), 400) : null;
    const nextRefresh = randomUrlToken();
    saveTicketSoon({
      jti: nextRefresh,
      kind: "refresh",
      clientId,
      userId: user?.id || ticket.userId,
      expiresAt: new Date(Date.now() + tokenTtl.refresh * 1000),
      payload: ticket.payload,
    });
    const sub = user?.id || ticket.userId;
    const email = user?.email || ticket.payload.email;
    const name = user?.name || ticket.payload.name || email;
    return NextResponse.json({
      token_type: "Bearer",
      expires_in: tokenTtl.access,
      access_token: await signAccessToken({ issuer, audience: clientId, sub }),
      id_token: await signIdToken({
        issuer,
        audience: clientId,
        nonce: ticket.payload.nonce || randomUrlToken(16),
        claims: {
          sub,
          email,
          name,
          picture: user?.picture || ticket.payload.picture || null,
          preferred_username: user?.username,
          phone_number: self?.phone || user?.phone,
          email_verified: emailVerified,
        },
      }),
      refresh_token: nextRefresh,
    });
  }

  return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
}
