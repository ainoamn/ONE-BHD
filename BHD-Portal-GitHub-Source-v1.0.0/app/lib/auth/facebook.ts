import { SignJWT, jwtVerify } from "jose";
import { facebookAppId, facebookAppSecret, authSecret } from "./config";

const GRAPH = "https://graph.facebook.com/v21.0";
const DIALOG = "https://www.facebook.com/v21.0/dialog/oauth";
const STATE_COOKIE = "bhd_fb_oauth";

const ALLOWED_ORIGINS = new Set([
  "https://id.bhd-om.com",
  "https://www.bhd-om.com",
  "https://one-bhd.vercel.app",
  "http://localhost:3000",
]);

export type FacebookProfile = {
  facebookId: string;
  email: string;
  name: string;
  picture: string | null;
};

function secretKey() {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export function facebookCallbackOrigin(request: Request): string {
  const origin = new URL(request.url).origin;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return "https://id.bhd-om.com";
}

export function facebookCallbackUrl(origin: string): string {
  return `${origin}/api/auth/facebook/callback`;
}

export function facebookLoginUrl(input: { state: string; redirectUri: string }): string {
  const params = new URLSearchParams({
    client_id: facebookAppId(),
    redirect_uri: input.redirectUri,
    state: input.state,
    response_type: "code",
    scope: "email,public_profile",
  });
  return `${DIALOG}?${params.toString()}`;
}

export async function createFacebookOAuthState(input: { next: string; redirectUri: string }): Promise<{
  state: string;
  cookie: string;
}> {
  const state = crypto.randomUUID();
  const cookie = await new SignJWT({
    state,
    next: input.next,
    redirectUri: input.redirectUri,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject("facebook-oauth")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey());
  return { state, cookie };
}

export async function readFacebookOAuthState(cookie: string | undefined): Promise<{
  state: string;
  next: string;
  redirectUri: string;
} | null> {
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secretKey());
    const state = typeof payload.state === "string" ? payload.state : "";
    const next = typeof payload.next === "string" ? payload.next : "/";
    const redirectUri = typeof payload.redirectUri === "string" ? payload.redirectUri : "";
    if (!state || !redirectUri) return null;
    return { state, next, redirectUri };
  } catch {
    return null;
  }
}

export const facebookOAuthCookieName = STATE_COOKIE;

export function facebookOAuthCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}

async function graphJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Facebook Graph request failed");
  }
  return data;
}

export async function exchangeFacebookCode(code: string, redirectUri: string): Promise<FacebookProfile> {
  const appId = facebookAppId();
  const secret = facebookAppSecret();
  if (!appId || !secret) throw new Error("Facebook sign-in is not configured");

  const tokenUrl = new URL(`${GRAPH}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", secret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const token = await graphJson<{ access_token?: string }>(tokenUrl.toString());
  if (!token.access_token) throw new Error("Missing Facebook access token");

  const debugUrl = new URL("https://graph.facebook.com/debug_token");
  debugUrl.searchParams.set("input_token", token.access_token);
  debugUrl.searchParams.set("access_token", `${appId}|${secret}`);
  const debug = await graphJson<{ data?: { app_id?: string; is_valid?: boolean } }>(debugUrl.toString());
  if (!debug.data?.is_valid || debug.data.app_id !== appId) {
    throw new Error("Facebook token is not for this app");
  }

  const meUrl = new URL(`${GRAPH}/me`);
  meUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
  meUrl.searchParams.set("access_token", token.access_token);
  const me = await graphJson<{
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  }>(meUrl.toString());

  const email = me.email?.trim().toLowerCase() || "";
  if (!me.id || !email) {
    throw new Error("FACEBOOK_EMAIL_REQUIRED");
  }

  return {
    facebookId: me.id,
    email,
    name: (me.name || email.split("@")[0]).trim(),
    picture: me.picture?.data?.url || null,
  };
}
