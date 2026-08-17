import type { Metadata } from "next";
import { BrandLogo } from "../components/BrandLogo";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";
import { LoginPanel } from "./LoginPanel";

export const metadata: Metadata = { title: "دخول حساب BHD" };

export default function LoginPage() {
  return (
    <InnerPageShell
      eyebrow="حساب BHD"
      title="دخول واحد بحساب Google."
      lead="هذه هي الخطوة الأولى للهوية الموحدة: نفس طريقة حسابي — زر Google، تحقق من الرمز على الخادم، ثم جلسة آمنة في كوكي HttpOnly."
    >
      <section className="login-notice">
        <span><BrandLogo kind="mark" tone="light" /></span>
        <div>
          <small>تجريبي على البوابة</small>
          <h2>سجّل الدخول بحساب Google</h2>
          <p>
            لا نطلب كلمة مرور. نتحقق من رمز Google على الخادم ثم ننشئ جلسة للبوابة فقط.
            المنتجات الأخرى (وازن، حسابي، نَسَب) تبقى مستقلة حتى تُربَط بنفس عميل Google ثم بهوية BHD المركزية.
          </p>
          <LoginPanel />
          <InstantLink href="/security">اقرأ ضوابط الأمان <b aria-hidden="true">←</b></InstantLink>
        </div>
      </section>
    </InnerPageShell>
  );
}
