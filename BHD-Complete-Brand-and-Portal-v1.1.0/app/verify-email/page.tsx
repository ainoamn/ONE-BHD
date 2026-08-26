import type { Metadata } from "next";
import { InstantLink } from "../components/InstantLink";
import { BrandLogo } from "../components/BrandLogo";

export const metadata: Metadata = {
  title: "تأكيد البريد",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; code?: string }>;
}) {
  const params = await searchParams;
  const ok = params.status === "ok";
  const code = params.code || "";

  const errorText =
    code === "TOKEN_EXPIRED"
      ? "انتهت صلاحية الرابط. اطلب رابطاً جديداً من صفحة الحساب."
      : code === "TOKEN_USED"
        ? "هذا الرابط استُخدم مسبقاً."
        : code === "RESEND_NOT_CONFIGURED" || code === "DATABASE"
          ? "خدمة التأكيد غير جاهزة حالياً."
          : "رابط التأكيد غير صالح.";

  return (
    <main className="verify-email-screen" dir="rtl">
      <div className="verify-email-card">
        <BrandLogo kind="full" className="verify-email-logo" />
        <h1>{ok ? "تم تأكيد البريد" : "تعذّر تأكيد البريد"}</h1>
        <p>{ok ? "حساب BHD أصبح موثّقاً. يمكنك العودة إلى وازن أو أي منتج وإكمال الدخول." : errorText}</p>
        <div className="verify-email-actions">
          <InstantLink className="primary-button" href={ok ? "/account" : "/login?next=/account"}>
            {ok ? "فتح الحساب" : "الذهاب لتسجيل الدخول"}
          </InstantLink>
          <InstantLink className="text-button" href="/">
            الرئيسية
          </InstantLink>
        </div>
      </div>
    </main>
  );
}
