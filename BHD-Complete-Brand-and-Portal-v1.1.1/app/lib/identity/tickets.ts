import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "../../../db";
import { oauthTickets } from "../../../db/schema";

type TicketKind = "code" | "refresh";

type MemoryTicket = {
  kind: TicketKind;
  clientId: string;
  userId: string;
  payload: string;
  expiresAt: number;
  consumed: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __bhdOauthMemory: Map<string, MemoryTicket> | undefined;
}

function memoryStore() {
  if (!globalThis.__bhdOauthMemory) {
    globalThis.__bhdOauthMemory = new Map();
  }
  return globalThis.__bhdOauthMemory;
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
  if (isDatabaseConfigured()) {
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
      return;
    } catch {
      // Table may not exist yet; fall back to process memory.
    }
  }
  memoryStore().set(input.jti, {
    kind: input.kind,
    clientId: input.clientId,
    userId: input.userId,
    payload,
    expiresAt: input.expiresAt.getTime(),
    consumed: false,
  });
}

export async function consumeTicket(jti: string, kind: TicketKind): Promise<{
  clientId: string;
  userId: string;
  payload: Record<string, string>;
} | null> {
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
      // fall through to memory
    }
  }
  const mem = memoryStore().get(jti);
  if (!mem || mem.kind !== kind || mem.consumed || mem.expiresAt <= Date.now()) return null;
  mem.consumed = true;
  return {
    clientId: mem.clientId,
    userId: mem.userId,
    payload: JSON.parse(mem.payload) as Record<string, string>,
  };
}
