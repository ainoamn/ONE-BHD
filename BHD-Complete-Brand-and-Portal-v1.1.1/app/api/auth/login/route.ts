import { NextResponse } from "next/server";
import { authSecret } from "../../../lib/auth/config";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getRequestCountry, getRequestIp, getRequestUserAgent } from "../../../lib/auth/request-ip";
import { assertIpAllowed } from "../../../lib/auth/security";
import { applyIdentityLogin, getCurrentSession, portalSessionFromUser, readSessionRoster, upsertRoster } from "../../../lib/auth/session";
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
    case "ACCOUNT_SECURITY_HOLD":
      return "أُقفل الحساب بعد محاولات متكررة. استعده عبر التحقق من بياناتك.";
    case "IP_BLOCKED":
      return "هذا العنوان محظور مؤقتًا بعد محاولات متكررة. حاول لاحقاً.";
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
  const current = await getCurrentSession(request);
  if (!current && !allowRequest(`login:${clientKey(request)}`)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }

  try {
    await assertIpAllowed(getRequestIp(request));
    const body = (await request.json()) as { identifier?: string; password?: string };
    const user = await loginWithPassword(body.identifier || "", body.password || "", {
      ip: getRequestIp(request),
      country: getRequestCountry(request),
      userAgent: getRequestUserAgent(request),
    });
    const next = portalSessionFromUser(user, "password");
    const roster = await readSessionRoster(request);
    const accounts = upsertRoster(roster, next);
    const response = NextResponse.json({ user, accounts, token: "" });
    const { token } = await applyIdentityLogin(response.cookies, next, roster);
    return NextResponse.json({ user, accounts, token }, { headers: response.headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "ACCOUNT_LOCKED" || code === "ACCOUNT_SECURITY_HOLD" || code === "IP_BLOCKED" ? 403 : 401;
    return NextResponse.json(
      {
        message: messageFor(code),
        code,
        recoverUrl: code === "ACCOUNT_SECURITY_HOLD" ? "/recover" : undefined,
      },
      { status },
    );
  }
}
