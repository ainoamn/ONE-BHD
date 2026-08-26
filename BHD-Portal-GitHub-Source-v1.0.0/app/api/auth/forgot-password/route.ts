import { NextResponse } from "next/server";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { requestPasswordResetByIdentifier } from "../../../lib/auth/password-reset";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

const GENERIC_OK =
  "إن وُجد حساب بهذا البريد/اسم المستخدم، أرسلنا رابط إعادة تعيين كلمة المرور. راجع صندوق الوارد خلال دقائق.";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "قاعدة البيانات غير مربوطة." }, { status: 503 });
  }
  if (!allowRequest(`forgot-password:${clientKey(request)}`, 5, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { identifier?: string } | null;
  const identifier = body?.identifier?.trim() || "";
  if (!identifier) {
    return NextResponse.json({ message: "أدخل البريد أو اسم المستخدم." }, { status: 400 });
  }

  try {
    await requestPasswordResetByIdentifier(identifier, request);
    return NextResponse.json({ ok: true, message: GENERIC_OK });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "RESEND_NOT_CONFIGURED") {
      return NextResponse.json(
        { message: "خدمة البريد غير جاهزة حالياً. تواصل مع الدعم أو حاول لاحقاً." },
        { status: 503 },
      );
    }
    if (code === "INVALID_INPUT") {
      return NextResponse.json({ message: "أدخل البريد أو اسم المستخدم." }, { status: 400 });
    }
    // Still generic for unknown lookup failures after send attempt
    console.error("forgot-password failed", error);
    return NextResponse.json({ message: "تعذّر إرسال الرابط الآن. حاول لاحقاً." }, { status: 500 });
  }
}
