import { NextResponse } from "next/server";
import {
  createSessionToken,
  getCurrentSession,
  publicAccount,
  readSessionRoster,
} from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function GET(request: Request) {
  const headers = new Headers(productCorsHeaders(request));
  headers.set("Cache-Control", "no-store");
  if (request.headers.get("x-bhd-window-signed-out") === "1") {
    const accounts = await readSessionRoster(request);
    return NextResponse.json({ user: null, accounts: accounts.map(publicAccount) }, { headers });
  }

  const session = await getCurrentSession(request);
  if (!session) {
    return NextResponse.json({ user: null, accounts: [] }, { headers });
  }

  const accounts = await readSessionRoster(request);
  // Always return a window token for the active session so sessionStorage cannot
  // stay on a previous account after bhd_id was rewritten by /api/auth/switch.
  const token = await createSessionToken(session);
  return NextResponse.json(
    {
      user: publicAccount(session),
      accounts: accounts.map(publicAccount),
      contact: null,
      platformAdmin: isPlatformAdminEmail(session.email),
      token,
    },
    { headers },
  );
}
