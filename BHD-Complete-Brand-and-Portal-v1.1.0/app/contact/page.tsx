import type { Metadata } from "next";
import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  return (
    <InnerPageShell
      eyebrow="تواصل مع BHD"
      title="لنبنِ شيئًا عمليًا."
      lead="شركة بن حمود للتطوير من مسقط. الصفحات العامة لا تجمع بياناتك؛ تفاصيل الشركة والعلامة موجودة داخل الموقع."
    >
      <section className="contact-panel">
        <div><BrandLogo className="contact-official-logo" /><small>بن حمود للتطوير</small></div>
        <h2>مسقط، سلطنة عُمان</h2>
        <p>تعرّف على الشركة ومنتجاتها من الصفحات الرسمية للبوابة.</p>
        <InstantLink className="primary-button" href="/about">
          عن الشركة <span aria-hidden="true">←</span>
        </InstantLink>
      </section>
    </InnerPageShell>
  );
}
