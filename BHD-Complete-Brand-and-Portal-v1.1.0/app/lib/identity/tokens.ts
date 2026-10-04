import { SignJWT, jwtVerify } from "jose";
import { signingKey } from "./crypto";
import { identityIssuer } from "./issuer";

const ACCESS_TTL_SEC = 10 * 60;
const ID_TTL_SEC = 10 * 60;
/** Align with identity cookie: product stays signed in until explicit logout. */
const REFRESH_TTL_SEC = 60 * 60 * 24 * 400;

export type IdentityClaims = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
  preferred_username?: string | null;
  phone_number?: string | null;
  email_verified: boolean;
};

export async function signIdToken(input: {
  issuer: string;
  audience: string;
  nonce: string;
  claims: IdentityClaims;
}): Promise<string> {
  return new SignJWT({
    email: input.claims.email,
    email_verified: input.claims.email_verified,
    name: input.claims.name,
    picture: input.claims.picture,
    preferred_username: input.claims.preferred_username || undefined,
    phone_number: input.claims.phone_number || undefined,
    nonce: input.nonce,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(input.issuer)
    .setAudience(input.audience)
    .setSubject(input.claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ID_TTL_SEC}s`)
    .sign(signingKey());
}

export async function signAccessToken(input: {
  issuer: string;
  audience: string;
  sub: string;
}): Promise<string> {
  return new SignJWT({ token_use: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(input.issuer)
    .setAudience(input.audience)
    .setSubject(input.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(signingKey());
}

export async function readAccessToken(token: string, request?: Request) {
  const issuer = identityIssuer(request);
  const { payload } = await jwtVerify(token, signingKey(), { issuer });
  if (payload.token_use !== "access" || typeof payload.sub !== "string") {
    throw new Error("invalid_token");
  }
  return payload;
}

export const tokenTtl = {
  access: ACCESS_TTL_SEC,
  id: ID_TTL_SEC,
  refresh: REFRESH_TTL_SEC,
};
