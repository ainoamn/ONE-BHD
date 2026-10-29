import { NextResponse } from "next/server";
import { bhdRuntimePayload, runtimeCorsHeaders } from "../../../lib/bhd/runtime";

export const runtime = "nodejs";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: runtimeCorsHeaders });
}

export function GET() {
  const runtime = bhdRuntimePayload();
  return NextResponse.json(
    {
      spec: runtime.catalog.spec,
      source: runtime.endpoints.catalog,
      live: true,
      autoPush: false,
      sessionMaxAgeSec: runtime.session.maxAgeSec,
      script: runtime.script,
      apps: runtime.catalog.apps,
      hops: runtime.catalog.hops,
    },
    { headers: runtimeCorsHeaders },
  );
}
