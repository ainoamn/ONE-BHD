import { and, eq, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { contacts, users, oauthTickets, type BhdContact, type BhdUser } from "../../../db/schema";
import { hashPassword, isStrongPassword, verifyPassword } from "./passwords";
import { isPlatformAdminEmail } from "./platform-admin";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  picture: string | null;
  emailVerified: boolean;
  mustCompleteProfile: boolean;
};

export type RegisterInput = {
  name: string;
  email: string;
  username?: string;
  password: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  signupIp?: string | null;
};

export type LoginMeta = {
  ip?: string | null;
};

export function requireDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL_MISSING");
  }
}

export function toPublicUser(user: BhdUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    gender: user.gender,
    birthDate: user.birthDate,
    picture: user.avatar,
    emailVerified: user.emailVerified,
    mustCompleteProfile: user.mustCompleteProfile,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username?: string) {
  const value = username?.trim().toLowerCase() || "";
  return value || null;
}

function assertUnlocked(user: BhdUser) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error("ACCOUNT_LOCKED");
  }
  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }
}

async function findUserByEmailOrUsername(emailOrUsername: string): Promise<BhdUser | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.email, emailOrUsername), eq(users.username, emailOrUsername)))
    .limit(1);
  return rows[0];
}

async function findUserByFacebookOrEmail(facebookId: string, email: string): Promise<BhdUser | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.facebookId, facebookId), eq(users.email, email)))
    .limit(1);
  return rows[0];
}

async function findUserByGoogleOrEmail(googleId: string, email: string): Promise<BhdUser | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.googleId, googleId), eq(users.email, email)))
    .limit(1);
  return rows[0];
}

