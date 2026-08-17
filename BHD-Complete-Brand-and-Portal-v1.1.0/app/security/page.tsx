import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "الأمان والثقة",
  description: "ضوابط الأمان المطبقة في بوابة BHD وخطة حماية الهوية والمنتجات.",
};

const activeControls = [
  ["تشفير الاتصال", "تُقدّم البوابة عبر HTTPS/TLS لحماية البيانات أثناء انتقالها."],
  ["سياسة محتوى صارمة", "تقييد مصادر الأكواد والصور والاتصالات وتقليل مساحة هجمات حقن المحتوى."],
  ["منع التضمين", "لا يمكن عرض البوابة داخل إطار خارجي، ما يقلل هجمات النقر الخادع."],
  ["صلاحيات متصفح محدودة", "الكاميرا والميكروفون والموقع وواجهات حساسة أخرى معطلة في البوابة العامة."],
  ["لا كلمة مرور في البوابة", "الدخول التجريبي عبر Google: التحقق من الرمز على الخادم وجلسة HttpOnly. لا قاعدة مستخدمين ولا كلمات مرور مخزّنة هنا."],
  ["حدود واضحة", "روابط التطبيقات الخارجية معزولة. جلسة البوابة لا تفتح بيانات وازن أو حسابي حتى تُبنَى هوية BHD المركزية."],
];

export default function SecurityPage() {
  return (
    <InnerPageShell
      eyebrow="الأمان من التصميم"
      title="الأمان ليس ميزة إضافية."
      lead="نطبّق الحماية المناسبة لوظيفة البوابة الحالية. دخول Google يتحقق من الرمز على الخادم ولا يخزّن كلمة مرور في البوابة."
    >
      <section className="security-status">
        <span><i /> الحماية الأساسية مفعّلة</span>
        <p>هذه الصفحة تصف ما هو مطبق الآن وما هو مخطط له، بصورة واضحة دون وعود أمنية غير منفذة.</p>
      </section>
      <section className="security-grid">
        {activeControls.map(([title, description], index) => (
          <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{description}</p></article>
        ))}
      </section>
      <section className="security-roadmap">
        <div><small>المرحلة الحالية</small><h2>Google على البوابة — نفس فكرة حسابي</h2></div>
        <ul>
          <li>عميل Google OAuth واحد لكل منتجات BHD (نفس Client ID)</li>
          <li>كل موقع يتحقق من الرمز على خادمه ويُصدر جلسته الخاصة</li>
          <li>الخطوة التالية: هوية BHD المركزية (OIDC) حتى تصبح الجلسة واحدة عبر النطاق الرسمي</li>
        </ul>
      </section>
      <section className="security-roadmap">
        <div><small>المرحلة التالية</small><h2>هوية BHD وحساب BHD</h2></div>
        <ul>
          <li>تدفق تفويض الهوية مع حماية تبادل الرموز</li>
          <li>عميل مستقل ومفاتيح مستقلة لكل تطبيق</li>
          <li>تحقق متعدد العوامل ومفاتيح مرور وإدارة الأجهزة والجلسات</li>
          <li>تشفير الأسرار والبيانات الحساسة في التخزين</li>
          <li>سجل تدقيق وتنبيهات ومحاولات دخول محدودة المعدل</li>
        </ul>
      </section>
    </InnerPageShell>
  );
}
