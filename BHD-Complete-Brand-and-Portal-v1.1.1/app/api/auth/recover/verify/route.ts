import { NextResponse } from "next/server";
import { verifyRecoveryCodes } from "../../../../lib/auth/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { challengeId?: string; emailCode?: string; whatsappCode?: string };
    const result = await verifyRecoveryCodes({
      challengeId: body.challengeId || "",
      emailCode: body.emailCode || "",
      whatsappCode: body.whatsappCode,
    });
    return NextResponse.json({ ...result, message: "تم التحقق. عيّن كلمة مرور جديدة." });
  } catch {
    return NextResponse.json({ message: "رمز غير صالح أو منتهٍ." }, { status: 400 });
  }
}
