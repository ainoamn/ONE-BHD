import { NextResponse } from "next/server";
import { authSecret } from "../../../lib/auth/config";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { applySessionCookies, createSessionToken, getCurrentSession } from "../../../lib/auth/session";
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
    case "SWITCH_REQUIRES_LOGOUT":
      return "أنت داخل بحساب آخر. اخرج أولاً ثم أنشئ حساباً جديداً.";
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
    if (await getCurrentSession()) {
      throw new Error("SWITCH_REQUIRES_LOGOUT");
    }
    const body = (await request.json()) as RegisterInput;
    const user = await registerWithPassword(body);
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    const response = NextResponse.json({ user });
    applySessionCookies(response.cookies, token);
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "EMAIL_OR_USERNAME_TAKEN" || code === "SWITCH_REQUIRES_LOGOUT" ? 409 : 400;
    return NextResponse.json({ message: messageFor(code) }, { status });
  }
}
