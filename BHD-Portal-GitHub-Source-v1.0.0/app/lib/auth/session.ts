import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  IDENTITY_SESSION_COOKIE,
  SESSION_COOKIE,
  SESSION_ISSUER,
  SESSION_MAX_AGE_SEC,
  authSecret,
} from "./config";

export const ROSTER_COOKIE = "bhd_id_roster";
export const MAX_ROSTER_ACCOUNTS = 8;
const ROSTER_ISSUER = "bhd-roster";

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

export function upsertRoster(roster: PortalSession[], next: PortalSession): PortalSession[] {
  const rest = roster.filter((item) => item.sub !== next.sub);
  return [next, ...rest].slice(0, MAX_ROSTER_ACCOUNTS);
}

async function signRoster(accounts: PortalSession[]): Promise<string> {
  return new SignJWT({ accounts })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ROSTER_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secretKey());
}

export async function readRosterToken(token: string | undefined): Promise<PortalSession[]> {
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ROSTER_ISSUER });
    const raw = Array.isArray(payload.accounts) ? payload.accounts : [];
    const accounts: PortalSession[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const sub = typeof row.sub === "string" ? row.sub : "";
      const email = typeof row.email === "string" ? row.email : "";
      if (!sub || !email) continue;
      accounts.push({
        sub,
        email,
        name: typeof row.name === "string" ? row.name : email,
        picture: typeof row.picture === "string" ? row.picture : null,
      });
    }
    return accounts;
  } catch {
    return [];
  }
}

export async function readSessionRoster(): Promise<PortalSession[]> {
  const jar = await cookies();
  const roster = await readRosterToken(jar.get(ROSTER_COOKIE)?.value);
  const current = await getCurrentSession();
  if (!current) return roster;
  return upsertRoster(roster, current);
}

export function applySessionCookies(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
  token: string,
) {
  const options = sessionCookieOptions();
  store.set(SESSION_COOKIE, token, options);
  store.set(IDENTITY_SESSION_COOKIE, token, options);
}

export async function applyIdentityLogin(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
  next: PortalSession,
  roster: PortalSession[],
) {
  const merged = upsertRoster(roster, next);
  const token = await createSessionToken(next);
  applySessionCookies(store, token);
  store.set(ROSTER_COOKIE, await signRoster(merged), sessionCookieOptions());
  return merged;
}

export async function applyIdentitySwitch(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
  targetSub: string,
  roster: PortalSession[],
): Promise<PortalSession | null> {
  const next = roster.find((item) => item.sub === targetSub);
  if (!next) return null;
  await applyIdentityLogin(store, next, roster);
  return next;
}

export async function applyIdentityLogout(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
  current: PortalSession | null,
  roster: PortalSession[],
  all: boolean,
): Promise<PortalSession | null> {
  if (all || !current) {
    clearSessionCookies(store);
    return null;
  }
  const remaining = roster.filter((item) => item.sub !== current.sub);
  if (!remaining[0]) {
    clearSessionCookies(store);
    return null;
  }
  await applyIdentityLogin(store, remaining[0], remaining);
  return remaining[0];
}

export function clearSessionCookies(
  store: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void },
) {
  const options = { ...sessionCookieOptions(), maxAge: 0 };
  store.set(SESSION_COOKIE, "", options);
  store.set(IDENTITY_SESSION_COOKIE, "", options);
  store.set(ROSTER_COOKIE, "", options);
}
