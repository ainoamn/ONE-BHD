import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";
import { listLiveApps, upsertLiveApp } from "../../../lib/bhd/catalog-store";

export const runtime = "nodejs";

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const apps = await listLiveApps();
  return NextResponse.json({ apps }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const app = await upsertLiveApp({
      id: String(body?.id || ""),
      create: true,
      nameAr: String(body?.nameAr || ""),
      nameEn: String(body?.nameEn || ""),
      origin: String(body?.origin || ""),
      workspacePath: String(body?.workspacePath || "/"),
      homePath: String(body?.homePath || "/"),
      mode: body?.mode === "identity" || body?.mode === "browse" ? body.mode : "sso",
      enabled: body?.enabled !== false,
      mark: String(body?.mark || "B"),
      accent: String(body?.accent || "#075c45"),
      soft: String(body?.soft || "#e6f1ec"),
      sortOrder: Number(body?.sortOrder ?? 99),
      clientId: body?.clientId == null ? undefined : String(body.clientId),
    });
    return NextResponse.json({ app }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ message: "تعذّر إضافة التطبيق.", code }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  try {
    const app = await upsertLiveApp({
      id: String(body?.id || ""),
      nameAr: body?.nameAr != null ? String(body.nameAr) : undefined,
      nameEn: body?.nameEn != null ? String(body.nameEn) : undefined,
      origin: body?.origin != null ? String(body.origin) : undefined,
      workspacePath: body?.workspacePath != null ? String(body.workspacePath) : undefined,
      homePath: body?.homePath != null ? String(body.homePath) : undefined,
      mode: body?.mode === "identity" || body?.mode === "browse" || body?.mode === "sso" ? body.mode : undefined,
      enabled: typeof body?.enabled === "boolean" ? body.enabled : undefined,
      mark: body?.mark != null ? String(body.mark) : undefined,
      accent: body?.accent != null ? String(body.accent) : undefined,
      soft: body?.soft != null ? String(body.soft) : undefined,
      sortOrder: body?.sortOrder != null ? Number(body.sortOrder) : undefined,
    });
    return NextResponse.json({ app }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ message: "تعذّر حفظ التطبيق.", code }, { status });
  }
}
