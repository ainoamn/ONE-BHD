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
    });
  }
  if (!globalThis.__bhdPortalDb) {
    globalThis.__bhdPortalDb = drizzle(globalThis.__bhdPortalSql, { schema });
  }
  return globalThis.__bhdPortalDb;
}
