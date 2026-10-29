import { NextResponse } from "next/server";
import {
  cookieSessionToken,
  getCurrentSession,
  publicAccount,
  readBearerToken,
  readSessionRoster,
} from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function GET(request: Request) {
  const headers = productCorsHeaders(request);
  if (request.headers.get("x-bhd-window-signed-out") === "1") {
    const accounts = await readSessionRoster(request);
    return NextResponse.json({ user: null, accounts: accounts.map(publicAccount) }, { headers });
  }

  const session = await getCurrentSession(request);
  if (!session) {
    return NextResponse.json({ user: null, accounts: [] }, { headers });
  }

  const accounts = await readSessionRoster(request);
  const bootstrap =
    request.headers.get("x-bhd-window-bootstrap") === "1" && !readBearerToken(request);
  const token = bootstrap ? await cookieSessionToken() : undefined;
  return NextResponse.json(
    {
      user: publicAccount(session),
      accounts: accounts.map(publicAccount),
      contact: null,
      platformAdmin: isPlatformAdminEmail(session.email),
      ...(token ? { token } : {}),
    },
    { headers },
  );
}
