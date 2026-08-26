import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { registeredClients, type BhdRegisteredClient } from "../../../db/schema";

export type IdentityClient = {
  clientId: string;
  name: string;
  secretEnv: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  /** Present for admin-registered clients (DB). */
  storedSecret?: string;
  origin?: string;
  workspacePath?: string;
  mode?: "browse" | "sso";
  source?: "static" | "registered";
};

export const IDENTITY_CLIENTS: IdentityClient[] = [
  {
    clientId: "bhd-portal",
    name: "BHD Portal",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_PORTAL",
    redirectUris: [
      "https://www.bhd-om.com/api/auth/bhd/callback",
      "https://bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: ["https://www.bhd-om.com/", "https://bhd-om.com/", "http://localhost:3000/"],
  },
  {
    clientId: "bhd-wazen",
    name: "WAZEN",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_WAZEN",
    redirectUris: [
      "https://wazen.bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
      "http://localhost:3001/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: ["https://wazen.bhd-om.com/", "http://localhost:3000/", "http://localhost:3001/"],
  },
  {
    clientId: "bhd-hisaby",
    name: "HISAB",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_HISABY",
    redirectUris: [
      "https://hisaby.bhd-om.com/api/auth/bhd/callback",
      "https://www.hisaby.pro/api/auth/bhd/callback",
      "https://hisaby.pro/api/auth/bhd/callback",
      "https://bhd-pro.vercel.app/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://hisaby.bhd-om.com/",
      "https://www.hisaby.pro/",
      "https://hisaby.pro/",
      "https://bhd-pro.vercel.app/",
      "http://localhost:3000/",
    ],
  },
  {
    clientId: "bhd-nasab",
    name: "NASAB",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_NASAB",
    redirectUris: [
      "https://nasab.bhd-om.com/api/auth/bhd/callback",
      "https://nasab-mu.vercel.app/api/auth/bhd/callback",
      "http://localhost:5173/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://nasab.bhd-om.com/",
      "https://nasab-mu.vercel.app/",
      "http://localhost:5173/",
      "http://localhost:3000/",
    ],
  },
  {
    clientId: "bhd-store",
    name: "BHD Store",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_STORE",
    redirectUris: [
      "https://bhdstor.bhd-om.com/api/auth/bhd/callback",
      "https://store.bhd-om.com/api/auth/bhd/callback",
      "https://bhd-stor-x7dc.vercel.app/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
      "http://127.0.0.1:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://bhdstor.bhd-om.com/",
      "https://store.bhd-om.com/",
      "https://bhd-stor-x7dc.vercel.app/",
      "http://localhost:3000/",
      "http://127.0.0.1:3000/",
    ],
  },
  {
    clientId: "bhd-office",
    name: "BHD Office",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_OFFICE",
    redirectUris: [
      "https://baitak.bhd-om.com/api/auth/bhd/callback",
      "https://www.bhd-om.com/api/auth/bhd/callback",
      "https://bhd-om.com/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
      "http://127.0.0.1:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://baitak.bhd-om.com/",
      "https://www.bhd-om.com/",
      "https://bhd-om.com/",
      "http://localhost:3000/",
      "http://127.0.0.1:3000/",
    ],
  },
  {
    clientId: "bhd-r",
    name: "BHD R",
    secretEnv: "BHD_OAUTH_CLIENT_SECRET_R",
    redirectUris: [
      "https://bhd-r-api-phi.vercel.app/api/auth/bhd/callback",
      "https://bhd-r-api-phi.vercel.app/v1/auth/oidc/callback",
      "https://r.bhd-om.com/api/auth/bhd/callback",
      "https://r.bhd-om.com/ar/api/auth/bhd/callback",
      "http://localhost:3000/api/auth/bhd/callback",
    ],
    postLogoutRedirectUris: [
      "https://bhd-r-api-phi.vercel.app/",
      "https://r.bhd-om.com/",
      "https://r.bhd-om.com/ar",
      "http://localhost:3000/",
    ],
  },
];

function parseJsonList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return raw
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function fromRegisteredRow(row: BhdRegisteredClient): IdentityClient {
  return {
    clientId: row.clientId,
    name: row.name,
    secretEnv: "",
    storedSecret: row.clientSecret,
    redirectUris: parseJsonList(row.redirectUris),
    postLogoutRedirectUris: parseJsonList(row.postLogoutRedirectUris),
    origin: row.origin,
    workspacePath: row.workspacePath,
    mode: row.mode === "sso" ? "sso" : "browse",
    source: "registered",
  };
}

export function getStaticIdentityClient(clientId: string): IdentityClient | undefined {
  const resolved = clientId === "bhd-ain-oman" || clientId === "bhd-baitak" ? "bhd-r" : clientId;
  const hit = IDENTITY_CLIENTS.find((client) => client.clientId === resolved);
  return hit ? { ...hit, source: "static" } : undefined;
}

/** Sync lookup for static clients only (portal start/callback). */
export function getIdentityClient(clientId: string): IdentityClient | undefined {
  return getStaticIdentityClient(clientId);
}

/** Static + admin-registered clients. */
export async function resolveIdentityClient(clientId: string): Promise<IdentityClient | undefined> {
  const staticClient = getStaticIdentityClient(clientId);
  if (staticClient) return staticClient;
  if (!isDatabaseConfigured()) return undefined;
  try {
    await ensureIdentitySchema();
    const db = getDb();
    const [row] = await db
      .select()
      .from(registeredClients)
      .where(eq(registeredClients.clientId, clientId.trim()))
      .limit(1);
    if (!row || !row.enabled) return undefined;
    return fromRegisteredRow(row);
  } catch {
    return undefined;
  }
}

export async function listIdentityClients(): Promise<IdentityClient[]> {
  const staticList = IDENTITY_CLIENTS.map((client) => ({ ...client, source: "static" as const }));
  if (!isDatabaseConfigured()) return staticList;
  try {
    await ensureIdentitySchema();
    const db = getDb();
    const rows = await db.select().from(registeredClients);
    const registered = rows.filter((row) => row.enabled).map(fromRegisteredRow);
    const staticIds = new Set(staticList.map((client) => client.clientId));
    return [...staticList, ...registered.filter((client) => !staticIds.has(client.clientId))];
  } catch {
    return staticList;
  }
}

export function isAllowedRedirect(client: IdentityClient, redirectUri: string, requestOrigin?: string): boolean {
  if (client.redirectUris.includes(redirectUri)) return true;
  if (client.clientId === "bhd-portal" && requestOrigin && redirectUri === `${requestOrigin}/api/auth/bhd/callback`) {
    return true;
  }
  return false;
}

export function isAllowedLogoutRedirect(client: IdentityClient, uri: string): boolean {
  return client.postLogoutRedirectUris.includes(uri);
}
