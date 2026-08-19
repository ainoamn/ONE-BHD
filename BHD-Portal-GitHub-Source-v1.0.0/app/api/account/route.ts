import { NextResponse } from "next/server";
import { BHD_APPS } from "../../lib/bhd/apps";
import { authSecret } from "../../lib/auth/config";
import { allowRequest, clientKey } from "../../lib/auth/rate-limit";
import { applySessionCookies, createSessionToken, getCurrentSession } from "../../lib/auth/session";
import { getAccountProfile, listLinkedClientIds, updateOwnProfile } from "../../lib/auth/users";
import { isDatabaseConfigured } from "../../../db";

export const runtime = "nodejs";

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function linkedSites(linkedClientIds: string[]) {
  const linked = new Set(linkedClientIds);
  return BHD_APPS.map((app) => {
    const used = Boolean(app.clientId && linked.has(app.clientId));
    const status = !app.enabled
      ? "soon"
      : app.id === "account" || app.id === "portal" || used
        ? "linked"
        : "available";
    return {
      id: app.id,
      nameAr: app.nameAr,
      nameEn: app.nameEn,
      origin: app.origin,
      enabled: app.enabled,
      status,
    };
  });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return noStore({ message: "يجب تسجيل الدخول." }, 401);
  if (!isDatabaseConfigured()) {
    return noStore({
      user: {
        id: session.sub,
        name: session.name,
        email: session.email,
        username: null,
        phone: null,
        picture: session.picture,
        emailVerified: true,
        mustCompleteProfile: false,
        googleLinked: true,
        facebookLinked: false,
        gender: null,
        birthDate: null,
        hasPassword: false,
        createdAt: null,
        lastLoginAt: null,
      },
      contact: null,
      sites: linkedSites([]),
      subscriptions: [],
    });
  }

  const profile = await getAccountProfile(session.sub);
  if (!profile) return noStore({ message: "الحساب غير موجود." }, 404);
  const linkedClientIds = await listLinkedClientIds(session.sub);
  return noStore({
    user: profile.user,
    contact: profile.contact,
    sites: linkedSites(linkedClientIds),
    subscriptions: [],
  });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) return noStore({ message: "يجب تسجيل الدخول." }, 401);
  if (!authSecret() || !isDatabaseConfigured()) {
    return noStore({ message: "تعذّر حفظ البيانات الآن." }, 503);
  }
  if (!allowRequest(`account:${clientKey(request)}:${session.sub}`)) {
    return noStore({ message: "محاولات كثيرة. انتظر دقيقة." }, 429);
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      username?: string | null;
      phone?: string | null;
      gender?: string | null;
      birthDate?: string | null;
      phone2?: string | null;
      whatsapp?: string | null;
      address?: string | null;
      city?: string | null;
      hometown?: string | null;
      country?: string | null;
      zipCode?: string | null;
      currentPassword?: string;
      newPassword?: string;
    };
    const user = await updateOwnProfile(session.sub, body);
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    const profile = await getAccountProfile(user.id);
    const linkedClientIds = await listLinkedClientIds(user.id);
    const response = noStore({
      user: profile?.user || user,
      contact: profile?.contact || null,
      sites: linkedSites(linkedClientIds),
      subscriptions: [],
    });
    applySessionCookies(response.cookies, token);
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, [string, number]> = {
      INVALID_INPUT: ["أدخل الاسم بشكل صحيح.", 400],
      INVALID_USERNAME: ["اسم المستخدم من 3 إلى 32 حرفًا إنجليزيًا أو رقمًا.", 400],
      EMAIL_OR_USERNAME_TAKEN: ["اسم المستخدم مستخدم مسبقًا.", 409],
      INVALID_CREDENTIALS: ["كلمة المرور الحالية غير صحيحة.", 401],
      WEAK_PASSWORD: ["كلمة المرور الجديدة ضعيفة.", 400],
      NO_PASSWORD: ["هذا الحساب بلا كلمة مرور محلية. استخدم جوجل للدخول.", 400],
      NOT_FOUND: ["الحساب غير موجود.", 404],
    };
    const [message, status] = messages[code] || ["تعذّر حفظ التعديلات.", 400];
    return noStore({ message }, status);
  }
}
