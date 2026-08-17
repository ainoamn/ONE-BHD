import { NextResponse } from "next/server";
import { databaseHealth } from "../../../lib/auth/users";
import { isDatabaseConfigured } from "../../../../db";
import { googleClientId, authSecret } from "../../../lib/auth/config";

export const runtime = "nodejs";

export async function GET() {
  const db = await databaseHealth();
  return NextResponse.json(
    {
      databaseConfigured: isDatabaseConfigured(),
      databaseOk: db.ok,
      users: db.users ?? null,
      googleConfigured: Boolean(googleClientId()),
      authSecretConfigured: Boolean(authSecret()),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
