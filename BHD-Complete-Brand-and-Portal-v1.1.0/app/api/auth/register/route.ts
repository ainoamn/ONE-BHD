import { NextResponse } from "next/server";
import { authSecret } from "../../../lib/auth/config";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getRequestIp } from "../../../lib/auth/request-ip";
import { applyIdentityLogin, portalSessionFromUser, readSessionRoster, upsertRoster } from "../../../lib/auth/session";
import { issueEmailVerification, isResendConfigured } from "../../../lib/auth/email-verification";
import { registerWithPassword, type RegisterInput } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

function messageFor(code: string) {
  switch (code) {
    case "DATABASE_URL_MISSING":
      return "قاعدة البيانات غير مربوطة. أضف DATABASE_URL من Neon.";
    case "EMAIL_OR_USERNAME_TAKEN":
      return "الإيميل أو اسم المستخدم مستخدم مسبقًا.";
    case "WEAK_PASSWORD":
      return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    case "INVALID_USERNAME":
      return "اسم المستخدم: 3–32 حرفًا (لاتيني صغير، أرقام، . _ -).";
    default:
      return "تعذّر إنشاء الحساب.";
  }
}

export async function POST(request: Request) {
  if (!authSecret()) {
    return NextResponse.json({ message: "AUTH_SECRET غير مُعدّ." }, { status: 503 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: messageFor("DATABASE_URL_MISSING") }, { status: 503 });
  }
  if (!allowRequest(`register:${clientKey(request)}`)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as RegisterInput;
    const user = await registerWithPassword({ ...body, signupIp: getRequestIp(request) });

    let verificationEmailSent = false;
    if (isResendConfigured()) {
      try {
        await issueEmailVerification(user.id, user.email, request);
        verificationEmailSent = true;
      } catch (error) {
        console.error("verification email after register failed", error);
      }
    }

    const next = portalSessionFromUser(user, "password");
    const roster = await readSessionRoster();
    const response = NextResponse.json({
      user,
      accounts: upsertRoster(roster, next),
      verificationEmailSent,
      message: verificationEmailSent
        ? "تم إنشاء الحساب. راجع بريدك لتأكيد العنوان."
        : "تم إنشاء الحساب. أكّد بريدك لاحقاً من صفحة الحساب.",
    });
    await applyIdentityLogin(response.cookies, next, roster);
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "EMAIL_OR_USERNAME_TAKEN" ? 409 : 400;
    return NextResponse.json({ message: messageFor(code) }, { status });
  }
}
