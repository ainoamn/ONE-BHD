import { NextResponse } from "next/server";
import { googleClientId, isGoogleAuthConfigured, SESSION_COOKIE } from "../../../lib/auth/config";
import { verifyGoogleIdToken } from "../../../lib/auth/google";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { createSessionToken, sessionCookieOptions } from "../../../lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json(
      { message: "تسجيل الدخول عبر Google غير مُعدّ على الخادم." },
      { status: 503 },
    );
  }

  if (!allowRequest(`google:${clientKey(request)}`)) {
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
    const session = await verifyGoogleIdToken(idToken);
    const token = await createSessionToken(session);
    const response = NextResponse.json({
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ message: "تعذّر التحقق من حساب Google." }, { status: 401 });
  }
}

export function GET() {
  return NextResponse.json({
    configured: Boolean(googleClientId()),
    provider: "google",
  });
}
