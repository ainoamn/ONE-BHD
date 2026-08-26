import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { contacts, oauthTickets, users, type BhdUser } from "../../../db/schema";
import { IDENTITY_CLIENTS } from "../identity/clients";
import { issueEmailVerification, isResendConfigured } from "./email-verification";
import { issuePasswordReset } from "./password-reset";
import { requireDatabase } from "./users";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  picture: string | null;
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  signupIp: string | null;
  createdAt: string;
  updatedAt: string;
  linkedApps: number;
};

export type AdminAppLink = {
  clientId: string;
  name: string;
  origin: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  ticketCount: number;
};

export type AdminUserDetail = AdminUserRow & {
  contact: {
    phone2: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    hometown: string | null;
    country: string | null;
    zipCode: string | null;
  } | null;
  apps: AdminAppLink[];
};

function clientMeta(clientId: string) {
  const client = IDENTITY_CLIENTS.find((row) => row.clientId === clientId);
  const production = client?.redirectUris.find((uri) => uri.startsWith("https://"));
  let origin: string | null = null;
  try {
    origin = production ? new URL(production).origin : null;
  } catch {
    origin = null;
  }
  return {
    name: client?.name || clientId,
    origin,
  };
}

function toAdminUser(user: BhdUser, linkedApps = 0): AdminUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    gender: user.gender,
    birthDate: user.birthDate,
    picture: user.avatar,
    googleLinked: Boolean(user.googleId),
    facebookLinked: Boolean(user.facebookId),
    hasPassword: Boolean(user.passwordHash),
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    lockedUntil: user.lockedUntil ? user.lockedUntil.toISOString() : null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    lastLoginIp: user.lastLoginIp,
    signupIp: user.signupIp,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    linkedApps,
  };
}

export async function listAdminUsers(query = "", limit = 200): Promise<AdminUserRow[]> {
  requireDatabase();
  await ensureIdentitySchema();
  const db = getDb();
  const needle = query.trim().slice(0, 80);
  const rows = needle
    ? await db
        .select()
        .from(users)
        .where(
          or(
            ilike(users.email, `%${needle}%`),
            ilike(users.name, `%${needle}%`),
            ilike(users.username, `%${needle}%`),
          ),
        )
        .orderBy(desc(users.createdAt))
        .limit(Math.min(Math.max(limit, 1), 500))
    : await db.select().from(users).orderBy(desc(users.createdAt)).limit(Math.min(Math.max(limit, 1), 500));

  if (rows.length === 0) return [];

  const countMap = new Map<string, number>();
  try {
    const allCounts = await db
      .select({
        userId: oauthTickets.userId,
        linkedApps: sql<number>`count(distinct ${oauthTickets.clientId})::int`,
      })
      .from(oauthTickets)
      .groupBy(oauthTickets.userId);
    for (const row of allCounts) {
      countMap.set(row.userId, Number(row.linkedApps || 0));
    }
  } catch {
    /* oauth table may be empty */
  }

  return rows.map((row) => toAdminUser(row, countMap.get(row.id) || 0));
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  requireDatabase();
  await ensureIdentitySchema();
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [self] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.ownerUserId, user.id), eq(contacts.type, "SELF")))
    .limit(1);

  const appRows = await db
    .select({
      clientId: oauthTickets.clientId,
      firstSeenAt: sql<Date>`min(${oauthTickets.createdAt})`,
      lastSeenAt: sql<Date>`max(${oauthTickets.createdAt})`,
      ticketCount: sql<number>`count(*)::int`,
    })
    .from(oauthTickets)
    .where(eq(oauthTickets.userId, user.id))
    .groupBy(oauthTickets.clientId)
    .orderBy(sql`max(${oauthTickets.createdAt}) desc`);

  const apps: AdminAppLink[] = appRows.map((row) => {
    const meta = clientMeta(row.clientId);
    return {
      clientId: row.clientId,
      name: meta.name,
      origin: meta.origin,
      firstSeenAt: new Date(row.firstSeenAt).toISOString(),
      lastSeenAt: new Date(row.lastSeenAt).toISOString(),
      ticketCount: Number(row.ticketCount || 0),
    };
  });

  return {
    ...toAdminUser(user, apps.length),
    contact: self
      ? {
          phone2: self.phone2,
          whatsapp: self.whatsapp,
          address: self.address,
          city: self.city,
          hometown: self.hometown,
          country: self.country,
          zipCode: self.zipCode,
        }
      : null,
    apps,
  };
}

export async function setUserActive(userId: string, isActive: boolean): Promise<AdminUserRow | null> {
  requireDatabase();
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      isActive,
      ...(isActive ? { loginAttempts: 0, lockedUntil: null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated ? toAdminUser(updated) : null;
}

export async function setUserEmailVerified(userId: string, emailVerified: boolean): Promise<AdminUserRow | null> {
  requireDatabase();
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      emailVerified,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated ? toAdminUser(updated) : null;
}

/** Permanent delete — contacts and oauth tickets cascade. */
export async function deleteAdminUser(userId: string): Promise<boolean> {
  requireDatabase();
  await ensureIdentitySchema();
  const db = getDb();
  const deleted = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  return deleted.length > 0;
}

export async function adminResendVerification(userId: string, request?: Request) {
  requireDatabase();
  if (!isResendConfigured()) throw new Error("RESEND_NOT_CONFIGURED");
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("NOT_FOUND");
  if (user.emailVerified) throw new Error("ALREADY_VERIFIED");
  await issueEmailVerification(user.id, user.email, request);
  return { email: user.email };
}

export async function adminSendPasswordReset(userId: string, request?: Request) {
  requireDatabase();
  if (!isResendConfigured()) throw new Error("RESEND_NOT_CONFIGURED");
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("NOT_FOUND");
  await issuePasswordReset(user.id, user.email, request);
  return { email: user.email };
}

export async function adminOverview() {
  const clients = IDENTITY_CLIENTS.map((client) => ({
    clientId: client.clientId,
    name: client.name,
    productionRedirects: client.redirectUris.filter((uri) => uri.startsWith("https://")),
  }));

  if (!isDatabaseConfigured()) {
    return {
      databaseOk: false,
      users: 0,
      activeUsers: 0,
      googleUsers: 0,
      facebookUsers: 0,
      contacts: 0,
      unverifiedUsers: 0,
      resendConfigured: isResendConfigured(),
      clients,
    };
  }

  await ensureIdentitySchema();
  const db = getDb();
  const [userStats] = await db
    .select({
      users: sql<number>`count(*)::int`,
      activeUsers: sql<number>`count(*) filter (where ${users.isActive})::int`,
      googleUsers: sql<number>`count(*) filter (where ${users.googleId} is not null)::int`,
      facebookUsers: sql<number>`count(*) filter (where ${users.facebookId} is not null)::int`,
      unverifiedUsers: sql<number>`count(*) filter (where not ${users.emailVerified})::int`,
    })
    .from(users);
  const [contactStats] = await db
    .select({
      contacts: sql<number>`count(*) filter (where ${contacts.type} = 'SELF')::int`,
    })
    .from(contacts);

  return {
    databaseOk: true,
    users: Number(userStats?.users ?? 0),
    activeUsers: Number(userStats?.activeUsers ?? 0),
    googleUsers: Number(userStats?.googleUsers ?? 0),
    facebookUsers: Number(userStats?.facebookUsers ?? 0),
    contacts: Number(contactStats?.contacts ?? 0),
    unverifiedUsers: Number(userStats?.unverifiedUsers ?? 0),
    resendConfigured: isResendConfigured(),
    clients,
  };
}
