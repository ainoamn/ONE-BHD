import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    {
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
