export const SESSION_COOKIE = "bhd_portal";
export const IDENTITY_SESSION_COOKIE = "bhd_id";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;
export const SESSION_ISSUER = "bhd-portal";

/** Public One BHD Web Client ID (same as HISAB / WAZEN). Safe to expose in the browser. */
export const BHD_GOOGLE_WEB_CLIENT_ID =
  "162957418455-d734efb8n4oe0ba5e664583a255ks50t.apps.googleusercontent.com";

export function googleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    BHD_GOOGLE_WEB_CLIENT_ID
  );
}

export function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "";
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(googleClientId() && authSecret());
}
