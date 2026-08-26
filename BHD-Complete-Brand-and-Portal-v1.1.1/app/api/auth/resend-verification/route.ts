import { NextResponse } from "next/server";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getCurrentSession } from "../../../lib/auth/session";
import { issueEmailVerification, isResendConfigured } from "../../../lib/auth/email-verification";
import { getUserById } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "قاعدة البيانات غير مربوطة." }, { status: 503 });
  }
  if (!isResendConfigured()) {
    return NextResponse.json({ message: "خدمة البريد غير مُعدّة (RESEND_API_KEY)." }, { status: 503 });
  }
  if (!allowRequest(`verify-resend:${clientKey(request)}`)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ message: "يلزم تسجيل الدخول." }, { status: 401 });
  }

  const user = await getUserById(session.sub);
  if (!user) {
    return NextResponse.json({ message: "الحساب غير موجود." }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ message: "البريد موثّق مسبقاً.", alreadyVerified: true });
  }

  try {
    await issueEmailVerification(user.id, user.email, request);
    return NextResponse.json({ ok: true, message: "أُرسل رابط التأكيد إلى بريدك." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "EMAIL_SEND_FAILED") {
      return NextResponse.json(
        { message: "تعذّر إرسال البريد. تأكد من نطاق المرسل في Resend." },
        { status: 502 },
      );
    }
    return NextResponse.json({ message: "تعذّر إنشاء رابط التأكيد." }, { status: 500 });
  }
}
