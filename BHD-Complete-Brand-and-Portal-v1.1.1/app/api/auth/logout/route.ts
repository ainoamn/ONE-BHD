import { NextResponse } from "next/server";
import { applyIdentityLogout, getCurrentSession, readSessionRoster } from "../../../lib/auth/session";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function POST(request: Request) {
  const headers = new Headers(productCorsHeaders(request));
  let all = false;
  try {
    const body = (await request.json()) as { all?: boolean };
    all = body.all === true;
  } catch {
    all = false;
  }

  const current = await getCurrentSession();
  const roster = await readSessionRoster();
  // Placeholder response to attach Set-Cookie, then rebuild body with remaining user.
  const jar = NextResponse.json({ ok: true }, { headers });
  const remaining = await applyIdentityLogout(jar.cookies, current, roster, all);
  const response = NextResponse.json(
    {
      ok: true,
      user: remaining
        ? { id: remaining.sub, name: remaining.name, email: remaining.email, picture: remaining.picture }
        : null,
    },
    { headers: jar.headers },
  );
  return response;
}
