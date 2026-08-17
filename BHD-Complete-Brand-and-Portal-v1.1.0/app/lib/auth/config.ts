export const SESSION_COOKIE = "bhd_portal";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
export const SESSION_ISSUER = "bhd-portal";

export function googleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

export function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "";
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(googleClientId() && authSecret());
}
