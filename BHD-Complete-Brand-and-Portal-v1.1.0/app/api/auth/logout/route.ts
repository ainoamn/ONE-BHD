import { NextResponse } from "next/server";
import {
  applyIdentityLogout,
  getCurrentSession,
  publicAccount,
  readBearerToken,
  readSessionRoster,
} from "../../../lib/auth/session";
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

  const current = await getCurrentSession(request);
  const roster = await readSessionRoster(request);
  const jar = NextResponse.json({ ok: true }, { headers });
  const windowOnly = Boolean(readBearerToken(request)) && !all;
  const remaining = windowOnly ? null : await applyIdentityLogout(jar.cookies, current, roster, all);
  const left = remaining ? roster.filter((item) => item.sub !== current?.sub) : windowOnly ? roster : [];
  return NextResponse.json(
    {
      ok: true,
      user: remaining ? publicAccount(remaining) : null,
      accounts: remaining || windowOnly ? left.map(publicAccount) : [],
    },
    { headers: jar.headers },
  );
}
