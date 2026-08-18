import { NextResponse } from "next/server";
import { adminOverview } from "../../../lib/auth/admin-users";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";
import { identityIssuer } from "../../../lib/identity/issuer";
import { googleClientId, authSecret } from "../../../lib/auth/config";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) {
    return NextResponse.json(
      { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
      { status: gate.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const overview = await adminOverview();
  return NextResponse.json(
    {
      spec: "bhd-identity.v1",
      issuer: identityIssuer(request),
      admin: gate.session,
      googleConfigured: Boolean(googleClientId()),
      authSecretConfigured: Boolean(authSecret()),
      ...overview,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
