import { NextResponse } from "next/server";
import { allowRequest, clientKey } from "../../../../lib/auth/rate-limit";
import { assertIpAllowed, startAccountRecovery } from "../../../../lib/auth/security";
import { getRequestIp } from "../../../../lib/auth/request-ip";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!allowRequest(`recover:${clientKey(request)}`, 5, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }
  try {
    await assertIpAllowed(getRequestIp(request));
    const body = (await request.json()) as {
      email?: string;
      civilId?: string;
      civilIdExpires?: string;
      birthDate?: string;
      whatsapp?: string;
      lastLoginDate?: string;
      lastTransactions?: string;
    };
    const result = await startAccountRecovery({
      email: body.email || "",
      civilId: body.civilId || "",
      civilIdExpires: body.civilIdExpires || "",
      birthDate: body.birthDate || "",
      whatsapp: body.whatsapp || "",
      lastLoginDate: body.lastLoginDate || "",
      lastTransactions: body.lastTransactions || "",
    });
    return NextResponse.json({
      ...result,
      message: result.whatsappReady
        ? "أُرسل رمز إلى البريد وواتساب."
        : "أُرسل رمز إلى البريد. واتساب سيُفعَّل لاحقاً.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "IP_BLOCKED") {
      return NextResponse.json({ message: "هذا العنوان محظور مؤقتًا." }, { status: 403 });
    }
    if (code === "RECOVERY_NOT_REQUIRED") {
      return NextResponse.json({ message: "هذا الحساب غير مقفل أمنياً. استخدم نسيت كلمة المرور." }, { status: 400 });
    }
    return NextResponse.json({ message: "البيانات لا تطابق سجل الحساب." }, { status: 400 });
  }
}
