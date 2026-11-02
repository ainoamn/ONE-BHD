import { NextResponse } from "next/server";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getCurrentSession } from "../../../lib/auth/session";
import { confirmAccountKindChoice } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST /api/account/kind — first-time فرد/شركة after social signup. */
export async function POST(request: Request) {
  const session = await getCurrentSession(request);
  if (!session) return noStore({ message: "يجب تسجيل الدخول." }, 401);
  if (!isDatabaseConfigured()) return noStore({ message: "قاعدة البيانات غير مربوطة." }, 503);
  if (!allowRequest(`account-kind:${clientKey(request)}:${session.sub}`)) {
    return noStore({ message: "محاولات كثيرة. انتظر دقيقة." }, 429);
  }

  const body = (await request.json().catch(() => null)) as { accountKind?: string } | null;
  const kind = body?.accountKind === "company" ? "company" : body?.accountKind === "person" ? "person" : null;
  if (!kind) return noStore({ message: "اختر فرد أو شركة." }, 400);

  try {
    const user = await confirmAccountKindChoice(session.sub, kind);
    return noStore({ user });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "NOT_FOUND") return noStore({ message: "الحساب غير موجود." }, 404);
    return noStore({ message: "تعذّر حفظ نوع الحساب." }, 400);
  }
}
