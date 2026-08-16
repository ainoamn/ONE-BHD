import type { Metadata } from "next";
import { BrandLogo } from "../components/BrandLogo";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";

export const metadata: Metadata = { title: "BHD Account — قريبًا" };

export default function LoginPage() {
  return (
    <InnerPageShell
      eyebrow="BHD Account"
      title="الحساب الموحد قيد البناء الآمن."
      lead="لن نعرض نموذج دخول شكليًا أو نجمع كلمة مرور قبل اكتمال خدمة الهوية وفق المعايير الصحيحة."
    >
      <section className="login-notice">
        <span><BrandLogo kind="mark" tone="light" /></span>
        <div>
          <small>COMING SOON</small>
          <h2>تسجيل واحد لكل منتجات BHD</h2>
          <p>سيُبنى الدخول عبر OpenID Connect، مع جلسة مستقلة لكل تطبيق، ودعم التحقق المتعدد وإدارة الأجهزة.</p>
          <InstantLink href="/security">اقرأ خطة الأمان <b aria-hidden="true">←</b></InstantLink>
        </div>
      </section>
    </InnerPageShell>
  );
}