async function ensureSelfContact(
  ownerUserId: string,
  data: {
    name: string;
    email: string;
    phone?: string | null;
    phone2?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    city?: string | null;
    hometown?: string | null;
    country?: string | null;
    zipCode?: string | null;
  },
  fillEmptyOnly = false,
): Promise<BhdContact> {
  const db = getDb();
  const existingRows = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.ownerUserId, ownerUserId), eq(contacts.type, "SELF")))
    .limit(1);
  const existing = existingRows[0];

  const pick = <T,>(incoming: T | undefined, current: T) => {
    if (incoming === undefined) return current;
    if (fillEmptyOnly) return current || incoming;
    return incoming;
  };

  if (existing) {
    const [updated] = await db
      .update(contacts)
      .set({
        name: data.name,
        email: data.email,
        phone: pick(data.phone, existing.phone),
        phone2: pick(data.phone2, existing.phone2),
        whatsapp: pick(data.whatsapp, existing.whatsapp),
        address: pick(data.address, existing.address),
        city: pick(data.city, existing.city),
        hometown: pick(data.hometown, existing.hometown),
        country: data.country || existing.country || "OM",
        zipCode: pick(data.zipCode, existing.zipCode),
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(contacts)
    .values({
      ownerUserId,
      type: "SELF",
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      phone2: data.phone2 || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      city: data.city || null,
      hometown: data.hometown || null,
      country: data.country || "OM",
      zipCode: data.zipCode || null,
    })
    .returning();
  return created;
}

export async function registerWithPassword(input: RegisterInput): Promise<PublicUser> {
  requireDatabase();
  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);
  const name = input.name.trim();

  if (!name || !email || !input.password) {
    throw new Error("INVALID_INPUT");
  }
  if (!isStrongPassword(input.password)) {
    throw new Error("WEAK_PASSWORD");
  }
  if (username && !/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new Error("INVALID_USERNAME");
  }

  const db = getDb();
  const existing = username
    ? await findUserByEmailOrUsername(email).then(
        async (byEmail) => byEmail ?? (await findUserByEmailOrUsername(username)),
      )
    : await findUserByEmailOrUsername(email);
  if (existing) {
    throw new Error("EMAIL_OR_USERNAME_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      username,
      passwordHash,
      phone: input.phone?.trim() || null,
      emailVerified: false,
      mustCompleteProfile: !(input.phone && input.city),
      lastLoginAt: new Date(),
      lastLoginIp: input.signupIp || null,
      signupIp: input.signupIp || null,
      updatedAt: new Date(),
    })
    .returning();

  await ensureSelfContact(user.id, {
    name,
    email,
    phone: input.phone,
    phone2: input.phone2,
    whatsapp: input.whatsapp,
    address: input.address,
    city: input.city,
    country: input.country || "OM",
    zipCode: input.zipCode,
  });

  return toPublicUser(user);
}

export async function loginWithPassword(
  identifier: string,
  password: string,
  meta?: LoginMeta,
): Promise<PublicUser> {
  requireDatabase();
  const raw = identifier.trim().toLowerCase();
  if (!raw || !password) throw new Error("INVALID_INPUT");

  const db = getDb();
  const user = await findUserByEmailOrUsername(raw);
  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  assertUnlocked(user);

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const attempts = user.loginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null;
    await db
      .update(users)
      .set({
        loginAttempts: attempts,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    throw new Error(lockedUntil ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS");
  }

  const ip = meta?.ip?.trim() || null;
  const [updated] = await db
    .update(users)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      ...(ip ? { lastLoginIp: ip } : {}),
      updatedAt: new Date(),
      ...(isPlatformAdminEmail(user.email) ? { emailVerified: true } : {}),
    })
    .where(eq(users.id, user.id))
    .returning();

  return toPublicUser(updated);
}

export async function loginOrRegisterWithGoogle(input: {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
  ip?: string | null;
}): Promise<PublicUser> {
  requireDatabase();
  const email = normalizeEmail(input.email);
  const db = getDb();
  const ip = input.ip?.trim() || null;

  let user = await findUserByGoogleOrEmail(input.googleId, email);

  if (user) {
    assertUnlocked(user);
    const [updated] = await db
      .update(users)
      .set({
        googleId: input.googleId,
        name: input.name || user.name,
        avatar: input.picture || user.avatar,
        emailVerified: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        ...(ip ? { lastLoginIp: ip } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    user = updated;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: input.name,
        email,
        googleId: input.googleId,
        avatar: input.picture,
        emailVerified: true,
        mustCompleteProfile: true,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        signupIp: ip,
        updatedAt: new Date(),
      })
      .returning();
    user = created;
  }

  await ensureSelfContact(user.id, {
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  return toPublicUser(user);
}

export async function loginOrRegisterWithFacebook(input: {
  facebookId: string;
  email: string;
  name: string;
  picture: string | null;
  gender: string | null;
  birthDate: string | null;
  city: string | null;
  hometown: string | null;
  ip?: string | null;
}): Promise<PublicUser> {
  requireDatabase();
  await ensureIdentitySchema();
  const email = normalizeEmail(input.email);
  const db = getDb();
  const ip = input.ip?.trim() || null;

  let user = await findUserByFacebookOrEmail(input.facebookId, email);

  if (user) {
    assertUnlocked(user);
    const [updated] = await db
      .update(users)
      .set({
        facebookId: input.facebookId,
        name: input.name || user.name,
        avatar: input.picture || user.avatar,
        gender: user.gender || input.gender,
        birthDate: user.birthDate || input.birthDate,
        emailVerified: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        ...(ip ? { lastLoginIp: ip } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    user = updated;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: input.name,
        email,
        facebookId: input.facebookId,
        avatar: input.picture,
        gender: input.gender,
        birthDate: input.birthDate,
        emailVerified: true,
        mustCompleteProfile: true,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        signupIp: ip,
        updatedAt: new Date(),
      })
      .returning();
    user = created;
  }

  await ensureSelfContact(
    user.id,
    {
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: input.city,
      hometown: input.hometown,
    },
    true,
  );

  return toPublicUser(user);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ? toPublicUser(rows[0]) : null;
}

export type AccountProfile = PublicUser & {
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AccountContact = {
  phone2: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  hometown: string | null;
  country: string | null;
  zipCode: string | null;
};

export async function getAccountProfile(id: string): Promise<{
  user: AccountProfile;
  contact: AccountContact | null;
} | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureIdentitySchema();
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = rows[0];
  if (!user) return null;
  const contact = await getSelfContact(user.id);
  return {
    user: {
      ...toPublicUser(user),
      googleLinked: Boolean(user.googleId),
      facebookLinked: Boolean(user.facebookId),
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    },
    contact: contact
      ? {
          phone2: contact.phone2,
          whatsapp: contact.whatsapp,
          address: contact.address,
          city: contact.city,
          hometown: contact.hometown,
          country: contact.country,
          zipCode: contact.zipCode,
        }
      : null,
  };
}

export async function listLinkedClientIds(userId: string): Promise<string[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const db = getDb();
    const rows = await db
      .select({ clientId: oauthTickets.clientId })
      .from(oauthTickets)
      .where(eq(oauthTickets.userId, userId));
    return [...new Set(rows.map((row) => row.clientId))];
  } catch {
    return [];
  }
}

/** Record SSO / portal activity IP without changing credentials. */
export async function touchUserLogin(userId: string, meta?: LoginMeta): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const ip = meta?.ip?.trim() || null;
  const db = getDb();
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      ...(ip ? { lastLoginIp: ip } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateOwnProfile(
  userId: string,
  input: {
    name?: string;
    username?: string | null;
    phone?: string | null;
    gender?: string | null;
    birthDate?: string | null;
    phone2?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    city?: string | null;
    hometown?: string | null;
    country?: string | null;
    zipCode?: string | null;
    currentPassword?: string;
    newPassword?: string;
  },
): Promise<PublicUser> {
  requireDatabase();
  await ensureIdentitySchema();
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) throw new Error("NOT_FOUND");

  const name = input.name !== undefined ? input.name.trim() : user.name;
  if (!name) throw new Error("INVALID_INPUT");

  let username = user.username;
  if (input.username !== undefined) {
    username = normalizeUsername(input.username || undefined);
    if (username && !/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new Error("INVALID_USERNAME");
    }
    if (username && username !== user.username) {
      const taken = await findUserByEmailOrUsername(username);
      if (taken && taken.id !== user.id) throw new Error("EMAIL_OR_USERNAME_TAKEN");
    }
  }

  let passwordHash = user.passwordHash;
  if (input.newPassword) {
    if (!isStrongPassword(input.newPassword)) throw new Error("WEAK_PASSWORD");
    if (user.passwordHash) {
      if (!input.currentPassword) throw new Error("INVALID_CREDENTIALS");
      const ok = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!ok) throw new Error("INVALID_CREDENTIALS");
    }
    passwordHash = await hashPassword(input.newPassword);
  }

  const phone = input.phone !== undefined ? input.phone?.trim() || null : user.phone;
  const gender = input.gender !== undefined ? input.gender?.trim() || null : user.gender;
  const birthDate = input.birthDate !== undefined ? input.birthDate?.trim() || null : user.birthDate;

  const [updated] = await db
    .update(users)
    .set({
      name,
      username,
      phone,
      gender,
      birthDate,
      passwordHash,
      mustCompleteProfile: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning();

  await ensureSelfContact(updated.id, {
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    phone2: input.phone2,
    whatsapp: input.whatsapp,
    address: input.address,
    city: input.city,
    hometown: input.hometown,
    country: input.country || "OM",
    zipCode: input.zipCode,
  });

  return toPublicUser(updated);
}

export async function getSelfContact(userId: string): Promise<BhdContact | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.ownerUserId, userId), eq(contacts.type, "SELF")))
    .limit(1);
  return rows[0] ?? null;
}

export async function databaseHealth(): Promise<{ ok: boolean; users?: number }> {
  if (!isDatabaseConfigured()) return { ok: false };
  try {
    const db = getDb();
    const result = await db.execute(sql`select count(*)::int as count from bhd_users`);
    const rows = result as unknown as Array<{ count: number }>;
    return { ok: true, users: Number(rows[0]?.count ?? 0) };
  } catch {
    return { ok: false };
  }
}
