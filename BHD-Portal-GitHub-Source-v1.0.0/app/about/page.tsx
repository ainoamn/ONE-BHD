import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "عن الشركة",
  description: "بن حمود للتطوير. ابنِ أحلامًا أكبر: وعد الشركة لكل فرد وعائلة وعمل.",
};

export default function AboutPage() {
  return (
    <InnerPageShell
      eyebrow="بن حمود للتطوير"
      title="بن حمود للتطوير هو الاسم. ابنِ أحلامًا أكبر هو الوعد."
      lead="من مسقط نبني منتجات وأعمالًا وتجارب تساعد الأفراد والشركات على رفع سقف طموحاتهم وتحويلها إلى واقع."
    >
      <section className="story-grid">
        <article className="story-main">
          <p className="section-kicker">فلسفة العلامة</p>
          <h2>BHD تحمل اسم الشركة والغاية التي تعمل من أجلها.</h2>
          <p><strong>بن حمود للتطوير</strong> هي هويتنا المؤسسية، و<strong>ابنِ أحلامًا أكبر</strong> هو وعدنا لكل فرد وعائلة وشركة نعمل معها: لا نكتفي ببناء الحل، بل نرفع سقف ما يمكن أن يحققه.</p>
        </article>
        <div className="story-values">
          <article><span>B</span><h3>نبني</h3><p>نحوّل الأفكار إلى منتجات وأعمال وفرص حقيقية.</p></article>
          <article><span>H</span><h3>نرتقي</h3><p>نرفع معيار التقنية والخدمة والتجربة والنتائج.</p></article>
          <article><span>D</span><h3>الأحلام</h3><p>نساعد الأفراد والشركات على تحويل الطموح إلى واقع.</p></article>
        </div>
      </section>
    </InnerPageShell>
  );
}
