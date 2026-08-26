import { NextResponse } from "next/server";
import {
  listRegisteredClientsAdmin,
  registerOauthClient,
  updateRegisteredClient,
} from "../../../lib/auth/admin-clients";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";

export const runtime = "nodejs";

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);
  const clients = await listRegisteredClientsAdmin();
  return NextResponse.json({ clients }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const body = (await request.json().catch(() => null)) as {
    clientId?: string;
    name?: string;
    origin?: string;
    workspacePath?: string;
    redirectUri?: string;
    postLogoutUri?: string;
    mode?: "browse" | "sso";
    notes?: string;
  } | null;

  try {
    const result = await registerOauthClient({
      clientId: body?.clientId || "",
      name: body?.name || "",
      origin: body?.origin || "",
      workspacePath: body?.workspacePath,
      redirectUri: body?.redirectUri || "",
      postLogoutUri: body?.postLogoutUri,
      mode: body?.mode,
      notes: body?.notes,
    });
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const map: Record<string, { status: number; message: string }> = {
      INVALID_CLIENT_ID: { status: 400, message: "client_id يجب أن يبدأ بـ bhd- (حروف لاتينية وأرقام وشرطة)." },
      CLIENT_ID_RESERVED: { status: 409, message: "هذا client_id محجوز في القائمة الثابتة." },
      CLIENT_EXISTS: { status: 409, message: "العميل مسجّل مسبقاً." },
      INVALID_NAME: { status: 400, message: "أدخل اسم المنتج." },
      ORIGIN_MUST_BE_HTTPS: { status: 400, message: "الأصل يجب أن يكون https (أو localhost للتطوير)." },
    };
    const hit = map[code] || { status: 400, message: "تعذّر تسجيل العميل. تحقق من الروابط والصيغة." };
    return NextResponse.json({ message: hit.message, code }, { status: hit.status });
  }
}

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const body = (await request.json().catch(() => null)) as {
    clientId?: string;
    mode?: "browse" | "sso";
    enabled?: boolean;
    workspacePath?: string;
    redirectUri?: string;
  } | null;

  try {
    const client = await updateRegisteredClient(body?.clientId || "", {
      mode: body?.mode,
      enabled: body?.enabled,
      workspacePath: body?.workspacePath,
      redirectUri: body?.redirectUri,
    });
    return NextResponse.json({ client }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const map: Record<string, { status: number; message: string }> = {
      STATIC_CLIENT_READONLY: { status: 400, message: "العملاء الثابتون يُحدَّثون من الكود فقط." },
      NOT_FOUND: { status: 404, message: "العميل غير موجود." },
    };
    const hit = map[code] || { status: 400, message: "تعذّر التحديث." };
    return NextResponse.json({ message: hit.message, code }, { status: hit.status });
  }
}
