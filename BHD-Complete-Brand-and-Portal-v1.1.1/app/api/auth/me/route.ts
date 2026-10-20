import { NextResponse } from "next/server";
import { getCurrentSession, readSessionRoster } from "../../../lib/auth/session";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

function json(body: unknown) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

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

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return json({ user: null, accounts: [] });
  }

  const accounts = await readSessionRoster();
  return json({
    user: publicFromSession(session),
    accounts: accounts.map(publicFromSession),
    contact: null,
    platformAdmin: isPlatformAdminEmail(session.email),
  });
}
