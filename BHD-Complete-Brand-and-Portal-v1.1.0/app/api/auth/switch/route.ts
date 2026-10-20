import { NextResponse } from "next/server";
import { applyIdentitySwitch, readSessionRoster } from "../../../lib/auth/session";
import { productCorsHeaders, productCorsPreflight } from "../../../lib/auth/product-cors";

export const runtime = "nodejs";

export function OPTIONS(request: Request) {
  return productCorsPreflight(request);
}

export async function POST(request: Request) {
  const headers = new Headers(productCorsHeaders(request));
  let sub = "";
  try {
    const body = (await request.json()) as { sub?: string };
    sub = typeof body.sub === "string" ? body.sub.trim() : "";
  } catch {
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400, headers });
  }
  if (!sub) {
    return NextResponse.json({ message: "الحساب مطلوب." }, { status: 400, headers });
  }

  const roster = await readSessionRoster();
  const target = roster.find((item) => item.sub === sub);
  if (!target) {
    return NextResponse.json({ message: "هذا الحساب غير محفوظ في هذه الجلسة." }, { status: 404, headers });
  }
  const response = NextResponse.json(
    {
      ok: true,
      user: { id: target.sub, name: target.name, email: target.email, picture: target.picture },
      accounts: roster.map((item) => ({
        id: item.sub,
        name: item.name,
        email: item.email,
        picture: item.picture,
      })),
    },
    { headers },
  );
  await applyIdentitySwitch(response.cookies, sub, roster);
  return response;
}
