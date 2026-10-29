import { NextResponse } from "next/server";
import { BHD_APP_SWITCHER_SPEC, BHD_APPS, hopUrls } from "../../../lib/bhd/apps";

export const runtime = "nodejs";

/** Frozen catalog for other BHD sites. Copying apps.ts is still required unless the product fetches this URL. */
export function GET() {
  return NextResponse.json(
    {
      spec: BHD_APP_SWITCHER_SPEC,
      source: "https://id.bhd-om.com/api/bhd/catalog",
      autoPush: false,
      apps: BHD_APPS,
      hops: hopUrls(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
