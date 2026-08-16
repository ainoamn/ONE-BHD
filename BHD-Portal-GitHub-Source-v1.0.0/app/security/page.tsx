import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "الأمان والثقة",
  description: "ضوابط الأمان المطبقة في بوابة BHD وخطة حماية الهوية والمنتجات.",
};

const activeControls = [
  ["تشفير الاتصال", "تُقدّم البوابة عبر HTTPS/TLS لحماية البيانات أثناء انتقالها."],
  ["سياسة محتوى صارمة", "تقييد مصادر الأكواد والصور والاتصالات وتقليل مساحة هجمات حقن المحتوى."],
  ["منع التضمين", "لا يمكن عرض البوابة داخل إطار خارجي، ما يقلل هجمات clickjacking."],
  ["صلاحيات متصفح محدودة", "الكاميرا والميكروفون والموقع وواجهات حساسة أخرى معطلة في البوابة العامة."],
  ["لا بيانات شخصية", "النسخة الحالية لا تجمع كلمات مرور أو ملفات أو بيانات مالية ولا تستخدم قاعدة مستخدمين."],
  ["حدود واضحة", "روابط التطبيقات الخارجية معزولة، وكل منتج يبقى مسؤولًا عن جلساته وبياناته."],
];

export default function SecurityPage() {
  return (
    <InnerPageShell
      eyebrow="Security by design"
      title="الأمان ليس ميزة إضافية."
      lead="نطبّق الحماية المناسبة لوظيفة البوابة الحالية، ولا ندّعي تشفير بيانات غير موجودة. عند بناء الهوية، تُضاف ضوابط المصادقة والتشفير ضمن خدمة مستقلة."
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
        <div><small>المرحلة التالية</small><h2>BHD Identity وBHD Account</h2></div>
        <ul>
          <li>OIDC Authorization Code Flow مع PKCE</li>
          <li>عميل مستقل ومفاتيح مستقلة لكل تطبيق</li>
          <li>MFA وPasskeys وإدارة الأجهزة والجلسات</li>
          <li>تشفير الأسرار والبيانات الحساسة في التخزين</li>
          <li>سجل تدقيق وتنبيهات ومحاولات دخول محدودة المعدل</li>
        </ul>
      </section>
    </InnerPageShell>
  );
}
