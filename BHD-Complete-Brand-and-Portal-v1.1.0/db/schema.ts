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
  nameAr: text("name_ar"),
  nameEn: text("name_en"),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  /** Null for Google-only accounts */
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  avatar: text("avatar"),
  phone: text("phone"),
  gender: text("gender"),
  birthDate: text("birth_date"),
  nationality: text("nationality"),
  civilId: text("civil_id"),
  civilIdExpires: text("civil_id_expires"),
  passportNumber: text("passport_number"),
  passportExpires: text("passport_expires"),
  accountKind: text("account_kind").notNull().default("person"),
  companyNameAr: text("company_name_ar"),
  companyNameEn: text("company_name_en"),
  crNumber: text("cr_number"),
  crExpires: text("cr_expires"),
  taxId: text("tax_id"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  mustCompleteProfile: boolean("must_complete_profile").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIp: text("last_login_ip"),
  signupIp: text("signup_ip"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  securityHold: boolean("security_hold").notNull().default(false),
  securityHoldAt: timestamp("security_hold_at", { withTimezone: true }),
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
  hometown: text("hometown"),
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

/**
 * OAuth clients registered from /admin (beyond the frozen IDENTITY_CLIENTS list).
 * Enables linking a new product without editing code — after the product implements start/callback.
 */
export const registeredClients = pgTable("bhd_oauth_clients", {
  clientId: text("client_id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  workspacePath: text("workspace_path").notNull().default("/"),
  redirectUris: text("redirect_uris").notNull(),
  postLogoutRedirectUris: text("post_logout_redirect_uris").notNull(),
  clientSecret: text("client_secret").notNull(),
  mode: text("mode").notNull().default("browse"),
  enabled: boolean("enabled").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Editable copy for transactional identity emails (admin-managed). */
export const userFiles = pgTable("bhd_user_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginEvents = pgTable("bhd_login_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  email: text("email"),
  ip: text("ip"),
  country: text("country"),
  userAgent: text("user_agent"),
  ok: boolean("ok").notNull().default(false),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ipBlocks = pgTable("bhd_ip_blocks", {
  ip: text("ip").primaryKey(),
  until: timestamp("until", { withTimezone: true }).notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const recoveryChallenges = pgTable("bhd_recovery_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  emailCodeHash: text("email_code_hash").notNull(),
  whatsappCodeHash: text("whatsapp_code_hash"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  whatsappVerified: boolean("whatsapp_verified").notNull().default(false),
  whatsappPending: boolean("whatsapp_pending").notNull().default(true),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailTemplates = pgTable("bhd_email_templates", {
  kind: text("kind").primaryKey(),
  subject: text("subject").notNull(),
  headline: text("headline").notNull(),
  body: text("body").notNull(),
  cta: text("cta").notNull(),
  footnote: text("footnote").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BhdUser = typeof users.$inferSelect;
export type NewBhdUser = typeof users.$inferInsert;
export type BhdContact = typeof contacts.$inferSelect;
export type NewBhdContact = typeof contacts.$inferInsert;
export type BhdOauthTicket = typeof oauthTickets.$inferSelect;
export type BhdRegisteredClient = typeof registeredClients.$inferSelect;
export type BhdUserFile = typeof userFiles.$inferSelect;
