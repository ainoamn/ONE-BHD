import { NextResponse } from "next/server";
import { readLiveAppLogo } from "../../../../lib/bhd/catalog-store";

export const runtime = "nodejs";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const logo = await readLiveAppLogo(id);
  if (!logo) return new NextResponse(null, { status: 404, headers: cors });
  return new NextResponse(new Uint8Array(logo.bytes), {
    headers: {
      ...cors,
      "Content-Type": logo.mime,
    },
  });
}
