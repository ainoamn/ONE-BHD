import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { appCatalog } from "../../../db/schema";
import { DEFAULT_IDENTITY_ISSUER } from "../identity/issuer";
import { BHD_APPS, type BhdApp, type BhdAppMode } from "./apps";

const LOGO_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_BYTES = 512 * 1024;

function ssoStart(origin: string, workspacePath: string) {
  const path = workspacePath.startsWith("/") ? workspacePath : `/${workspacePath}`;
  return `${origin.replace(/\/$/, "")}/api/auth/bhd/start?returnTo=${encodeURIComponent(path)}`;
}

function logoPublicUrl(id: string, hasLogo: boolean) {
  if (!hasLogo) return null;
  return `${DEFAULT_IDENTITY_ISSUER}/api/bhd/icons/${encodeURIComponent(id)}`;
}

function rowToApp(row: typeof appCatalog.$inferSelect): BhdApp {
  return {
    id: row.id,
    clientId: row.clientId,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    origin: row.origin,
    workspacePath: row.workspacePath,
    homePath: row.homePath,
    startUrl: row.startUrl,
    mode: (row.mode as BhdAppMode) || "sso",
    enabled: row.enabled,
    mark: row.mark,
    accent: row.accent,
    soft: row.soft,
    logoUrl: logoPublicUrl(row.id, Boolean(row.logoContent && row.logoMime)),
    sortOrder: row.sortOrder,
  };
}

async function seedIfNeeded() {
  const db = getDb();
  const existing = await db.select({ id: appCatalog.id }).from(appCatalog);
  const have = new Set(existing.map((row) => row.id));
  const missing = BHD_APPS.filter((app) => !have.has(app.id));
  if (!missing.length) return;
  await db.insert(appCatalog).values(
    missing.map((app) => ({
      id: app.id,
      clientId: app.clientId,
      nameAr: app.nameAr,
      nameEn: app.nameEn,
      origin: app.origin,
      workspacePath: app.workspacePath,
      homePath: app.homePath,
      startUrl: app.startUrl,
      mode: app.mode,
      enabled: app.enabled,
      mark: app.mark,
      accent: app.accent,
      soft: app.soft,
      sortOrder: Math.max(0, BHD_APPS.findIndex((item) => item.id === app.id)),
    })),
  );
}

export async function listLiveApps(): Promise<BhdApp[]> {
  if (!isDatabaseConfigured()) return BHD_APPS;
  try {
    await ensureIdentitySchema();
    await seedIfNeeded();
    const rows = await getDb().select().from(appCatalog).orderBy(asc(appCatalog.sortOrder), asc(appCatalog.nameAr));
    if (!rows.length) return BHD_APPS;
    return rows.map(rowToApp);
  } catch {
    return BHD_APPS;
  }
}

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

function normalizePath(value: string) {
  const path = (value || "/").trim() || "/";
  return path.startsWith("/") ? path.slice(0, 120) : `/${path.slice(0, 119)}`;
}

function normalizeColor(value: string, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

function normalizeOrigin(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("ORIGIN_MUST_BE_HTTPS");
  }
  return `${url.protocol}//${url.host}`;
}

export type CatalogPatch = {
  nameAr?: string;
  nameEn?: string;
  origin?: string;
  workspacePath?: string;
  homePath?: string;
  mode?: BhdAppMode;
  enabled?: boolean;
  mark?: string;
  accent?: string;
  soft?: string;
  sortOrder?: number;
  clientId?: string | null;
};

export async function upsertLiveApp(input: CatalogPatch & { id: string; create?: boolean }) {
  await ensureIdentitySchema();
  const db = getDb();
  const id = normalizeId(input.id);
  if (!id) throw new Error("INVALID_ID");

  const current = (await db.select().from(appCatalog).where(eq(appCatalog.id, id)).limit(1))[0];
  if (!current && !input.create) throw new Error("NOT_FOUND");

  const origin = input.origin ? normalizeOrigin(input.origin) : current?.origin || "";
  if (!origin) throw new Error("INVALID_ORIGIN");
  const workspacePath = input.workspacePath != null ? normalizePath(input.workspacePath) : current?.workspacePath || "/";
  const homePath = input.homePath != null ? normalizePath(input.homePath) : current?.homePath || "/";
  const mode = input.mode || (current?.mode as BhdAppMode) || "sso";
  const startUrl = mode === "identity" ? null : ssoStart(origin, workspacePath);
  const values = {
    id,
    clientId: input.clientId === undefined ? current?.clientId || (id === "account" ? null : `bhd-${id}`) : input.clientId,
    nameAr: (input.nameAr ?? current?.nameAr ?? id).trim().slice(0, 80),
    nameEn: (input.nameEn ?? current?.nameEn ?? id).trim().slice(0, 80),
    origin,
    workspacePath,
    homePath,
    startUrl,
    mode,
    enabled: input.enabled ?? current?.enabled ?? true,
    mark: (input.mark ?? current?.mark ?? "B").trim().slice(0, 4) || "B",
    accent: normalizeColor(input.accent ?? current?.accent ?? "#075c45", "#075c45"),
    soft: normalizeColor(input.soft ?? current?.soft ?? "#e6f1ec", "#e6f1ec"),
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : current?.sortOrder ?? 99,
    updatedAt: new Date(),
  };
  if (!values.nameAr || !values.nameEn) throw new Error("INVALID_NAME");

  if (current) {
    await db.update(appCatalog).set(values).where(eq(appCatalog.id, id));
  } else {
    await db.insert(appCatalog).values(values);
  }
  const saved = (await db.select().from(appCatalog).where(eq(appCatalog.id, id)).limit(1))[0];
  return rowToApp(saved);
}

export async function saveLiveAppLogo(id: string, file: { mime: string; bytes: Buffer }) {
  await ensureIdentitySchema();
  const key = normalizeId(id);
  if (!LOGO_MIME.has(file.mime)) throw new Error("INVALID_FILE_TYPE");
  if (!file.bytes.length || file.bytes.length > MAX_LOGO_BYTES) throw new Error("FILE_TOO_LARGE");
  const db = getDb();
  const current = (await db.select({ id: appCatalog.id }).from(appCatalog).where(eq(appCatalog.id, key)).limit(1))[0];
  if (!current) throw new Error("NOT_FOUND");
  await db
    .update(appCatalog)
    .set({
      logoMime: file.mime,
      logoContent: file.bytes.toString("base64"),
      updatedAt: new Date(),
    })
    .where(eq(appCatalog.id, key));
  return listLiveApps().then((apps) => apps.find((app) => app.id === key)!);
}

export async function clearLiveAppLogo(id: string) {
  await ensureIdentitySchema();
  const key = normalizeId(id);
  await getDb()
    .update(appCatalog)
    .set({ logoMime: null, logoContent: null, updatedAt: new Date() })
    .where(eq(appCatalog.id, key));
}

export async function readLiveAppLogo(id: string) {
  if (!isDatabaseConfigured()) return null;
  await ensureIdentitySchema();
  const key = normalizeId(id);
  const row = (await getDb().select().from(appCatalog).where(eq(appCatalog.id, key)).limit(1))[0];
  if (!row?.logoContent || !row.logoMime) return null;
  return { mime: row.logoMime, bytes: Buffer.from(row.logoContent, "base64") };
}
