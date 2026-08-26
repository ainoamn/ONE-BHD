import { NextResponse } from "next/server";
import { authSecret } from "../../../lib/auth/config";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getRequestIp } from "../../../lib/auth/request-ip";
import { applySessionCookies, createSessionToken, getCurrentSession, rejectAccountSwitch } from "../../../lib/auth/session";
import { loginWithPassword } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

function messageFor(code: string) {
  switch (code) {
    case "DATABASE_URL_MISSING":
      return "قاعدة البيانات غير مربوطة. أضف DATABASE_URL من Neon.";
    case "INVALID_CREDENTIALS":
      return "الإيميل/اسم المستخدم أو كلمة المرور غير صحيحة.";
    case "ACCOUNT_LOCKED":
      return "الحساب مقفل مؤقتًا بعد محاولات فاشلة. حاول بعد ربع ساعة.";
    case "SWITCH_REQUIRES_LOGOUT":
      return "أنت داخل بحساب آخر. اخرج أولاً ثم ادخل بالحساب الجديد.";
    default:
      return "تعذّر تسجيل الدخول.";
  }
}

export async function POST(request: Request) {
  if (!authSecret()) {
    return NextResponse.json({ message: "AUTH_SECRET غير مُعدّ." }, { status: 503 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: messageFor("DATABASE_URL_MISSING") }, { status: 503 });
  }
  if (!allowRequest(`login:${clientKey(request)}`)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { identifier?: string; password?: string };
    const user = await loginWithPassword(body.identifier || "", body.password || "", {
      ip: getRequestIp(request),
    });
    rejectAccountSwitch(await getCurrentSession(), user.id);
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
    const status = code === "ACCOUNT_LOCKED" ? 403 : code === "SWITCH_REQUIRES_LOGOUT" ? 409 : 401;
    return NextResponse.json({ message: messageFor(code) }, { status });
  }
}
