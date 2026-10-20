import { NextResponse } from "next/server";
import {
  googleClientId,
  isGoogleAuthConfigured,
  authSecret,
} from "../../../lib/auth/config";
import { verifyGoogleIdToken } from "../../../lib/auth/google";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { getRequestIp } from "../../../lib/auth/request-ip";
import { applyIdentityLogin, getCurrentSession, portalSessionFromUser, readSessionRoster, upsertRoster } from "../../../lib/auth/session";
import { loginOrRegisterWithGoogle } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isGoogleAuthConfigured() || !authSecret()) {
    return NextResponse.json(
      { message: "تسجيل الدخول عبر Google غير مُعدّ على الخادم." },
      { status: 503 },
    );
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مربوطة. أضف DATABASE_URL من Neon." },
      { status: 503 },
    );
  }

  const session = await getCurrentSession();
  if (!session && !allowRequest(`google:${clientKey(request)}`, 8, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة." }, { status: 429 });
  }

  let idToken = "";
  try {
    const body = (await request.json()) as { idToken?: string };
    idToken = typeof body.idToken === "string" ? body.idToken.trim() : "";
  } catch {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ message: "رمز Google مطلوب." }, { status: 400 });
  }

  try {
    const google = await verifyGoogleIdToken(idToken);
    const user = await loginOrRegisterWithGoogle({
      googleId: google.sub,
      email: google.email,
      name: google.name,
      picture: google.picture,
      ip: getRequestIp(request),
    });
    const next = portalSessionFromUser(user, "google");
    const roster = await readSessionRoster();
    const response = NextResponse.json({ user, accounts: upsertRoster(roster, next) });
    await applyIdentityLogin(response.cookies, next, roster);
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "ACCOUNT_LOCKED" || code === "ACCOUNT_DISABLED") {
      return NextResponse.json({ message: "هذا الحساب غير متاح للدخول." }, { status: 403 });
    }
    return NextResponse.json({ message: "تعذّر التحقق من حساب Google." }, { status: 401 });
  }
}

export function GET() {
  return NextResponse.json({
    configured: Boolean(googleClientId()) && isDatabaseConfigured(),
    provider: "google",
    database: isDatabaseConfigured(),
  });
}
