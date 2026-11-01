import { NextResponse } from "next/server";
import { isAccountFileKind, readAccountFile } from "../../../../lib/auth/account-files";
import { requireProductClient } from "../../../../lib/identity/product-auth";
import { isDatabaseConfigured } from "../../../../../db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/product/account/file?sub=&kind= — stream an Identity account attachment
 * for a first-party product (site admin dossier mirroring).
 */
export async function GET(request: Request) {
  const gate = await requireProductClient(request);
  if (!gate.ok) {
    return NextResponse.json(
      { message: gate.status === 401 ? "invalid_client" : "forbidden_client" },
      { status: gate.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "database_unavailable" }, { status: 503 });
  }

  const url = new URL(request.url);
  const sub = url.searchParams.get("sub")?.trim() || "";
  const kind = url.searchParams.get("kind")?.trim() || "";
  if (!UUID.test(sub)) {
    return NextResponse.json({ message: "invalid_sub" }, { status: 400 });
  }
  if (!isAccountFileKind(kind)) {
    return NextResponse.json({ message: "invalid_kind" }, { status: 400 });
  }

  const file = await readAccountFile(sub, kind);
  if (!file) {
    return NextResponse.json({ message: "not_found" }, { status: 404 });
  }

  const bytes = Buffer.from(file.content, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
