import { NextResponse } from "next/server";
import { databaseHealth } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";
import { googleClientId, authSecret } from "../../../lib/auth/config";
import { identityIssuer } from "../../../lib/identity/issuer";
import { IDENTITY_CLIENTS } from "../../../lib/identity/clients";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const db = await databaseHealth();
  const issuer = identityIssuer(request);
  return NextResponse.json(
    {
      spec: "bhd-identity.v1",
      issuer,
      discovery: `${issuer}/.well-known/openid-configuration`,
      login: `${issuer}/login`,
      databaseConfigured: isDatabaseConfigured(),
      databaseOk: db.ok,
      users: db.users ?? null,
      googleConfigured: Boolean(googleClientId()),
      authSecretConfigured: Boolean(authSecret()),
      clients: IDENTITY_CLIENTS.map((client) => client.clientId),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
