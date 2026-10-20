import { NextResponse } from "next/server";
import { getCurrentSession, readSessionRoster } from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

function publicFromSession(session: { sub: string; name: string; email: string; picture: string | null }) {
  return {
    id: session.sub,
    name: session.name,
    email: session.email,
    username: null,
    phone: null,
    picture: session.picture,
    emailVerified: true,
    mustCompleteProfile: false,
  };
}

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
      user: publicFromSession(session),
      accounts: accounts.map(publicFromSession),
      contact: null,
      platformAdmin: isPlatformAdminEmail(session.email),
    },
    { headers },
  );
}
