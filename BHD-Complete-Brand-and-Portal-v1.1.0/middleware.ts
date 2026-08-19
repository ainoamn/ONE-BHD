import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "id.bhd-om.com";

const IDENTITY_PREFIXES = [
  "/login",
  "/account",
  "/admin",
  "/oauth",
  "/callback",
  "/api/auth",
  "/api/account",
  "/api/admin",
];

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0];
  if (host === "localhost" || host === "127.0.0.1" || host === CANONICAL_HOST) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const isIdentity = IDENTITY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  if (!isIdentity) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/account",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
    "/oauth/:path*",
    "/callback",
    "/callback/:path*",
    "/api/auth/:path*",
    "/api/account",
    "/api/account/:path*",
    "/api/admin/:path*",
  ],
};
