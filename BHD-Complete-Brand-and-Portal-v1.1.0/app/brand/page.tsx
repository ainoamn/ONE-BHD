import type { Metadata } from "next";
import Image from "next/image";
import { BrandLogo } from "../components/BrandLogo";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "دليل الهوية",
  description: "فلسفة BHD ونظامها البصري ووعد Build Higher Dreams وملفات الهوية القابلة للتنزيل.",
  alternates: { canonical: "/brand" },
};

const palette = [
  ["عُمان العميق", "#092D24", "الأساس المؤسسي والثقة"],
  ["فيروز BHD", "#08A39F", "الابتكار والحركة"],
  ["بحري BHD", "#174B70", "الهندسة والاحتراف"],
  ["ذهب الطموح", "#B58D55", "الارتقاء والتميّز"],
  ["الرمل", "#F4F0E8", "الجذور العُمانية"],
  ["الأبيض الدافئ", "#FBFAF7", "الوضوح والمساحة"],
];

const systemItems = [
  ["الشعارات", "الشعار الرئيسي، الرمز، النسخة المكتوبة، الأحادية، المعكوسة، وشعار BHD STORE."],
  ["المطبوعات", "بطاقة العمل، ورق المراسلات، الظرف، الفاتورة، سند القبض وسند الصرف."],
  ["التسويق", "بروشور، مطوية، كتالوج، بروفايل شركة من خمس صفحات، وصفحات عرض المنتجات."],
  ["الإعلانات", "رول أب، بوستر، بنرات رقمية، لوحة إعلانية، ولوحة واجهة محل."],
  ["الأصول الإضافية", "هدايا، تقويم، مذكرة، خلفيات، نمط بصري، وتوقيع بريد."],
  ["النظام الرقمي", "قواعد الويب، الوصول، الحركة، الشبكات، وصيغة توسع المنتجات."],
];

