import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "../../../../lib/auth/platform-admin";
import { clearLiveAppLogo, saveLiveAppLogo } from "../../../../lib/bhd/catalog-store";

export const runtime = "nodejs";

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const form = await request.formData();
  const id = String(form.get("id") || "");
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "اختر ملف شعار." }, { status: 400 });
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const app = await saveLiveAppLogo(id, { mime: file.type || "image/png", bytes });
    return NextResponse.json({ app }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const map: Record<string, string> = {
      INVALID_FILE_TYPE: "صيغة الشعار: PNG أو JPEG أو WebP أو SVG.",
      FILE_TOO_LARGE: "حجم الشعار حتى 512 كيلوبايت.",
      NOT_FOUND: "التطبيق غير موجود.",
    };
    return NextResponse.json({ message: map[code] || "تعذّر رفع الشعار.", code }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  await clearLiveAppLogo(id);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
