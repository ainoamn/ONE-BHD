import { NextResponse } from "next/server";
import {
  applyIdentitySwitch,
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

  /**
   * Cookie policy (multi-window):
   * - Persist bhd_id when there is no Bearer (bootstrap) OR caller sends X-BHD-Persist-Cookie: 1
   *   (identity site SessionMenu — needed so /account SSR matches the switch).
   * - Product tabs switch with Bearer only and must NOT rewrite shared bhd_id, or every other
   *   tab that bootstraps from the cookie would jump accounts.
   */
  const persistCookie =
    !readBearerToken(request) || request.headers.get("x-bhd-persist-cookie") === "1";

  const response = NextResponse.json({ ok: true, user: publicAccount(target), accounts: roster.map(publicAccount) }, { headers });
  const switched = await applyIdentitySwitch(response.cookies, target.sub, roster, persistCookie);
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
