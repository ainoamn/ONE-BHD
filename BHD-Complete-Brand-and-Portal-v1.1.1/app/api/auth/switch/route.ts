import { NextResponse } from "next/server";
import { applyIdentitySwitch, readSessionRoster } from "../../../lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let sub = "";
  try {
    const body = (await request.json()) as { sub?: string };
    sub = typeof body.sub === "string" ? body.sub.trim() : "";
  } catch {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }
  if (!sub) {
    return NextResponse.json({ message: "الحساب مطلوب." }, { status: 400 });
  }

  const roster = await readSessionRoster();
  const target = roster.find((item) => item.sub === sub);
  if (!target) {
    return NextResponse.json({ message: "هذا الحساب غير محفوظ في هذه الجلسة." }, { status: 404 });
  }
  const response = NextResponse.json({
    ok: true,
    user: { id: target.sub, name: target.name, email: target.email, picture: target.picture },
    accounts: roster,
  });
  await applyIdentitySwitch(response.cookies, sub, roster);
  return response;
}
