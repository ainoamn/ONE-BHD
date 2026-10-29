import { NextResponse } from "next/server";
import { getCurrentSession } from "../../../lib/auth/session";
import { isAccountFileKind, readAccountFile, saveAccountFile } from "../../../lib/auth/account-files";
import { allowRequest, clientKey } from "../../../lib/auth/rate-limit";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ message: "يجب تسجيل الدخول." }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind") || "";
  if (!isAccountFileKind(kind)) return NextResponse.json({ message: "نوع المرفق غير صالح." }, { status: 400 });
  const file = await readAccountFile(session.sub, kind);
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

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ message: "يجب تسجيل الدخول." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "قاعدة البيانات غير مربوطة." }, { status: 503 });
  if (!allowRequest(`upload:${clientKey(request)}:${session.sub}`, 8, 60_000)) {
    return NextResponse.json({ message: "محاولات كثيرة. انتظر دقيقة." }, { status: 429 });
  }
  const form = await request.formData();
  const kind = String(form.get("kind") || "");
  const upload = form.get("file");
  if (!isAccountFileKind(kind) || !(upload instanceof File)) {
    return NextResponse.json({ message: "أرفق ملفاً صالحاً." }, { status: 400 });
  }
  try {
    const bytes = Buffer.from(await upload.arrayBuffer());
    const saved = await saveAccountFile(session.sub, kind, {
      filename: upload.name,
      mime: upload.type || "application/octet-stream",
      bytes,
    });
    return NextResponse.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const message =
      code === "INVALID_FILE_TYPE"
        ? "صيغة الملف غير مسموحة. استخدم صورة أو PDF."
        : code === "FILE_TOO_LARGE"
          ? "حجم الملف أكبر من 4 ميغابايت."
          : "تعذّر رفع المرفق.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
