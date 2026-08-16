import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "عن الشركة",
  description: "BHD — Bin Hamood Development. Build Higher Dreams: ابنِ أحلامًا أكبر.",
};

export default function AboutPage() {
  return (
    <InnerPageShell
      eyebrow="Bin Hamood Development"
      title="Bin Hamood Development هو الاسم. Build Higher Dreams هو الوعد."
      lead="من مسقط نبني منتجات وأعمالًا وتجارب تساعد الأفراد والشركات على رفع سقف طموحاتهم وتحويلها إلى واقع."
    >
      <section className="story-grid">
        <article className="story-main">
          <p className="section-kicker">فلسفة العلامة</p>
          <h2>BHD تحمل اسم الشركة والغاية التي تعمل من أجلها.</h2>
          <p><strong>Bin Hamood Development</strong> هي هويتنا المؤسسية، و<strong>Build Higher Dreams</strong> هو وعدنا لكل فرد وعائلة وشركة نعمل معها: لا نكتفي ببناء الحل، بل نرفع سقف ما يمكن أن يحققه.</p>
        </article>
        <div className="story-values">
          <article><span>B</span><h3>BUILD · نبني</h3><p>نحوّل الأفكار إلى منتجات وأعمال وفرص حقيقية.</p></article>
          <article><span>H</span><h3>HIGHER · نرتقي</h3><p>نرفع معيار التقنية والخدمة والتجربة والنتائج.</p></article>
          <article><span>D</span><h3>DREAMS · الأحلام</h3><p>نساعد الأفراد والشركات على تحويل الطموح إلى واقع.</p></article>
        </div>
      </section>
    </InnerPageShell>
  );
}
