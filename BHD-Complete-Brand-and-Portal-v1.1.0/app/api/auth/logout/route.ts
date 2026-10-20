import { NextResponse } from "next/server";
import { applyIdentityLogout, getCurrentSession, readSessionRoster } from "../../../lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let all = false;
  try {
    const body = (await request.json()) as { all?: boolean };
    all = body.all === true;
  } catch {
    all = false;
  }

  const current = await getCurrentSession();
  const roster = await readSessionRoster();
  const response = NextResponse.json({ ok: true });
  const remaining = await applyIdentityLogout(response.cookies, current, roster, all);
  return NextResponse.json(
    {
      ok: true,
      user: remaining
        ? { id: remaining.sub, name: remaining.name, email: remaining.email, picture: remaining.picture }
        : null,
    },
    { headers: response.headers },
  );
}
