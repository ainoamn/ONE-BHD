import type { Metadata } from "next";
import { BrandLogo } from "../../components/BrandLogo";
import { InstantLink } from "../../components/InstantLink";
import { SessionMenu } from "../../components/auth/SessionMenu";
import { SiteFooter } from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "دليل ربط البرامج ببوابة الدخول الموحّدة",
  description:
    "كيف تربط منتجاً جديداً بهوية BHD، وتنزّل مواصفات SSO والمشغّل، وتظهر الأيقونات في الهيدر والفوتر.",
  robots: { index: true, follow: true },
};

const DOWNLOADS = [
  {
    file: "BHD-PRODUCT-SSO-ADMIN.md",
    title: "دليل SSO وأدمن المنتج",
    note: "انسخه إلى docs/ في مستودع المنتج ونفّذه حرفياً.",
  },
  {
    file: "BHD-APP-SWITCHER.md",
    title: "مواصفة مشغّل التطبيقات",
    note: "الهيدر (تسع نقاط) + الكتالوج المجمد + قواعد الانتقال.",
  },
  {
    file: "BHD-IDENTITY-SSO.md",
    title: "مواصفة هوية OIDC",
    note: "client_id، authorize، token، userinfo، end-session.",
  },
  {
    file: "BHD-UNIFIED-LOGIN-AND-APPS.md",
    title: "الدليل التشغيلي الموحّد",
    note: "الخريطة الكاملة للدخول والترابط بين المواقع.",
  },
  {
    file: "BHD-WAZEN-INTEGRATION.md",
    title: "مثال تكامل وازن",
    note: "مرجع عملي لمسار start/callback في منتج حي.",
  },
] as const;

