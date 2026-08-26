import { createHash } from "node:crypto";
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

  const body = (await request.json().catch(() => null)) as { identifier?: string } | null;
  const identifier = body?.identifier?.trim() || "";
  if (!identifier) {
    return NextResponse.json({ message: "أدخل البريد أو اسم المستخدم." }, { status: 400 });
  }

  const ip = clientKey(request);
  const idHash = createHash("sha256").update(identifier.toLowerCase()).digest("hex").slice(0, 24);

  // Strict limits: 1 send per identifier / minute, and 3 / IP / minute.
  if (!allowRequest(`forgot-password-id:${idHash}`, 1, 60_000)) {
    return NextResponse.json(
      {
        message:
          "تم إرسال رابط لهذا الحساب مؤخراً. انتظر دقيقة، وتحقق من الوارد والبريد العشوائي قبل إعادة المحاولة.",
      },
      { status: 429 },
    );
  }
  if (!allowRequest(`forgot-password:${ip}`, 3, 60_000)) {
    return NextResponse.json(
      { message: "محاولات كثيرة من هذا الجهاز. انتظر دقيقة ثم أعد المحاولة." },
      { status: 429 },
    );
  }

  try {
    await requestPasswordResetByIdentifier(identifier, request);
    return NextResponse.json({ ok: true, message: GENERIC_OK, retryAfterSec: 60 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "RESEND_NOT_CONFIGURED") {
      return NextResponse.json(
        { message: "خدمة البريد غير جاهزة حالياً. تواصل مع الدعم أو حاول لاحقاً." },
        { status: 503 },
      );
    }
    if (code === "EMAIL_DOMAIN_NOT_VERIFIED") {
      return NextResponse.json(
        {
          message:
            "نطاق المرسل غير موثّق في Resend. أكّد نطاق bhd-om.com ثم أعد المحاولة.",
        },
        { status: 503 },
      );
    }
    if (code === "EMAIL_SEND_FAILED") {
      return NextResponse.json(
        { message: "مزوّد البريد رفض الإرسال. تحقق من مفتاح Resend ونطاق المرسل ثم أعد المحاولة." },
        { status: 502 },
      );
    }
    if (code === "INVALID_INPUT") {
      return NextResponse.json({ message: "أدخل البريد أو اسم المستخدم." }, { status: 400 });
    }
    console.error("forgot-password failed", error);
    return NextResponse.json({ message: "تعذّر إرسال الرابط الآن. حاول لاحقاً." }, { status: 500 });
  }
}
