import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";
import { LiveProgramsGuide } from "../components/bhd/LiveProgramsGuide";

export const metadata: Metadata = {
  title: "برامجنا",
  description: "كل تطبيقات بن حمود للتطوير: ماذا تفعل، فوائدها، وكيف تعمل. حساب BHD واحد يفتحها جميعاً.",
};

export default function AppsPage() {
  return (
    <InnerPageShell
      eyebrow="برامجنا"
      title="تطبيقات بن حمود للتطوير في مكان واحد."
      lead="كل برنامج مستقل ببياناته وفواتيره. حساب BHD يفتحها بنفس الهوية البصرية دون خلط المحافظ أو الطلبات."
    >
      <section className="company-brief">
        <p className="section-kicker">نبذة عن الشركة</p>
        <h2>بن حمود للتطوير هو الاسم. ابنِ أحلامًا أكبر هو الوعد.</h2>
        <p>
          من مسقط نبني منتجات عربية واضحة للأفراد والأعمال. الهوية البصرية واحدة: الأخضر العُماني، العربية أولاً، وهدوء التصميم.
          تفاصيل الشركة في <InstantLink href="/about">عن الشركة</InstantLink>
          {" "}ودليل الألوان والشعار في <InstantLink href="/brand">هوية الشركة</InstantLink>.
        </p>
      </section>

      <LiveProgramsGuide />
    </InnerPageShell>
  );
}
