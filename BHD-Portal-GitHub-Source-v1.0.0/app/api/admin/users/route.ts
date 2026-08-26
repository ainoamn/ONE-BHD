import { NextResponse } from "next/server";
import {
  adminResendVerification,
  adminSendPasswordReset,
  deleteAdminUser,
  getAdminUserDetail,
  listAdminUsers,
  setUserActive,
  setUserEmailVerified,
} from "../../../lib/auth/admin-users";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() || "";
  if (id) {
    const user = await getAdminUserDetail(id);
    if (!user) {
      return NextResponse.json({ message: "الحساب غير موجود." }, { status: 404 });
    }
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  }

  const query = url.searchParams.get("q") || "";
  const users = await listAdminUsers(query);
  return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  } | null;
  const id = body?.id?.trim() || "";
  if (!id) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }

  if (typeof body?.emailVerified === "boolean") {
    const user = await setUserEmailVerified(id, body.emailVerified);
    if (!user) {
      return NextResponse.json({ message: "الحساب غير موجود." }, { status: 404 });
    }
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  }

  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }
  if (id === gate.session.sub && body.isActive === false) {
    return NextResponse.json({ message: "لا يمكن تعطيل حسابك الإداري." }, { status: 400 });
  }

  const user = await setUserActive(id, body.isActive);
  if (!user) {
    return NextResponse.json({ message: "الحساب غير موجود." }, { status: 404 });
  }
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: "resend_verification" | "send_password_reset";
  } | null;
  const id = body?.id?.trim() || "";
  const action = body?.action;
  if (!id || !action) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }

  try {
    if (action === "resend_verification") {
      const result = await adminResendVerification(id, request);
      return NextResponse.json(
        { ok: true, message: `أُرسل رابط التفعيل إلى ${result.email}` },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "send_password_reset") {
      const result = await adminSendPasswordReset(id, request);
      return NextResponse.json(
        { ok: true, message: `أُرسل رابط إعادة كلمة المرور إلى ${result.email}` },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json({ message: "إجراء غير معروف." }, { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const map: Record<string, { status: number; message: string }> = {
      RESEND_NOT_CONFIGURED: { status: 503, message: "خدمة البريد (Resend) غير مفعّلة على الخادم." },
      NOT_FOUND: { status: 404, message: "الحساب غير موجود." },
      ALREADY_VERIFIED: { status: 400, message: "البريد موثّق مسبقاً." },
    };
    const hit = map[code] || { status: 500, message: "تعذّر تنفيذ الإجراء." };
    return NextResponse.json({ message: hit.message }, { status: hit.status });
  }
}

export async function DELETE(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() || "";
  if (!id) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }
  if (id === gate.session.sub) {
    return NextResponse.json({ message: "لا يمكن حذف حسابك الإداري الحالي." }, { status: 400 });
  }

  const ok = await deleteAdminUser(id);
  if (!ok) {
    return NextResponse.json({ message: "الحساب غير موجود." }, { status: 404 });
  }
  return NextResponse.json(
    { ok: true, message: "حُذف الحساب نهائياً من سجلات الهوية (مع التذاكر والبطاقات المرتبطة)." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
