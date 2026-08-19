import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  IDENTITY_SESSION_COOKIE,
  SESSION_COOKIE,
  SESSION_ISSUER,
  SESSION_MAX_AGE_SEC,
  authSecret,
} from "./config";

export type PortalSession = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};

function secretKey() {
  const secret = authSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: PortalSession): Promise<string> {
  return new SignJWT({
    email: session.email,
    name: session.name,
    picture: session.picture,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.sub)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<PortalSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_ISSUER,
    });
    const email = typeof payload.email === "string" ? payload.email : "";
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!email || !sub) return null;
    return {
      sub,
      email,
      name: typeof payload.name === "string" ? payload.name : email,
      picture: typeof payload.picture === "string" ? payload.picture : null,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export async function getCurrentSession(): Promise<PortalSession | null> {
  const jar = await cookies();
  const token = jar.get(IDENTITY_SESSION_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

/** One BHD identity per browser: switching accounts requires logout first. */
export function rejectAccountSwitch(current: PortalSession | null, nextUserId: string) {
  if (current && current.sub !== nextUserId) {
    throw new Error("SWITCH_REQUIRES_LOGOUT");
  }
}

export function applySessionCookies(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
  token: string,
) {
  const options = sessionCookieOptions();
  store.set(SESSION_COOKIE, token, options);
  store.set(IDENTITY_SESSION_COOKIE, token, options);
}

export function clearSessionCookies(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
) {
  const options = { ...sessionCookieOptions(), maxAge: 0 };
  store.set(SESSION_COOKIE, "", options);
  store.set(IDENTITY_SESSION_COOKIE, "", options);
}
