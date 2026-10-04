import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth/session";
import { getSelfContact, getUserById } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";
import { isPlatformAdminEmail } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

function json(body: unknown) {
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return json({ user: null });
  }

  if (isDatabaseConfigured()) {
    const user = await getUserById(session.sub);
    if (!user) {
      return json({ user: null });
    }
    const contact = await getSelfContact(user.id);
    return json({ user, contact, platformAdmin: isPlatformAdminEmail(user.email) });
  }

  return json({
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
  });
}
