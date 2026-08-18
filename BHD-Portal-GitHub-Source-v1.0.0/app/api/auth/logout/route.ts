import { NextResponse } from "next/server";
import { clearSessionCookies } from "../../../lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response.cookies);
  return response;
}
