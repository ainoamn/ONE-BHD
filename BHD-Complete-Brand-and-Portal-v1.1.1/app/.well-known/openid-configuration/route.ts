import { NextResponse } from "next/server";
import { identityIssuer } from "../../lib/identity/issuer";
import { IDENTITY_CLIENTS } from "../../lib/identity/clients";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const issuer = identityIssuer(request);
  return NextResponse.json(
    {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      userinfo_endpoint: `${issuer}/oauth/userinfo`,
      jwks_uri: `${issuer}/oauth/jwks.json`,
      end_session_endpoint: `${issuer}/oauth/end-session`,
      revocation_endpoint: `${issuer}/oauth/revoke`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["HS256"],
      scopes_supported: ["openid", "profile", "email"],
      token_endpoint_auth_methods_supported: ["client_secret_post"],
      spec: "bhd-identity.v1",
      clients: IDENTITY_CLIENTS.map((client) => client.clientId),
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, noarchive" } },
  );
}
