import { NextResponse } from "next/server";
import { getCurrentSession, inferProviders, readSessionRoster, type PortalSession } from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

function publicFromSession(session: PortalSession) {
  const providers = inferProviders(session);
  return {
    id: session.sub,
    name: session.name,
    email: session.email,
    username: session.username || null,
    phone: session.phone || null,
    picture: session.picture,
    providers,
    googleLinked: providers.includes("google"),
    facebookLinked: providers.includes("facebook"),
    hasPassword: providers.includes("password"),
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
