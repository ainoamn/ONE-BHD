import { NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "../../../lib/auth/email-verification";
import { isDatabaseConfigured } from "../../../../db";
import { identityIssuer } from "../../../lib/identity/issuer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const origin = identityIssuer(request);

  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(new URL("/verify-email?status=error&code=DATABASE", origin));
  }

  try {
    await consumeEmailVerificationToken(token);
    return NextResponse.redirect(new URL("/verify-email?status=ok", origin));
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.redirect(new URL(`/verify-email?status=error&code=${encodeURIComponent(code)}`, origin));
  }
}
