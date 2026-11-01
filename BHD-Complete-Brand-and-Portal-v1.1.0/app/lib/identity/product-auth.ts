import { verifyClientSecret } from "./crypto";
import type { IdentityClient } from "./clients";

/** First-party products allowed to read account profiles by `sub`. */
const PRODUCT_CLIENTS = new Set(["bhd-r", "bhd-hr", "bhd-office"]);

export type ProductAuthOk = { ok: true; client: IdentityClient };
export type ProductAuthFail = { ok: false; status: 401 | 403 };

function parseBasic(header: string | null): { clientId: string; secret: string } | null {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon < 1) return null;
    return {
      clientId: decoded.slice(0, colon).trim(),
      secret: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

/**
 * Authenticate a first-party product via HTTP Basic (`client_id:client_secret`)
 * or `X-BHD-Client-Id` + `X-BHD-Client-Secret` headers.
 */
export async function requireProductClient(request: Request): Promise<ProductAuthOk | ProductAuthFail> {
  const basic = parseBasic(request.headers.get("authorization"));
  const clientId =
    basic?.clientId ||
    request.headers.get("x-bhd-client-id")?.trim() ||
    "";
  const secret =
    basic?.secret ||
    request.headers.get("x-bhd-client-secret")?.trim() ||
    "";
  if (!clientId || !secret) return { ok: false, status: 401 };

  const client = await verifyClientSecret(clientId, secret);
  if (!client) return { ok: false, status: 401 };
  if (!PRODUCT_CLIENTS.has(client.clientId)) return { ok: false, status: 403 };
  return { ok: true, client };
}
