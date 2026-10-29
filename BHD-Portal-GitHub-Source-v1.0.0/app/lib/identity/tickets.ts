import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { getDb, isDatabaseConfigured } from "../../../db";
import { oauthTickets } from "../../../db/schema";
import { authSecret } from "../auth/config";
import { randomUrlToken } from "./crypto";

type TicketKind = "code" | "refresh" | "handoff";

type MemoryTicket = {
  kind: TicketKind;
  clientId: string;
  userId: string;
  payload: string;
  expiresAt: number;
  consumed: boolean;
};

const CODE_ISSUER = "bhd-authz-code";

declare global {
  // eslint-disable-next-line no-var
  var __bhdOauthMemory: Map<string, MemoryTicket> | undefined;
  // eslint-disable-next-line no-var
  var __bhdRedeemedCodes: Set<string> | undefined;
}

function memoryStore() {
  if (!globalThis.__bhdOauthMemory) {
    globalThis.__bhdOauthMemory = new Map();
  }
  return globalThis.__bhdOauthMemory;
}

function redeemedCodes() {
  if (!globalThis.__bhdRedeemedCodes) {
    globalThis.__bhdRedeemedCodes = new Set();
  }
  return globalThis.__bhdRedeemedCodes;
}

function codeSecret() {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

function persistMemory(input: {
  jti: string;
  kind: TicketKind;
  clientId: string;
  userId: string;
  payload: string;
  expiresAt: Date;
}) {
  memoryStore().set(input.jti, {
    kind: input.kind,
    clientId: input.clientId,
    userId: input.userId,
    payload: input.payload,
    expiresAt: input.expiresAt.getTime(),
    consumed: false,
  });
}

export async function saveTicket(input: {
  jti: string;
  kind: TicketKind;
  clientId: string;
  userId: string;
  payload: unknown;
  expiresAt: Date;
}): Promise<void> {
  const payload = JSON.stringify(input.payload);
  persistMemory({ ...input, payload });
  if (!isDatabaseConfigured()) return;
  try {
    const db = getDb();
    await db.insert(oauthTickets).values({
      jti: input.jti,
      kind: input.kind,
      clientId: input.clientId,
      userId: input.userId,
      payload,
      expiresAt: input.expiresAt,
    });
  } catch {
    // Memory already holds the ticket for this instance.
  }
}

export function saveTicketSoon(input: {
  jti: string;
  kind: TicketKind;
  clientId: string;
  userId: string;
  payload: unknown;
  expiresAt: Date;
}) {
  void saveTicket(input).catch(() => undefined);
}

export async function issueAuthorizationCode(input: {
  clientId: string;
  userId: string;
  payload: Record<string, string>;
}): Promise<string> {
  const jti = randomUrlToken();
  const expiresAt = new Date(Date.now() + 90_000);
  const token = await new SignJWT({
    clientId: input.clientId,
    payload: input.payload,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.userId)
    .setJti(jti)
    .setIssuer(CODE_ISSUER)
    .setIssuedAt()
    .setExpirationTime("90s")
    .sign(codeSecret());
  saveTicketSoon({
    jti,
    kind: "code",
    clientId: input.clientId,
    userId: input.userId,
    payload: input.payload,
    expiresAt,
  });
  return token;
}

async function consumeJwtCode(code: string): Promise<{
  clientId: string;
  userId: string;
  payload: Record<string, string>;
} | null> {
  if (!code.includes(".")) return null;
  try {
    const { payload } = await jwtVerify(code, codeSecret(), { issuer: CODE_ISSUER });
    const jti = typeof payload.jti === "string" ? payload.jti : "";
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    const clientId = typeof payload.clientId === "string" ? payload.clientId : "";
    const inner =
      payload.payload && typeof payload.payload === "object"
        ? (payload.payload as Record<string, string>)
        : null;
    if (!jti || !userId || !clientId || !inner) return null;
    if (redeemedCodes().has(jti)) return null;
    redeemedCodes().add(jti);
    const mem = memoryStore().get(jti);
    if (mem) mem.consumed = true;
    if (isDatabaseConfigured()) {
      void (async () => {
        try {
          const db = getDb();
          await db.update(oauthTickets).set({ consumedAt: new Date() }).where(eq(oauthTickets.jti, jti));
        } catch {
          /* ignore */
        }
      })();
    }
    return { clientId, userId, payload: inner };
  } catch {
    return null;
  }
}

export async function consumeTicket(
  jti: string,
  kind: TicketKind,
): Promise<{
  clientId: string;
  userId: string;
  payload: Record<string, string>;
} | null> {
  if (kind === "code") {
    const fromJwt = await consumeJwtCode(jti);
    if (fromJwt) return fromJwt;
  }

  const mem = memoryStore().get(jti);
  if (mem && mem.kind === kind && !mem.consumed && mem.expiresAt > Date.now()) {
    mem.consumed = true;
    return {
      clientId: mem.clientId,
      userId: mem.userId,
      payload: JSON.parse(mem.payload) as Record<string, string>,
    };
  }

  const now = new Date();
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const rows = await db.select().from(oauthTickets).where(eq(oauthTickets.jti, jti)).limit(1);
      const row = rows[0];
      if (!row || row.kind !== kind || row.consumedAt || row.expiresAt <= now) return null;
      await db.update(oauthTickets).set({ consumedAt: now }).where(eq(oauthTickets.jti, jti));
      return {
        clientId: row.clientId,
        userId: row.userId,
        payload: JSON.parse(row.payload) as Record<string, string>,
      };
    } catch {
      return null;
    }
  }
  return null;
}