export default function BrandPage() {
  return (
    <InnerPageShell
      eyebrow="BHD BRAND SYSTEM · BUILD HIGHER DREAMS"
      title="هوية عُمانية تبني أحلامًا أكبر."
      lead="نظام متكامل يحوّل BHD من شعار إلى وعد واضح، ولغة بصرية، وصوت مؤسسي، وقوالب قابلة للتطبيق على كل منتج ونقطة تواصل."
    >
      <section className="brand-guide-intro">
        <article className="brand-guide-logo-card">
          <Image src="/brand/bhd-logo.svg" alt="شعار Bin Hamood Development" width={1200} height={390} priority />
          <div><span>الاسم المؤسسي</span><b>Bin Hamood Development</b></div>
          <div><span>وعد العلامة</span><b>Build Higher Dreams</b></div>
        </article>
        <article className="brand-guide-copy">
          <p className="section-kicker">شرح الشعار</p>
          <h2>ثلاثة أحرف. معنيان. وعد واحد.</h2>
          <p>يربط الشعار بين الاسم القانوني للشركة وبين فلسفتها. البنية الهندسية تعبّر عن الدقة، الفتحات والمساحات تعبّر عن الإمكان، والتتابع الأفقي يحوّل BHD إلى حركة صاعدة من البناء إلى الطموح ثم إلى الحلم.</p>
          <div className="brand-equation" dir="ltr">
            <span><b>BHD</b><small>BIN HAMOOD DEVELOPMENT</small></span>
            <i>=</i>
            <span><b>BHD</b><small>BUILD HIGHER DREAMS</small></span>
          </div>
        </article>
      </section>

      <section className="brand-build-section">
        <div className="brand-guide-heading">
          <p className="section-kicker">كيف بُنيت الهوية؟</p>
          <h2>معادلة واحدة تجمع المؤسسة والطموح والإنسان.</h2>
        </div>
        <div className="brand-build-grid">
          <article><span>B</span><small>BUILD · نبني</small><h3>بنية هندسية ثابتة</h3><p>حواف واضحة ووحدات قابلة للقياس تعكس بناء المنتجات والأعمال على أساس يمكن الوثوق به.</p></article>
          <article><span>H</span><small>HIGHER · نرتقي</small><h3>أفق مفتوح وصاعد</h3><p>المسار الأفقي المفتوح يرمز إلى رفع المعيار وتجاوز الحل المعتاد نحو قيمة أكبر.</p></article>
          <article><span>D</span><small>DREAMS · نحلم</small><h3>مساحة للإمكان</h3><p>الحرف المفتوح لا يغلق الفكرة؛ يترك للحلم طريقًا كي يتحول إلى منتج وتجربة وأثر.</p></article>
        </div>
      </section>

      <section className="brand-values-panel">
        <BrandLogo kind="mark" tone="light" className="brand-values-mark" />
        <div><p className="section-kicker light">جوهر العلامة</p><h2>نبني بوضوح. نرتقي بالمعيار. ونمنح الطموح طريقًا.</h2></div>
        <ul><li>عُمانية الجذور، عالمية الطموح.</li><li>إنسانية في الغاية، هندسية في التنفيذ.</li><li>هادئة وواثقة، لا صاخبة ولا متكلّفة.</li><li>قابلة للنمو من منتج واحد إلى منظومة كاملة.</li></ul>
      </section>

      <section className="brand-palette-section">
        <div className="brand-guide-heading"><p className="section-kicker">نظام الألوان</p><h2>عمق عُماني مع إشارات تقنية راقية.</h2></div>
        <div className="brand-palette-grid">
          {palette.map(([name, hex, meaning]) => (
            <article key={hex} style={{ background: hex, color: hex === "#F4F0E8" || hex === "#FBFAF7" ? "#092D24" : "#fff" }}>
              <span>{hex}</span><h3>{name}</h3><p>{meaning}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-system-section">
        <div className="brand-guide-heading"><p className="section-kicker">مكوّنات النظام</p><h2>هوية جاهزة لكل نقطة تواصل.</h2><p>جميع القوالب مبنية بصيغة SVG قابلة للتحرير، مع دليل استخدام PDF ونسخ PNG للمعاينة.</p></div>
        <div className="brand-system-grid">
          {systemItems.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="brand-ambition-section">
        <div><p className="section-kicker light">طموح الموقع والمنظومة</p><h2>من بوابة تعريفية إلى طبقة الثقة والهوية لمنظومة BHD.</h2></div>
        <div className="brand-ambition-grid">
          <article><span>الآن</span><h3>علامة ومنتجات</h3><p>تقديم الشركة، توحيد القصة، وتوجيه المستخدم إلى المنتج الصحيح بأداء سريع وتجربة عربية.</p></article>
          <article><span>التالي</span><h3>هوية ودخول موحد</h3><p>BHD Identity وفق OpenID Connect، مع جلسات مستقلة، MFA، وعدم خلط قواعد بيانات المنتجات.</p></article>
          <article><span>الطموح</span><h3>منصة وتحكم موثوق</h3><p>سجل خدمات، صحة وإصدارات، تحكم مركزي مضبوط بالصلاحيات، ومساعد ذكي يحترم الخصوصية.</p></article>
        </div>
      </section>

      <section className="brand-download-section">
        <div><p className="section-kicker">مركز التنزيل</p><h2>كل الهوية في ملفات قابلة للتحرير والطباعة.</h2><p>الحزمة تشمل الشعارات والقوالب والمطبوعات والإعلانات والخلفيات ومصادر التوليد، ومهيأة للرفع إلى Git أو تسليمها للمصمم والمطبعة.</p></div>
        <div className="brand-download-actions">
          <a className="primary-button" href="/downloads/BHD-Brand-Kit.zip" download>تنزيل حزمة الهوية الكاملة <span>↓</span></a>
          <a className="outline-button" href="/downloads/BHD-Visual-Identity-Guidelines.pdf" download>تنزيل دليل الهوية PDF <span>↓</span></a>
          <a className="brand-text-download" href="/downloads/BHD-Brand-Board-4K.png" download>تنزيل لوحة الهوية 4K</a>
          <a className="brand-text-download" href="/brand/bhd-logo.svg" download>تنزيل الشعار المتجهي SVG</a>
          <a className="brand-text-download" href="/brand/bhd-logo-4096.png" download>تنزيل الشعار PNG بدقة 4096</a>
        </div>
      </section>
    </InnerPageShell>
  );
}
