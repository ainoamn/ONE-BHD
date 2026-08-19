import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * BHD portal identity — modeled after HISAB users + contacts,
 * without ERP company tenancy. The portal account is the BHD identity.
 */

export const contactTypeEnum = pgEnum("contact_type", ["SELF", "PERSON", "COMPANY"]);

export const users = pgTable("bhd_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  /** Null for Google-only accounts */
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  avatar: text("avatar"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  mustCompleteProfile: boolean("must_complete_profile").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Address book / profile directory (HISAB Contact style).
 * SELF = the user's own profile card; PERSON/COMPANY = saved contacts.
 */
export const contacts = pgTable("bhd_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: contactTypeEnum("type").notNull().default("PERSON"),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  email: text("email"),
  phone: text("phone"),
  phone2: text("phone_2"),
  whatsapp: text("whatsapp"),
  fax: text("fax"),
  taxId: text("tax_id"),
  crNumber: text("cr_number"),
  address: text("address"),
  city: text("city"),
  country: text("country").notNull().default("OM"),
  zipCode: text("zip_code"),
  website: text("website"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One-time OAuth codes and refresh tickets (jti), hashed/consumed in identity. */
export const oauthTickets = pgTable("bhd_oauth_tickets", {
  jti: text("jti").primaryKey(),
  kind: text("kind").notNull(),
  clientId: text("client_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  payload: text("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BhdUser = typeof users.$inferSelect;
export type NewBhdUser = typeof users.$inferInsert;
export type BhdContact = typeof contacts.$inferSelect;
export type NewBhdContact = typeof contacts.$inferInsert;
export type BhdOauthTicket = typeof oauthTickets.$inferSelect;
