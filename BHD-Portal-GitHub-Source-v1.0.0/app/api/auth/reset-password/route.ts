import { NextResponse } from "next/server";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { consumePasswordResetToken } from "../../../lib/auth/password-reset";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

function messageFor(code: string) {
  switch (code) {
    case "INVALID_TOKEN":
      return "الرابط غير صالح.";
    case "TOKEN_USED":
      return "تم استخدام هذا الرابط مسبقاً.";
    case "TOKEN_EXPIRED":
      return "انتهت صلاحية الرابط. اطلب رابطاً جديداً.";
    case "WEAK_PASSWORD":
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    default:
      return "تعذّر تحديث كلمة المرور.";
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "قاعدة البيانات غير مربوطة." }, { status: 503 });
  }
  if (!allowRequest(`password-reset:${clientKey(request)}`, 8, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    token?: string;
    password?: string;
  } | null;

  try {
    await consumePasswordResetToken(body?.token || "", body?.password || "");
    return NextResponse.json({ ok: true, message: "تم تحديث كلمة المرور. يمكنك الدخول الآن." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ message: messageFor(code) }, { status: 400 });
  }
}
