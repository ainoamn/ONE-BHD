import { NextResponse } from "next/server";
import { getAccountProfile } from "../../../lib/auth/users";
import { requireProductClient } from "../../../lib/identity/product-auth";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * GET /api/product/account?sub= — first-party products read the live Identity
 * account profile (same payload shape as /api/account) for a user `sub`.
 */
export async function GET(request: Request) {
  const gate = await requireProductClient(request);
  if (!gate.ok) {
    return noStore(
      { message: gate.status === 401 ? "invalid_client" : "forbidden_client" },
      gate.status,
    );
  }
  if (!isDatabaseConfigured()) {
    return noStore({ message: "database_unavailable" }, 503);
  }

  const sub = new URL(request.url).searchParams.get("sub")?.trim() || "";
  if (!UUID.test(sub)) return noStore({ message: "invalid_sub" }, 400);

  const profile = await getAccountProfile(sub);
  if (!profile) return noStore({ message: "not_found" }, 404);

  return noStore({
    user: profile.user,
    contact: profile.contact,
    files: profile.files,
    source: "identity",
    fetchedAt: new Date().toISOString(),
  });
}
