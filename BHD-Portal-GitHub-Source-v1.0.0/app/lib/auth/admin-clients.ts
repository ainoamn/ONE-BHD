import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb, ensureIdentitySchema } from "../../../db";
import { registeredClients } from "../../../db/schema";
import { getStaticIdentityClient, listIdentityClients } from "../identity/clients";
import { requireDatabase } from "./users";

function normalizeClientId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function normalizeOrigin(value: string) {
  const raw = value.trim().replace(/\/$/, "");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("ORIGIN_MUST_BE_HTTPS");
  }
  return `${url.protocol}//${url.host}`;
}

function normalizePath(value: string) {
  const path = (value || "/").trim() || "/";
  return path.startsWith("/") ? path.slice(0, 120) : `/${path.slice(0, 119)}`;
}

function toJsonList(values: string[]) {
  return JSON.stringify([...new Set(values.map((item) => item.trim()).filter(Boolean))]);
}

export async function listRegisteredClientsAdmin() {
  requireDatabase();
  await ensureIdentitySchema();
  const all = await listIdentityClients();
  return all.map((client) => ({
    clientId: client.clientId,
    name: client.name,
    source: client.source || "static",
    origin: client.origin || null,
    workspacePath: client.workspacePath || null,
    mode: client.mode || (client.source === "static" ? "sso" : "browse"),
    redirectUris: client.redirectUris,
    postLogoutRedirectUris: client.postLogoutRedirectUris,
    enabled: true,
  }));
}

export async function registerOauthClient(input: {
  clientId: string;
  name: string;
  origin: string;
  workspacePath?: string;
  redirectUri: string;
  postLogoutUri?: string;
  mode?: "browse" | "sso";
  notes?: string;
}) {
  requireDatabase();
  await ensureIdentitySchema();
  const clientId = normalizeClientId(input.clientId);
  if (!clientId.startsWith("bhd-") || clientId.length < 6) {
    throw new Error("INVALID_CLIENT_ID");
  }
  if (getStaticIdentityClient(clientId)) {
    throw new Error("CLIENT_ID_RESERVED");
  }

  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("INVALID_NAME");

  const origin = normalizeOrigin(input.origin);
  const workspacePath = normalizePath(input.workspacePath || "/");
  const redirectUri = input.redirectUri.trim();
  new URL(redirectUri);
  if (!redirectUri.includes("/api/auth/bhd/callback") && !redirectUri.includes("/auth/")) {
    // soft guide — still allow custom paths for API backends
  }

  const postLogout = (input.postLogoutUri || `${origin}/`).trim();
  new URL(postLogout);

  const db = getDb();
  const existing = await db.select().from(registeredClients).where(eq(registeredClients.clientId, clientId)).limit(1);
  if (existing[0]) throw new Error("CLIENT_EXISTS");

  const clientSecret = `bhd_${randomBytes(24).toString("base64url")}`;
  const [row] = await db
    .insert(registeredClients)
    .values({
      clientId,
      name,
      origin,
      workspacePath,
      redirectUris: toJsonList([redirectUri, `${origin}/api/auth/bhd/callback`]),
      postLogoutRedirectUris: toJsonList([postLogout, `${origin}/`]),
      clientSecret,
      mode: input.mode === "sso" ? "sso" : "browse",
      enabled: true,
      notes: input.notes?.trim().slice(0, 500) || null,
      updatedAt: new Date(),
    })
    .returning();

  return {
    client: {
      clientId: row.clientId,
      name: row.name,
      origin: row.origin,
      workspacePath: row.workspacePath,
      mode: row.mode,
      redirectUris: JSON.parse(row.redirectUris) as string[],
      postLogoutRedirectUris: JSON.parse(row.postLogoutRedirectUris) as string[],
    },
    clientSecret,
    issuer: "https://id.bhd-om.com",
    hint: "احفظ client_secret الآن — يُعرض مرة واحدة. ضعه في منتجك كـ BHD_OAUTH_CLIENT_SECRET.",
  };
}

export async function updateRegisteredClient(
  clientId: string,
  patch: { mode?: "browse" | "sso"; enabled?: boolean; workspacePath?: string; redirectUri?: string },
) {
  requireDatabase();
  await ensureIdentitySchema();
  const id = normalizeClientId(clientId);
  if (getStaticIdentityClient(id)) throw new Error("STATIC_CLIENT_READONLY");

  const db = getDb();
  const [current] = await db.select().from(registeredClients).where(eq(registeredClients.clientId, id)).limit(1);
  if (!current) throw new Error("NOT_FOUND");

  const nextRedirects = patch.redirectUri
    ? toJsonList([...(JSON.parse(current.redirectUris) as string[]), patch.redirectUri.trim()])
    : current.redirectUris;

  const [updated] = await db
    .update(registeredClients)
    .set({
      mode: patch.mode || current.mode,
      enabled: typeof patch.enabled === "boolean" ? patch.enabled : current.enabled,
      workspacePath: patch.workspacePath ? normalizePath(patch.workspacePath) : current.workspacePath,
      redirectUris: nextRedirects,
      updatedAt: new Date(),
    })
    .where(eq(registeredClients.clientId, id))
    .returning();

  return {
    clientId: updated.clientId,
    name: updated.name,
    mode: updated.mode,
    enabled: updated.enabled,
    workspacePath: updated.workspacePath,
    origin: updated.origin,
  };
}
