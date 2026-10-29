import type { Metadata } from "next";
import { BrandLogo } from "../../components/BrandLogo";
import { InstantLink } from "../../components/InstantLink";
import { SessionMenu } from "../../components/auth/SessionMenu";
import { SiteFooter } from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "دليل ربط البرامج ببوابة الدخول الموحّدة",
  description:
    "دليل مبتدئ مفصّل: تنزيل المواصفات، تنفيذ SSO، الأيقونات، ثم تسجيل المنتج يدوياً من لوحة الإدارة أو API.",
  robots: { index: true, follow: true },
};

const DOWNLOADS = [
  {
    file: "BHD-COPY-TO-PRODUCTS.md",
    title: "وثيقة النسخ الكاملة (29 أكتوبر 2026)",
    note: "ارفعها أولاً: نوافذ متعددة، 40 يوماً ثم دخول، حماية، الكتالوج لا يُدفع تلقائياً.",
  },
  {
    file: "BHD-SESSION-POLICY.md",
    title: "سياسة الجلسة",
    note: "40 يوماً ثم تسجيل الدخول من جديد. حساب مستقل لكل نافذة.",
  },
  {
    file: "BHD-SECURITY-PROTECTION.md",
    title: "الحماية من الاحتيال",
    note: "سجل IP والدولة، حظر العنوان، قفل الحساب، استعادة /recover.",
  },
  {
    file: "BHD-PRODUCT-SSO-ADMIN.md",
    title: "دليل SSO وأدمن المنتج",
    note: "الخطوة العملية الأولى داخل مستودع المنتج: start / callback / logout / admin-entry.",
  },
  {
    file: "BHD-APP-SWITCHER.md",
    title: "مواصفة مشغّل التطبيقات",
    note: "أيقونة التسع نقاط، الكتالوج المجمد، الموارد البشرية، قواعد النقر.",
  },
  {
    file: "BHD-ACCOUNT-SWITCHER.md",
    title: "بطاقة الحساب",
    note: "صورة دائرية + البريد مثل جوجل. يُنسخ مع المشغّل.",
  },
  {
    file: "BHD-IDENTITY-SSO.md",
    title: "مواصفة هوية OIDC",
    note: "كيف تعمل الهوية تقنياً: authorize، token، userinfo، end-session.",
  },
  {
    file: "BHD-UNIFIED-LOGIN-AND-APPS.md",
    title: "الدليل التشغيلي الموحّد",
    note: "الخريطة الكاملة للمنظومة والسياسات بين المواقع.",
  },
  {
    file: "BHD-IDENTITY-RUNTIME.md",
    title: "API الحي وسكربت الهوية",
    note: "البرمجة على id.bhd-om.com — المواقع تقرأ الجلسة والنوافذ والكتالوج مباشرة.",
  },
  {
    file: "BHD-WAZEN-INTEGRATION.md",
    title: "مثال تكامل وازن",
    note: "مرجع حي لمسار مكتمل يمكنك مقارنته أثناء التنفيذ.",
  },
] as const;

