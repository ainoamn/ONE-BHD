import { NextResponse } from "next/server";
import { finishRecoveryPassword } from "../../../../lib/auth/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { challengeId?: string; password?: string };
    await finishRecoveryPassword({ challengeId: body.challengeId || "", password: body.password || "" });
    return NextResponse.json({ ok: true, message: "تم تعيين كلمة المرور. يمكنك الدخول الآن." });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "WEAK_PASSWORD") {
      return NextResponse.json({ message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." }, { status: 400 });
    }
    return NextResponse.json({ message: "تعذّر إكمال الاستعادة." }, { status: 400 });
  }
}
