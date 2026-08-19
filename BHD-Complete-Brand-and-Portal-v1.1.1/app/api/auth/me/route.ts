import { NextResponse } from "next/server";
import { applySessionCookies, createSessionToken, getCurrentSession } from "../../../lib/auth/session";
import { getSelfContact, getUserById } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

async function withTouchedSession(
  body: unknown,
  session: { sub: string; email: string; name: string; picture: string | null },
) {
  const token = await createSessionToken(session);
  const response = NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  applySessionCookies(response.cookies, token);
  return response;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  if (isDatabaseConfigured()) {
    const user = await getUserById(session.sub);
    if (!user) {
      return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
    }
    const contact = await getSelfContact(user.id);
    return withTouchedSession(
      { user, contact, platformAdmin: isPlatformAdminEmail(user.email) },
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    );
  }

  return withTouchedSession(
    {
      user: {
        id: session.sub,
        name: session.name,
        email: session.email,
        username: null,
        phone: null,
        picture: session.picture,
        emailVerified: true,
        mustCompleteProfile: false,
      },
      contact: null,
      platformAdmin: isPlatformAdminEmail(session.email),
    },
    session,
  );
}
