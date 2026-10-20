import { NextResponse } from "next/server";
import { getCurrentSession, publicAccount, readSessionRoster } from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function GET(request: Request) {
  const headers = productCorsHeaders(request);
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ user: null, accounts: [] }, { headers });
  }

  const accounts = await readSessionRoster();
  return NextResponse.json(
    {
      user: publicAccount(session),
      accounts: accounts.map(publicAccount),
      contact: null,
      platformAdmin: isPlatformAdminEmail(session.email),
    },
    { headers },
  );
}