export default function UnifiedLoginDocsPage() {
  return (
    <main className="docs-guide-screen" dir="rtl" id="main-content">
      <div className="flag-line" aria-hidden="true" />
      <header className="docs-guide-topbar">
        <InstantLink href="/" className="brand" aria-label="الرئيسية">
          <BrandLogo className="header-official-logo" />
        </InstantLink>
        <nav className="docs-guide-nav" aria-label="تنقل التوثيق">
          <InstantLink href="/admin">لوحة الإدارة</InstantLink>
          <InstantLink href="/apps">البرامج</InstantLink>
          <InstantLink href="/account">الحساب</InstantLink>
        </nav>
        <SessionMenu signInLabel="دخول" />
      </header>

      <article className="docs-guide-main section-wrap">
        <p className="section-kicker">BHD Identity · Integration Pack</p>
        <h1>دليل ربط البرامج ببوابة الدخول الموحّدة</h1>
        <p className="docs-guide-lead">
          للهوية مصدر واحد: <code>https://id.bhd-om.com</code>. لربط موقع جديد لاحقاً: نزّل الملفات أدناه، انقلها إلى
          مستودع ذلك الموقع، نفّذ المسارات، ثم أبلغ ONE-BHD لإضافة العميل في الكتالوج وقلب{" "}
          <code>mode</code> إلى <code>sso</code>.
        </p>

        <section className="docs-guide-panel" id="downloads">
          <h2>1) نزّل الملفات إلى الموقع الآخر</h2>
          <p>
            لا تعدّل القيم المجمّدة داخل الملفات. انسخها كما هي إلى <code>docs/</code> في مستودع المنتج (وملفات
            المكوّنات المذكورة داخل المواصفات).
          </p>
          <ul className="docs-download-list">
            {DOWNLOADS.map((item) => (
              <li key={item.file}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.note}</span>
                  <code>{item.file}</code>
                </div>
                <a className="docs-download-btn" href={`/docs/${item.file}`} download={item.file}>
                  تنزيل
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="docs-guide-panel" id="connect">
          <h2>2) خطوات ربط منتج جديد (مستقبلاً)</h2>
          <ol className="docs-steps">
            <li>
              سجّل <code>client_id</code> و<code>redirect_uri</code> في هوية BHD (جدول العملاء في{" "}
              <code>BHD-IDENTITY-SSO.md</code>).
            </li>
            <li>
              نفّذ على المنتج: <code>/api/auth/bhd/start</code> → <code>callback</code> → <code>logout</code> و{" "}
              <code>admin-entry</code> حسب <code>BHD-PRODUCT-SSO-ADMIN.md</code>.
            </li>
            <li>
              اربط المستخدم المحلي بـ <code>bhd_sub = sub</code> من <code>id_token</code>. صلاحية الأدمن تبقى داخل قاعدة
              المنتج فقط.
            </li>
            <li>
              انسخ الكتالوج المجمد <code>lib/bhd/apps.ts</code> و<code>BhdAppSwitcher</code> و<code>BhdAppIcon</code> من
              مواصفة المشغّل.
            </li>
            <li>
              بعد اختبار حي أن <code>start</code> يحوّل إلى <code>id.bhd-om.com</code>: أبلغ ONE-BHD لقلب العنصر من{" "}
              <code>browse</code> إلى <code>sso</code>.
            </li>
          </ol>
        </section>

        <section className="docs-guide-panel" id="icons">
          <h2>3) الأيقونات في الهيدر والفوتر</h2>
          <div className="docs-two-col">
            <div>
              <h3>الهيدر (بعد الدخول)</h3>
              <ul>
                <li>
                  مكوّن <code>BhdAppSwitcher</code>: أيقونة تسع نقاط بجانب صورة الحساب (يسار الصورة في RTL).
                </li>
                <li>يظهر فقط مع جلسة صالحة — بلا جلسة لا شبكة تطبيقات.</li>
                <li>
                  المصدر: كتالوج مجمد <code>BHD_APPS</code> — لا تجلب قائمة من شبكة خارجية في v1.
                </li>
                <li>
                  النقر على تطبيق <code>mode=sso</code> →{" "}
                  <code>{`{origin}/api/auth/bhd/start?returnTo={workspacePath}`}</code> ثم انتقال كامل للمتصفح.
                </li>
              </ul>
            </div>
            <div>
              <h3>الفوتر / البوابة العامة</h3>
              <ul>
                <li>
                  شبكة «برامجنا» عبر <code>SiteFooter</code> + <code>BhdAppIcon</code> من قائمة المنتجات العامة.
                </li>
                <li>تسويقية للزائر؛ ليست بديلاً عن مشغّل الحساب بعد الدخول.</li>
                <li>
                  على بوابة التطبيقات الرئيسية يمكن إخفاء صف الفوتر المكرر بـ <code>hidePrograms</code>.
                </li>
                <li>
                  الأيقونات الرسمية من <code>BhdAppIcon</code> بنفس <code>id</code> في الكتالوج — لا تخترع أيقونات محلية.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="docs-guide-panel" id="auth-flow">
          <h2>4) اعتماد الدخول والترابط بين المواقع</h2>
          <ol className="docs-steps">
            <li>
              المستخدم يدخل مرة على <code>id.bhd-om.com</code> → كوكي هوية Host-only (<code>bhd_id</code>).
            </li>
            <li>
              منتج يطلب SSO عبر <code>/api/auth/bhd/start</code> → OIDC authorize على الهوية.
            </li>
            <li>
              إن كانت جلسة الهوية قائمة: يصدر <code>code</code> بلا إعادة كلمة مرور → المنتج يفتح جلسته المحلية ويربط{" "}
              <code>bhd_sub</code>.
            </li>
            <li>
              الانتقال بين المواقع من المشغّل يعيد نفس المسار على المنتج الهدف — لا iframe ولا مشاركة كوكي عبر النطاق.
            </li>
            <li>
              الخروج الموحّد: منتج يمسح جلسته ثم <code>/oauth/end-session</code> على الهوية؛ المواقع الأخرى تطلب دخولاً من
              جديد عبر الهوية عند الزيارة التالية.
            </li>
          </ol>
          <p className="docs-callout">
            أدمن المنصة على <InstantLink href="/admin">/admin</InstantLink> عبر{" "}
            <code>BHD_PLATFORM_ADMIN_EMAILS</code> فقط. أدمن وازن/حسابي/نَسَب يُعيَّن في قاعدة كل منتج على نفس{" "}
            <code>bhd_sub</code> — ليس من هذه اللوحة.
          </p>
        </section>

        <section className="docs-guide-panel" id="navigation">
          <h2>5) التنقّل إلى المواقع</h2>
          <table className="docs-table">
            <thead>
              <tr>
                <th>من أين</th>
                <th>السلوك</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>مشغّل الهيدر (بعد الدخول)</td>
                <td>
                  <code>sso</code> → start بمساحة عمل العميل · <code>browse</code> → أصل الموقع فقط
                </td>
              </tr>
              <tr>
                <td>بوابة bhd-om.com /apps</td>
                <td>شبكة البرامج مع روابط workspace/SSO حسب الكتالوج</td>
              </tr>
              <tr>
                <td>الفوتر «برامجنا»</td>
                <td>روابط عامة للمنتجات؛ للزائر والمستخدم معاً</td>
              </tr>
              <tr>
                <td>لوحة /admin هنا</td>
                <td>إدارة هوية فقط + رابط هذا الدليل</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p className="docs-guide-foot">
          المصدر المعتمد في GitHub:{" "}
          <a href="https://github.com/ainoamn/ONE-BHD/tree/main/docs" rel="noreferrer" target="_blank">
            ainoamn/ONE-BHD/docs
          </a>
          . حدّث الملفات هناك أولاً ثم انسخها للمنتجات.
        </p>
      </article>

      <SiteFooter hidePrograms />
    </main>
  );
}
