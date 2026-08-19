import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "../../../db";
import { contacts, users, type BhdUser } from "../../../db/schema";
import { IDENTITY_CLIENTS } from "../identity/clients";
import { requireDatabase } from "./users";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  picture: string | null;
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

function toAdminUser(user: BhdUser): AdminUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    picture: user.avatar,
    googleLinked: Boolean(user.googleId),
    facebookLinked: Boolean(user.facebookId),
    hasPassword: Boolean(user.passwordHash),
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listAdminUsers(query = "", limit = 200): Promise<AdminUserRow[]> {
  requireDatabase();
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

  return rows.map(toAdminUser);
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
      clients,
    };
  }

  const db = getDb();
  const [userStats] = await db
    .select({
      users: sql<number>`count(*)::int`,
      activeUsers: sql<number>`count(*) filter (where ${users.isActive})::int`,
      googleUsers: sql<number>`count(*) filter (where ${users.googleId} is not null)::int`,
      facebookUsers: sql<number>`count(*) filter (where ${users.facebookId} is not null)::int`,
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
    clients,
  };
}
