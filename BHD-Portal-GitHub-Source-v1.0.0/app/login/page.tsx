import type { Metadata } from "next";
import { BrandLogo } from "../components/BrandLogo";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";

export const metadata: Metadata = { title: "حساب BHD — قريبًا" };

export default function LoginPage() {
  return (
    <InnerPageShell
      eyebrow="حساب BHD"
      title="الحساب الموحد قيد البناء الآمن."
      lead="لن نعرض نموذج دخول شكليًا أو نجمع كلمة مرور قبل اكتمال خدمة الهوية وفق المعايير الصحيحة."
    >
      <section className="login-notice">
        <span><BrandLogo kind="mark" tone="light" /></span>
        <div>
          <small>قريبًا</small>
          <h2>تسجيل واحد لكل منتجات BHD</h2>
          <p>سيُبنى الدخول عبر معيار الهوية المفتوحة، مع جلسة مستقلة لكل تطبيق، ودعم التحقق المتعدد وإدارة الأجهزة.</p>
          <InstantLink href="/security">اقرأ خطة الأمان <b aria-hidden="true">←</b></InstantLink>
        </div>
      </section>
    </InnerPageShell>
  );
}
