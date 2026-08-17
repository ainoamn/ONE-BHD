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
