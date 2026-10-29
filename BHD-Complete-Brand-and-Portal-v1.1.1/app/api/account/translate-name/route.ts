import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth/session";
import { translatePersonName } from "../../../lib/auth/translate-name";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ message: "يجب تسجيل الدخول." }, { status: 401 });
  if (!allowRequest(`translate:${clientKey(request)}:${session.sub}`, 30, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }
  try {
    const body = (await request.json()) as { name?: string };
    const translated = await translatePersonName(body.name || session.name);
    return NextResponse.json(translated, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "تعذّرت ترجمة الاسم. اكتبه يدوياً." }, { status: 400 });
  }
}