const TOC = [
  ["#what", "ما هذه المنظومة؟"],
  ["#two-phases", "مرحلتان: تنفيذ المنتج ثم التسجيل"],
  ["#runtime", "الربط الحي من الهوية (API و /admin)"],
  ["#session", "الجلسة 40 يوماً والنوافذ المتعددة"],
  ["#security", "الحماية والتدقيق"],
  ["#downloads", "تنزيل الملفات"],
  ["#product-steps", "خطوات التنفيذ على الموقع الجديد"],
  ["#admin-api", "التسجيل اليدوي من الإدارة / API"],
  ["#icons", "الأيقونات — لا تحديث تلقائي"],
  ["#auth-flow", "كيف يعمل الدخول بين المواقع"],
  ["#navigation", "التنقّل"],
  ["#checklist", "قائمة تحقق"],
  ["#glossary", "قاموس سريع"],
  ["#errors", "أخطاء شائعة"],
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
        <p className="section-kicker">BHD Identity · محدّث 29 أكتوبر 2026 · للمبتدئ والمنفّذ</p>
        <h1>دليل ربط البرامج ببوابة الدخول الموحّدة</h1>
        <p className="docs-guide-lead">
          الهدف بسيط: المستخدم يدخل مرة واحدة على <code>https://id.bhd-om.com</code>، ثم ينتقل بين وازن وحسابي
          ونَسَب وBHD R والموارد البشرية وبقية البرامج بلا إعادة كتابة كلمة المرور. يمكن فتح أكثر من حساب في نوافذ
          مختلفة من نفس المتصفح. الجلسة تنتهي بعد 40 يوماً فيُطلب الدخول من جديد. هذا الدليل يشرح الربط خطوة بخطوة،
          والحماية في <InstantLink href="/admin">/admin</InstantLink>، وكيف تسجّل المنتج بعد اكتمال التنفيذ.
        </p>

        <nav className="docs-toc" aria-label="فهرس الدليل">
          <p>الفهرس</p>
          <ol>
            {TOC.map(([href, label]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <section className="docs-guide-panel" id="what">
          <h2>1) ما هذه المنظومة؟ (بلغة مبسّطة)</h2>
          <p>تخيّل ثلاثة أدوار:</p>
          <ul>
            <li>
              <strong>الهوية</strong> (<code>id.bhd-om.com</code>): تعرف من هو الشخص (البريد، كلمة المرور، جوجل،
              فيسبوك). تصدر بطاقة دخول مؤقتة (OIDC).
            </li>
            <li>
              <strong>المنتج</strong> (مثل وازن): تطبيق مستقل بقاعدة بياناته. بعد نجاح الدخول يفتح جلسة محلية ويربط
              المستخدم عبر <code>bhd_sub</code> = رقم المستخدم في الهوية.
            </li>
            <li>
              <strong>المشغّل</strong> (أيقونة التسع نقاط): قائمة سريعة للتنقّل بين البرامج بعد أن تكون داخل أحدها.
            </li>
          </ul>
          <p className="docs-callout">
            مهم: أدمن وازن ≠ أدمن الهوية. لوحة{" "}
            <InstantLink href="/admin">/admin</InstantLink> هنا تدير حسابات الهوية فقط. صلاحية الإدارة داخل كل منتج
            تُعيَّن في قاعدة ذلك المنتج.
          </p>
        </section>

        <section className="docs-guide-panel" id="two-phases">
          <h2>2) مرحلتان — لا تخلط بينهما</h2>
          <div className="docs-two-col">
            <div>
              <h3>المرحلة أ — تنفيذ داخل مستودع المنتج</h3>
              <p>
                تنزّل الملفات، تضيف المسارات <code>/api/auth/bhd/start</code> و<code>callback</code> و
                <code>logout</code>، تربط المستخدم بـ <code>bhd_sub</code>، وتنسخ مكوّنات المشغّل.
              </p>
              <p>هذه المرحلة تحتاج مطوّراً في كود الموقع الجديد. لا يمكن تخطّيها بضغط زر.</p>
            </div>
            <div>
              <h3>المرحلة ب — التسجيل على الهوية</h3>
              <p>
                بعد أن يعمل المسار حياً، لم تعد بحاجة لطلب تعديل يدوي في كود ONE-BHD لكل عميل جديد: سجّل{" "}
                <code>client_id</code> و<code>redirect_uri</code> من{" "}
                <InstantLink href="/admin">لوحة الإدارة → العملاء OAuth</InstantLink> أو عبر API، ثم فعّل{" "}
                <code>sso</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="docs-guide-panel" id="runtime">
          <h2>الربط الحي — البرمجة هنا، المواقع تقرأ عبر API</h2>
          <p>
            لا تعيد كتابة مدة الدخول أو عزل النوافذ أو قائمة التطبيقات داخل وازن أو حسابي. ذلك ما جعل كل موقع «يبرمج على
            مزاجه». المصدر الحي:
          </p>
          <ul>
            <li>
              <code>GET https://id.bhd-om.com/api/bhd/runtime</code> — 40 يوماً، ترويسات النافذة، الكتالوج مع الصفحة
              الرئيسية ومساحة العمل
            </li>
            <li>
              <code>https://id.bhd-om.com/bhd-identity.js</code> — <code>me</code> / تبديل / خروج لكل نافذة
            </li>
            <li>
              OIDC <code>start</code> على المنتج فقط (السر على الخادم) حتى يتعرّف الموقع على الحساب بعد دخول الهوية
            </li>
          </ul>
          <pre className="docs-code">{`<script src="https://id.bhd-om.com/bhd-identity.js" defer></script>
<script>
  const runtime = await BhdIdentity.runtime();
  cookie.maxAge = runtime.session.maxAgeSec;
  const { body } = await BhdIdentity.me();
</script>`}</pre>
          <p>
            التحكم بالشعار والمسمّى والرابط:{" "}
            <InstantLink href="/admin#apps">/admin → شاشة الأيقونات</InstantLink>
            . التفاصيل التشغيلية:{" "}
            <InstantLink href="/admin#connect">/admin → ربط المواقع</InstantLink>
            . الدليل:{" "}
            <a href="/docs/BHD-IDENTITY-RUNTIME.md" download="BHD-IDENTITY-RUNTIME.md">
              BHD-IDENTITY-RUNTIME.md
            </a>
            .
          </p>
        </section>

        <section className="docs-guide-panel" id="session">
          <h2>3) الجلسة: 40 يوماً ثم دخول جديد، ونوافذ بحسابات مختلفة</h2>
          <p>
            للحماية: بعد <strong>40 يوماً</strong> من إصدار الجلسة ينتهي JWT وكوكي <code>bhd_id</code> ويُطلب تسجيل
            الدخول من جديد. لا مهلة خمول قبل ذلك. «خروج» يمسح الجلسة فوراً.
          </p>
          <p>
            كوكي المتصفح واحدة لكل ملف Chrome، لذلك عزل النوافذ يتم بـ JWT في <code>sessionStorage</code> (
            <code>bhd_window_token</code>) وترويسة <code>Authorization: Bearer</code> عبر <code>identityFetch</code>.
            تبديل الحساب في نافذة لا يغيّر النافذة الأخرى. المنتج يحمّل{" "}
            <code>bhd-identity.js</code> ولا ينسخ منطق النوافذ.
          </p>
          <p className="docs-callout">
            التفاصيل:{" "}
            <a href="/docs/BHD-SESSION-POLICY.md" download="BHD-SESSION-POLICY.md">
              BHD-SESSION-POLICY.md
            </a>{" "}
            و{" "}
            <a href="/docs/BHD-COPY-TO-PRODUCTS.md" download="BHD-COPY-TO-PRODUCTS.md">
              BHD-COPY-TO-PRODUCTS.md
            </a>
            . ممنوع تجديد الكوكي في <code>GET /api/auth/me</code>.
          </p>
        </section>

        <section className="docs-guide-panel" id="security">
          <h2>4) الحماية والتدقيق على الهوية</h2>
          <p>
            في <InstantLink href="/admin">لوحة الإدارة</InstantLink> تبويب <strong>الحماية والتدقيق</strong>: سجل الدخول
            (الوقت، البريد، عنوان IP، الدولة)، بحث، حظر العناوين، الحسابات الموقوفة، وفحص الإعدادات مع ملخص تهديدات
            (ذكاء اصطناعي إن وُجد المفتاح).
          </p>
          <ul>
            <li>5 محاولات فاشلة على الحساب → قفل 15 دقيقة.</li>
            <li>12 فشلاً من نفس العنوان خلال 15 دقيقة → حظر IP ساعة.</li>
            <li>
              8 فشل على نفس الحساب → قفل أمني حتى يثبت المالك بياناته في{" "}
              <InstantLink href="/recover">/recover</InstantLink> (مدني، انتهاء، ميلاد، بريد، واتساب، آخر دخول، وصف
              النشاط، ثم رموز البريد وواتساب). واتساب جاهز في الكود ويُفعَّل لاحقاً بـ <code>WHATSAPP_TOKEN</code>.
            </li>
          </ul>
          <p>
            المنتج لا يعيد بناء هذا المنطق. أحلِ المستخدم الموقوف إلى{" "}
            <code>https://id.bhd-om.com/recover</code>. الدليل:{" "}
            <a href="/docs/BHD-SECURITY-PROTECTION.md" download="BHD-SECURITY-PROTECTION.md">
              BHD-SECURITY-PROTECTION.md
            </a>
            .
          </p>
        </section>

        <section className="docs-guide-panel" id="downloads">
          <h2>5) نزّل الملفات إلى الموقع الآخر</h2>
          <p>
            ضع الملفات في مجلد <code>docs/</code> داخل مستودع المنتج. لا تغيّر القيم المجمّدة (معرّفات التطبيقات
            وروابطها) إلا عبر تحديث المصدر في ONE-BHD ثم إعادة النسخ.
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

        <section className="docs-guide-panel" id="product-steps">
          <h2>6) خطوات التنفيذ على الموقع الجديد (المرحلة أ)</h2>
          <ol className="docs-steps">
            <li>
              <strong>افتح الدليل</strong> <code>BHD-PRODUCT-SSO-ADMIN.md</code> واتبع قائمة التحقق حرفياً.
            </li>
            <li>
              <strong>أضف المسارات على المنتج:</strong>
              <ul>
                <li>
                  <code>GET /api/auth/bhd/start</code> → يحوّل إلى{" "}
                  <code>https://id.bhd-om.com/oauth/authorize</code>
                </li>
                <li>
                  <code>GET /api/auth/bhd/callback</code> → يستبدل الكود بتوكن على الخادم، ثم يحفظ جلسة المنتج
                </li>
                <li>
                  <code>GET /api/auth/bhd/logout</code> → يمسح جلسة المنتج ثم يستدعي{" "}
                  <code>/oauth/end-session</code>
                </li>
                <li>
                  انسخ <code>admin-entry</code> من بوابة الهوية لاستخدامه مع لوحات <code>/admin</code> داخل المنتج
                </li>
              </ul>
            </li>
            <li>
              <strong>اربط المستخدم:</strong> بعد التحقق من <code>id_token</code> اكتب{" "}
              <code>bhd_sub = sub</code>. إن وُجد صف قديم بنفس البريد بلا <code>bhd_sub</code> اربطه ولا تنشئ أدمن
              تلقائياً.
            </li>
            <li>
              <strong>اختبر:</strong> افتح <code>https://منتجك/api/auth/bhd/start</code> يجب أن ترى تحويلاً إلى{" "}
              <code>id.bhd-om.com</code>. بعد الدخول تعود إلى مساحة العمل (مثل <code>/dashboard</code>) وليس صفحة
              تسويق فقط.
            </li>
            <li>
              <strong>انسخ المشغّل:</strong> من <code>BHD-APP-SWITCHER.md</code> انسخ{" "}
              <code>BhdAppSwitcher</code> و<code>BhdAppIcon</code> والكتالوج <code>apps.ts</code>.
            </li>
          </ol>
        </section>

        <section className="docs-guide-panel" id="admin-api">
          <h2>7) بعد التنفيذ — تسجيل يدوي من الإدارة أو API (المرحلة ب)</h2>
          <p>
            نعم: بعد أن يصبح مسار المنتج جاهزاً يمكنك ربطه بنفسك دون انتظار تعديل كود الهوية لكل عميل جديد.
          </p>
          <h3>من الواجهة</h3>
          <ol className="docs-steps">
            <li>
              ادخل <InstantLink href="/admin">لوحة تشغيل الهوية</InstantLink> بحساب أدمن المنصة.
            </li>
            <li>
              تبويب <strong>العملاء OAuth</strong> → املأ <code>client_id</code> (مثال <code>bhd-myapp</code>) واسم
              المنتج والأصل و<code>workspacePath</code>.
            </li>
            <li>
              احفظ <code>client_secret</code> الذي يظهر مرة واحدة وضعه في إعدادات المنتج.
            </li>
            <li>
              بعد اختبار حي ناجح اضغط <strong>تفعيل SSO</strong> (من <code>browse</code> إلى <code>sso</code>).
            </li>
          </ol>
          <h3>من API (جلسة أدمن منصة)</h3>
          <pre className="docs-code">{`# قائمة العملاء (ثابت + مسجّل)
GET https://id.bhd-om.com/api/admin/clients

# تسجيل عميل جديد
POST https://id.bhd-om.com/api/admin/clients
Content-Type: application/json
Cookie: جلسة أدمن المنصة

{
  "clientId": "bhd-myapp",
  "name": "تطبيقي",
  "origin": "https://myapp.bhd-om.com",
  "workspacePath": "/dashboard",
  "redirectUri": "https://myapp.bhd-om.com/api/auth/bhd/callback",
  "mode": "browse"
}

# تفعيل SSO بعد الاختبار
PATCH https://id.bhd-om.com/api/admin/clients
{ "clientId": "bhd-myapp", "mode": "sso" }`}</pre>
          <p className="docs-callout">
            تسجيل العميل يفعّل قبول OAuth فوراً. أيقونات المشغّل في وازن/حسابي/… <strong>لا تتحدث وحدها</strong>. انسخ{" "}
            <code>apps.ts</code> من ONE-BHD أو اسحب{" "}
            <a href="https://id.bhd-om.com/api/bhd/catalog">https://id.bhd-om.com/api/bhd/catalog</a> (
            <code>autoPush: false</code>).
          </p>
        </section>

        <section className="docs-guide-panel" id="icons">
          <h2>8) الأيقونات في الهيدر والفوتر — ليست تلقائية على كل المواقع</h2>
          <div className="docs-two-col">
            <div>
              <h3>الهيدر — بعد تسجيل الدخول</h3>
              <ul>
                <li>
                  تظهر أيقونة <strong>تسع نقاط</strong> بجانب صورة الحساب (يسارها في الواجهة العربية).
                </li>
                <li>بدون جلسة صالحة: لا مشغّل. هذا متعمّد.</li>
                <li>
                  النقر يفتح <code>workspacePath</code> مباشرة إن وُجدت جلسة المنتج. <code>start</code> فقط إن لم توجد
                  جلسة. انتقال كامل للمتصفح (ليس iframe).
                </li>
                <li>
                  المصدر: <code>BhdAppSwitcher</code> + كتالوج <code>BHD_APPS</code>.
                </li>
              </ul>
            </div>
            <div>
              <h3>الفوتر — للزائر والعامة</h3>
              <ul>
                <li>
                  شبكة «برامجنا» عبر <code>SiteFooter</code> و<code>BhdAppIcon</code>.
                </li>
                <li>عرض تسويقي/اكتشاف؛ ليست بديلاً عن مشغّل الحساب.</li>
                <li>
                  يمكن إخفاؤها عند الحاجة بـ <code>hidePrograms</code> حتى لا تتكرر مع بوابة التطبيقات.
                </li>
                <li>استخدم نفس معرّف الأيقونة الرسمي — لا ترسم أيقونات مختلفة لكل موقع.</li>
                <li>
                  تغيير أيقونة أو رابط على البوابة أو الهوية <strong>لا يُحدَّث</strong> وازن وحسابي وبقية المواقع حتى
                  تُنسخ الملفات أو يُسحب الكتالوج.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="docs-guide-panel" id="auth-flow">
          <h2>9) كيف يعمل الدخول والترابط (تسلسل)</h2>
          <ol className="docs-steps">
            <li>
              المستخدم يسجّل دخوله على الهوية → تُحفظ جلسة Host-only على <code>id.bhd-om.com</code> لمدة 40 يوماً، ونسخة
              JWT لهذه النافذة في <code>sessionStorage</code>.
            </li>
            <li>يفتح منتجاً أو يضغط تطبيقاً من المشغّل → المنتج يستدعي <code>/api/auth/bhd/start</code>.</li>
            <li>
              الهوية ترى جلسة قائمة فتصدر <code>code</code> بسرعة دون طلب كلمة المرور من جديد.
            </li>
            <li>
              المنتج يستبدل الكود بتوكن على الخادم، يحدّث/ينشئ المستخدم بـ <code>bhd_sub</code>، ويفتح جلسته المحلية.
            </li>
            <li>
              الخروج: المنتج يمسح جلسته ويستدعي <code>/oauth/end-session</code> على الهوية. المواقع الأخرى ستطلب دخولاً
              عبر الهوية في الزيارة التالية.
            </li>
          </ol>
        </section>

        <section className="docs-guide-panel" id="navigation">
          <h2>10) أين يحدث التنقّل؟</h2>
          <table className="docs-table">
            <thead>
              <tr>
                <th>المكان</th>
                <th>لمن</th>
                <th>ماذا يفعل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>مشغّل الهيدر</td>
                <td>مستخدم داخل منتج</td>
                <td>
                  من www: الصفحة الرئيسية · من الهوية: مساحة العمل
                </td>
              </tr>
              <tr>
                <td>بوابة / و /apps</td>
                <td>الجميع</td>
                <td>شبكة البرامج الرسمية</td>
              </tr>
              <tr>
                <td>الفوتر «برامجنا»</td>
                <td>زائر أو مستخدم</td>
                <td>روابط عامة للمنتجات</td>
              </tr>
              <tr>
                <td>/admin على الهوية</td>
                <td>أدمن المنصة</td>
                <td>مستخدمون + حماية + ربط المواقع (#connect) + عملاء OAuth + هذا الدليل</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="docs-guide-panel" id="checklist">
          <h2>11) قائمة تحقق سريعة قبل الإطلاق</h2>
          <ul className="docs-check">
            <li>□ start يحوّل إلى id.bhd-om.com وليس أصل المنتج</li>
            <li>□ callback يتحقق من id_token على الخادم فقط</li>
            <li>□ المستخدم يُحفظ بـ bhd_sub</li>
            <li>□ returnTo يفتح لوحة العميل وليس التسويق فقط</li>
            <li>□ من www.bhd-om.com البلاط يفتح الصفحة الرئيسية (homePath) لا لوحة التحكم</li>
            <li>□ السكربت من id.bhd-om.com و<code>BhdIdentity.me()</code> لكل نافذة</li>
            <li>□ كوكي المنتج من runtime.session.maxAgeSec (40 يوماً)</li>
            <li>□ العميل مسجّل في /admin أو ضمن القائمة الثابتة</li>
            <li>□ بعد الاختبار الحي: mode = sso</li>
            <li>□ المشغّل يظهر بعد الدخول فقط، والكتالوج منسوخ أو يُسحب من /api/bhd/catalog</li>
            <li>□ الخروج يمرّ بـ end-session · الحساب الموقوف يذهب إلى /recover</li>
          </ul>
        </section>

        <section className="docs-guide-panel" id="glossary">
          <h2>12) قاموس سريع</h2>
          <dl className="docs-glossary">
            <div>
              <dt>issuer</dt>
              <dd>عنوان الهوية الرسمي: https://id.bhd-om.com</dd>
            </div>
            <div>
              <dt>client_id</dt>
              <dd>معرّف المنتج عند الهوية، مثل bhd-wazen</dd>
            </div>
            <div>
              <dt>redirect_uri</dt>
              <dd>رابط العودة بعد الموافقة، عادة …/api/auth/bhd/callback</dd>
            </div>
            <div>
              <dt>bhd_sub</dt>
              <dd>معرّف المستخدم من الهوية داخل جدول المنتج</dd>
            </div>
            <div>
              <dt>mode=sso / browse</dt>
              <dd>sso = المسار جاهز للتنقّل الصامت · browse = الموقع لم يكتمل بعد</dd>
            </div>
            <div>
              <dt>workspacePath</dt>
              <dd>المسار داخل المنتج بعد الدخول (لوحة العميل)</dd>
            </div>
            <div>
              <dt>bhd_window_token</dt>
              <dd>JWT هذه النافذة في sessionStorage حتى لا يسرق تبديل الحساب النافذة الأخرى</dd>
            </div>
            <div>
              <dt>/api/bhd/catalog</dt>
              <dd>كتالوج التطبيقات للقراءة. لا يُدفع تلقائياً إلى المواقع الأخرى</dd>
            </div>
          </dl>
        </section>

        <section className="docs-guide-panel" id="errors">
          <h2>13) أخطاء شائعة</h2>
          <table className="docs-table">
            <thead>
              <tr>
                <th>العَرَض</th>
                <th>السبب الأرجح</th>
                <th>العلاج</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>unauthorized_client</td>
                <td>client_id غير مسجّل أو redirect غير مسموح</td>
                <td>سجّل العميل من /admin أو صحّح redirect_uri</td>
              </tr>
              <tr>
                <td>يطلب كلمة المرور في كل موقع</td>
                <td>لا جلسة هوية أو start لا يصل للهوية</td>
                <td>تحقق أن start يحوّل إلى id.bhd-om.com</td>
              </tr>
              <tr>
                <td>BHD_EMAIL_UNVERIFIED</td>
                <td>المنتج يرفض بريداً غير موثّق</td>
                <td>أكّد البريد من الحساب أو وثّقه من /admin</td>
              </tr>
              <tr>
                <td>لا أيقونات في الهيدر</td>
                <td>لا جلسة أو لم يُركب المشغّل</td>
                <td>ادخل أولاً ثم تأكد من BhdAppSwitcher</td>
              </tr>
              <tr>
                <td>أدمن المنتج مرفوض</td>
                <td>الدور غير مربوط بـ bhd_sub محلياً</td>
                <td>اربط الصف المحلي في callback — ليس من هوية المنصة</td>
              </tr>
              <tr>
                <td>النافذة القديمة تعرض الحساب الجديد</td>
                <td>المنتج يقرأ الكوكي المشتركة بلا Bearer</td>
                <td>حمّل bhd-identity.js واتبع /admin#connect</td>
              </tr>
              <tr>
                <td>لم يُطلب الدخول بعد 40 يوماً</td>
                <td>JWT أو كوكي المنتج أطول من ثابت الهوية</td>
                <td>maxAge من /api/bhd/runtime لا من ثابت محلي</td>
              </tr>
              <tr>
                <td>الأيقونة تغيّرت على الهوية فقط</td>
                <td>الكتالوج مجمد في كل مستودع</td>
                <td>اقرأ /api/bhd/catalog أو /admin#connect</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p className="docs-guide-foot">
          المصدر في GitHub:{" "}
          <a href="https://github.com/ainoamn/ONE-BHD/tree/main/docs" rel="noreferrer" target="_blank">
            ainoamn/ONE-BHD/docs
          </a>
          . ابدأ بنسخ{" "}
          <a href="/docs/BHD-COPY-TO-PRODUCTS.md" download="BHD-COPY-TO-PRODUCTS.md">
            BHD-COPY-TO-PRODUCTS.md
          </a>
          . للتسجيل اليدوي: <InstantLink href="/admin">/admin → العملاء OAuth</InstantLink>. للحماية:{" "}
          <InstantLink href="/admin">/admin → الحماية والتدقيق</InstantLink>.
        </p>
      </article>

      <SiteFooter hidePrograms />
    </main>
  );
}
