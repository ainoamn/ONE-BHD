import { NextResponse } from "next/server";
import { listAdminUsers, setUserActive } from "../../../lib/auth/admin-users";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) {
    return NextResponse.json(
      { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
      { status: gate.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const users = await listAdminUsers(query);
  return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) {
    return NextResponse.json(
      { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
      { status: gate.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body = (await request.json().catch(() => null)) as { id?: string; isActive?: boolean } | null;
  const id = body?.id?.trim() || "";
  if (!id || typeof body?.isActive !== "boolean") {
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
