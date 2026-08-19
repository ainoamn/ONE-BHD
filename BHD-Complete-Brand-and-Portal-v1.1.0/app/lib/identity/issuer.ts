export const DEFAULT_IDENTITY_ISSUER = "https://id.bhd-om.com";

export function identityIssuer(request?: Request): string {
  const configured = process.env.BHD_IDENTITY_ISSUER?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (request) {
    try {
      const origin = new URL(request.url).origin;
      if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        return origin;
      }
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_IDENTITY_ISSUER;
}

export function identityTokenSecret(): string {
  return process.env.IDENTITY_TOKEN_SECRET?.trim() || process.env.AUTH_SECRET?.trim() || "";
}

export function oauthStateCookie() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 5 * 60,
  };
}
