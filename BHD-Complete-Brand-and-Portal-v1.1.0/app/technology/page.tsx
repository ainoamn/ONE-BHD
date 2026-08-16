import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "التقنية والهندسة",
  description: "كيف تبني BHD منظومة منتجات مستقلة بهوية وتجربة موحدة.",
};

const layers = [
  ["01", "بوابة BHD", "تعرض المنتجات وتربط المستخدم بالمنظومة دون تخزين بياناتها التشغيلية."],
  ["02", "هوية BHD", "خدمة هوية مستقلة مستقبلًا مبنية على معيار الهوية المفتوحة وتفويض التطبيقات."],
  ["03", "تطبيقات مستقلة", "لكل منتج مستودع ونشر وقاعدة بيانات وصلاحيات محلية مستقلة."],
  ["04", "واجهات موثقة", "التكامل المستقبلي يتم عبر واجهات برمجية محددة، وليس عبر قراءة قواعد بيانات التطبيقات."],
];

export default function TechnologyPage() {
  return (
    <InnerPageShell
      eyebrow="الهندسة والمنظومة"
      title="استقلال في الداخل، واتساق في الخارج."
      lead="نبني BHD بحيث لا يؤدي تحديث منتج أو تعطل خدمته إلى إسقاط بقية المنظومة، مع تجربة واضحة للمستخدم عبر كل المنتجات."
    >
      <section className="tech-layers">
        {layers.map(([number, title, description]) => (
          <article key={number}>
            <span>{number}</span>
            <div><h2>{title}</h2><p>{description}</p></div>
          </article>
        ))}
      </section>
      <section className="principle-banner">
        <small>القاعدة الهندسية</small>
        <h2>هوية واحدة. بيانات مستقلة. صلاحيات محلية.</h2>
        <p>هذه الحدود تقلل أثر الأعطال وتمنع التطبيق الواحد من الوصول غير الضروري إلى بيانات بقية المنتجات.</p>
      </section>
      <section className="ai-foundation" aria-labelledby="ai-foundation-title">
        <div className="ai-foundation-heading">
          <small>طبقة الذكاء في BHD</small>
          <h2 id="ai-foundation-title">ذكاء مفيد، داخل حدود واضحة.</h2>
          <p>نبدأ بمطابقة محلية سريعة داخل المتصفح، ونجهّز المنظومة لربط نماذج الذكاء الاصطناعي مستقبلًا عبر بوابة خادمة آمنة بدل كشف المفاتيح أو البيانات للمستخدم.</p>
        </div>
        <div className="ai-foundation-grid">
          <article><span>01</span><h3>بوابة خاصة</h3><p>أي اتصال بنموذج مستقبلي يمر عبر خادم BHD بسياسات وصول وتحديد معدل واضحة.</p></article>
          <article><span>02</span><h3>سياق موثوق</h3><p>الإجابات تُبنى على معرفة المنتجات الموثقة، مع فصل بيانات كل منتج عن الآخر.</p></article>
          <article><span>03</span><h3>حواجز أمان</h3><p>تقليل البيانات، سجلات مدروسة، ومراجعة بشرية للقرارات الحساسة قبل الإطلاق.</p></article>
        </div>
      </section>
    </InnerPageShell>
  );
}
