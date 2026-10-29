import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __bhdPortalDb: Db | undefined;
  // eslint-disable-next-line no-var
  var __bhdPortalSql: ReturnType<typeof postgres> | undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql() {
  getDb();
  if (!globalThis.__bhdPortalSql) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return globalThis.__bhdPortalSql;
}

let schemaReady: Promise<void> | null = null;

/** Adds identity columns that older Neon databases may still lack. */
export async function ensureIdentitySchema(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS facebook_id text`);
      await getSql().unsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS bhd_users_facebook_id_key ON bhd_users (facebook_id)`,
      );
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS gender text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS birth_date text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS last_login_ip text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS signup_ip text`);
      await getSql().unsafe(`ALTER TABLE bhd_contacts ADD COLUMN IF NOT EXISTS hometown text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS name_ar text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS name_en text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS nationality text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS civil_id text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS civil_id_expires text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS passport_number text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS passport_expires text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS account_kind text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS company_name_ar text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS company_name_en text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS cr_number text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS cr_expires text`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS tax_id text`);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_user_files (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES bhd_users(id) ON DELETE CASCADE,
          kind text NOT NULL,
          filename text NOT NULL,
          mime text NOT NULL,
          content text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS bhd_user_files_user_kind ON bhd_user_files (user_id, kind)`,
      );
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS security_hold boolean NOT NULL DEFAULT false`);
      await getSql().unsafe(`ALTER TABLE bhd_users ADD COLUMN IF NOT EXISTS security_hold_at timestamptz`);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_login_events (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid,
          email text,
          ip text,
          country text,
          user_agent text,
          ok boolean NOT NULL DEFAULT false,
          reason text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(`CREATE INDEX IF NOT EXISTS bhd_login_events_created ON bhd_login_events (created_at DESC)`);
      await getSql().unsafe(`CREATE INDEX IF NOT EXISTS bhd_login_events_ip ON bhd_login_events (ip, created_at DESC)`);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_ip_blocks (
          ip text PRIMARY KEY,
          until timestamptz NOT NULL,
          reason text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_recovery_challenges (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES bhd_users(id) ON DELETE CASCADE,
          email_code_hash text NOT NULL,
          whatsapp_code_hash text,
          expires_at timestamptz NOT NULL,
          email_verified boolean NOT NULL DEFAULT false,
          whatsapp_verified boolean NOT NULL DEFAULT false,
          whatsapp_pending boolean NOT NULL DEFAULT true,
          consumed_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_oauth_clients (
          client_id text PRIMARY KEY,
          name text NOT NULL,
          origin text NOT NULL,
          workspace_path text NOT NULL DEFAULT '/',
          redirect_uris text NOT NULL,
          post_logout_redirect_uris text NOT NULL,
          client_secret text NOT NULL,
          mode text NOT NULL DEFAULT 'browse',
          enabled boolean NOT NULL DEFAULT true,
          notes text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_app_catalog (
          id text PRIMARY KEY,
          client_id text,
          name_ar text NOT NULL,
          name_en text NOT NULL,
          origin text NOT NULL,
          workspace_path text NOT NULL DEFAULT '/',
          home_path text NOT NULL DEFAULT '/',
          start_url text,
          mode text NOT NULL DEFAULT 'sso',
          enabled boolean NOT NULL DEFAULT true,
          mark text NOT NULL DEFAULT 'B',
          accent text NOT NULL DEFAULT '#075c45',
          soft text NOT NULL DEFAULT '#e6f1ec',
          logo_mime text,
          logo_content text,
          sort_order integer NOT NULL DEFAULT 0,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await getSql().unsafe(`
        CREATE TABLE IF NOT EXISTS bhd_email_templates (
          kind text PRIMARY KEY,
          subject text NOT NULL,
          headline text NOT NULL,
          body text NOT NULL,
          cta text NOT NULL,
          footnote text NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export function getDb(): Db {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Add a PostgreSQL URL (Neon / Vercel Postgres / Supabase) to enable BHD accounts.",
    );
  }

  if (!globalThis.__bhdPortalSql) {
    globalThis.__bhdPortalSql = postgres(url, {
      max: 1,
      prepare: false,
      connect_timeout: 8,
      idle_timeout: 20,
    });
  }
  if (!globalThis.__bhdPortalDb) {
    globalThis.__bhdPortalDb = drizzle(globalThis.__bhdPortalSql, { schema });
  }
  return globalThis.__bhdPortalDb;
}
