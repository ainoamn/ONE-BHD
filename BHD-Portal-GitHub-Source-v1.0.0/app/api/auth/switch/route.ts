import { NextResponse } from "next/server";
import {
  applyIdentitySwitch,
  publicAccount,
  readSessionRoster,
} from "../../../lib/auth/session";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function POST(request: Request) {
  const headers = new Headers(productCorsHeaders(request));
  headers.set("Cache-Control", "no-store");
  let sub = "";
  try {
    const body = (await request.json()) as { sub?: string; email?: string };
    sub = (typeof body.sub === "string" ? body.sub : body.email || "").trim();
  } catch {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400, headers });
  }
  if (!sub) {
    return NextResponse.json({ message: "الحساب مطلوب." }, { status: 400, headers });
  }

  const roster = await readSessionRoster(request);
  const target = roster.find((item) => item.sub === sub || item.email === sub);
  if (!target) {
    return NextResponse.json({ message: "هذا الحساب غير محفوظ في هذه الجلسة." }, { status: 404, headers });
  }

  // ALWAYS rewrite bhd_id (+ roster). Skipping the cookie when a Bearer was present
  // left SSR, /account, and product OAuth stuck on the first signed-in email.
  const response = NextResponse.json({ ok: true, user: publicAccount(target), accounts: roster.map(publicAccount) }, { headers });
  const switched = await applyIdentitySwitch(response.cookies, target.sub, roster, true);
  if (switched) {
    return NextResponse.json(
      {
        ok: true,
        user: publicAccount(switched.session),
        accounts: roster.map(publicAccount),
        token: switched.token,
      },
      { headers: response.headers },
    );
  }
  return response;
}
