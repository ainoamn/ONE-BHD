import type { Metadata } from "next";
import { BrandLogo } from "../components/BrandLogo";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  return (
    <InnerPageShell
      eyebrow="تواصل مع BHD"
      title="لنبنِ شيئًا عمليًا."
      lead="حتى اعتماد قنوات التواصل الرسمية، نستقبل ملاحظات المشاريع والمتابعة التقنية عبر حساب BHD في GitHub دون جمع بياناتك داخل البوابة."
    >
      <section className="contact-panel">
        <div><BrandLogo className="contact-official-logo" /><small>BIN HAMOOD DEVELOPMENT</small></div>
        <h2>مسقط، سلطنة عُمان</h2>
        <p>يمكنك الاطلاع على المشاريع المفتوحة وحالة تطويرها من الملف الرسمي.</p>
        <a className="primary-button" href="https://github.com/ainoamn" target="_blank" rel="noopener noreferrer">
          فتح GitHub <span aria-hidden="true">←</span>
        </a>
      </section>
    </InnerPageShell>
  );
}
