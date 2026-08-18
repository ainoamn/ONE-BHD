import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { authSecret } from "../auth/config";
import { getIdentityClient, type IdentityClient } from "./clients";
import { identityTokenSecret } from "./issuer";

export function randomUrlToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256Base64Url(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}

export function verifyPkce(verifier: string, challenge: string): boolean {
  if (!verifier || verifier.length < 43 || verifier.length > 128) return false;
  const computed = sha256Base64Url(verifier);
  if (computed.length !== challenge.length) return false;
  return timingSafeEqual(Buffer.from(computed), Buffer.from(challenge));
}

export function clientSecretFor(client: IdentityClient): string {
  const fromEnv = process.env[client.secretEnv]?.trim();
  if (fromEnv) return fromEnv;
  const root = authSecret();
  if (!root) return "";
  return createHmac("sha256", root).update(`bhd-oauth:${client.clientId}`).digest("base64url");
}

export function verifyClientSecret(clientId: string, secret: string): IdentityClient | null {
  const client = getIdentityClient(clientId);
  if (!client || !secret) return null;
  const expected = clientSecretFor(client);
  if (!expected || expected.length !== secret.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(secret))) return null;
  return client;
}

/**
 * Confidential secret if provided; first-party clients may complete
 * authorization_code with PKCE alone until per-client secrets are set.
 */
export function resolveOAuthClient(clientId: string, secret: string): IdentityClient | null {
  if (secret) return verifyClientSecret(clientId, secret);
  return getIdentityClient(clientId) ?? null;
}

export function signingKey(): Uint8Array {
  const secret = identityTokenSecret();
  if (!secret) {
    throw new Error("IDENTITY_TOKEN_SECRET");
  }
  return new TextEncoder().encode(secret);
}
