import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth/session";
import { getSelfContact, getUserById } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

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
    return NextResponse.json(
      { user, contact, platformAdmin: isPlatformAdminEmail(user.email) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
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
    { headers: { "Cache-Control": "no-store" } },
  );
}
