import { NextResponse } from "next/server";
import { bhdRuntimePayload, runtimeCorsHeaders } from "../../../lib/bhd/runtime";

export const runtime = "nodejs";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: runtimeCorsHeaders });
}

export async function GET() {
  return NextResponse.json(await bhdRuntimePayload(), { headers: runtimeCorsHeaders });
}
