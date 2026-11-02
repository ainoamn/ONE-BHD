import { NextResponse } from "next/server";
import { isAccountFileKind, readAccountFile } from "../../../../lib/auth/account-files";
import { requirePlatformAdmin } from "../../../../lib/auth/platform-admin";

export const runtime = "nodejs";

/** GET /api/admin/users/file?id=&kind= — platform admin download of identity proof docs. */
export async function GET(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) {
    return NextResponse.json(
      { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
      { status: gate.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() || "";
  const kind = url.searchParams.get("kind")?.trim() || "";
  if (!id || !isAccountFileKind(kind)) {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  }

  const file = await readAccountFile(id, kind);
  if (!file) return NextResponse.json({ message: "لا يوجد مرفق." }, { status: 404 });
  const bytes = Buffer.from(file.content, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
