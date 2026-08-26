# حزمة تسليم — هوية BHD · 26 أغسطس 2026

> للمتابعة من جهاز آخر: اسحب `main` من GitHub ثم اعمل من مجلد النشر `BHD-Complete-Brand-and-Portal-v1.1.0`.

## حالة المستودع

| البند | القيمة |
|---|---|
| الفرع | `main` |
| آخر commit في هذه الجولة | `d6f207f` — Cooldown password-reset… |
| Remote | `https://github.com/ainoamn/ONE-BHD.git` |
| النشر | Vercel مشروع `one-bhd` · جذر النشر `BHD-Complete-Brand-and-Portal-v1.1.0` |
| الإنتاج | `https://id.bhd-om.com` (ونطاقات البوابة المرتبطة) |
| النسخ المتزامنة | `v1.1.0` ← المصدر · `v1.1.1` · `BHD-Portal-GitHub-Source-v1.0.0` |

### أوامر البدء على الجهاز الآخر

```bash
git clone https://github.com/ainoamn/ONE-BHD.git
cd ONE-BHD
git pull origin main
cd BHD-Complete-Brand-and-Portal-v1.1.0
npm install
# لا ترفع أسراراً؛ انسخ من Vercel Encrypted إن احتجت محلياً
```

بعد أي تغيير لاحق: وثّق إن لزم → زامن النسخ الثلاث → `git add` + `commit` + `git push origin main` → `npx vercel --prod --yes` من جذر المستودع.

---

## ما أُنجز في هذه المحادثة (مرتّب زمنياً)

### 1) بريد الهوية الاحترافي + لوحة القوالب + حذف المستخدم
**Commit:** `c6ad96c`

- قالب HTML للرسائل (إعادة كلمة المرور + تفعيل البريد) مع شبكة برامج المجموعة.
- جدول `bhd_email_templates` + API `GET/PATCH /api/admin/emails`.
- تبويب الإدارة «قوالب البريد» مع معاينة حية.
- حذف نهائي: `DELETE /api/admin/users?id=` من تفاصيل المستخدم.
- إيقاف click/open tracking على نطاق Resend (`bhd-om.com`) لتسريع الروابط وتقليل التفاف `noreply…/CL0/…`.

**ملاحظة Outlook:** Safe Links قد تبقى؛ التأخير الطويل كان أساساً من تتبّع النقرات.

### 2) ظهور الشعار في الإيميل (بدون خلفية بيضاء)
**Commits:** `97390df` → `e75e27f`

- العملاء (Outlook/Gmail) لا يعرضون SVG؛ صار الرأس صورة PNG واحدة:
  - `public/brand/bhd-email-header.png`
  - خلفية داكنة مثل الموقع + شعار فاتح + نص «هوية BHD الموحّدة».
- الرابط العام: `https://id.bhd-om.com/brand/bhd-email-header.png`
- إن حجب Outlook الصور: يظهر شريط `bgcolor="#0c4a3c"` حتى يفعّل المستخدم «عرض الصور».

### 3) إصلاح أيقونة المستخدم / البرامج (خارج الصفحة + خلف التطبيقات)
**Commit:** `a6f4cfe`

- لوحة المبدّل كانت تُثبَّت بـ `right: 0` فتخرج يساراً في RTL → `inset-inline-end`.
- رفع `z-index` لهيدر البوابة فوق شبكة التطبيقات على الموبايل.
- تضييق شبكة البلاطات ومنع الفيضان على الشاشات الضيقة.

### 4) الإنجليزية لكل عناصر الواجهة المشتركة
**Commit:** `09229ea`

- تمرير `locale` إلى `SessionMenu` / `BhdAppSwitcher` / `SiteFooter`.
- تخزين الاختيار في `localStorage` مفتاح `bhd-ui-locale`.
- قائمة الحساب بالإنجليزية: Account / Admin / Sign out + أسماء التطبيقات.
- الفوتر والروابط والتنقّل في `InnerPageShell` و`/company` يتبعان اللغة.

### 5) حماية إعادة تعيين كلمة المرور + تنسيق رسالة النجاح
**Commit:** `d6f207f`

- بعد الإرسال: إخفاء زر الإرسال 60 ثانية + عدّ تنازلي.
- صندوق نجاح منسّق: راجع الوارد + افحص العشوائي/غير هام + انتظر دقيقة.
- API: حد 1 إرسال/دقيقة لكل معرّف حساب + 3/دقيقة لكل IP.

---

## مسارات مهمة

| الغرض | المسار |
|---|---|
| لوحة الإدارة | `/admin` |
| قوالب البريد | `/admin` → «قوالب البريد» |
| دخول / نسيت كلمة المرور | `/login` |
| تعيين كلمة المرور من الرابط | `/reset-password?token=…` |
| البوابة الرئيسية | `/` |
| دليل الدخول الموحّد | `/docs/unified-login` |
| قوالب البريد (كود) | `app/lib/auth/email-templates.ts` |
| تخزين القوالب | `app/lib/auth/email-template-store.ts` |
| API البريد | `app/api/admin/emails/route.ts` |
| نسيت كلمة المرور API | `app/api/auth/forgot-password/route.ts` |
| مبدّل التطبيقات | `app/components/bhd/BhdAppSwitcher.tsx` |
| لغة الواجهة | `app/lib/ui-locale.ts` |
| رأس الإيميل | `public/brand/bhd-email-header.png` |

---

## بيئة Vercel (لا تُرفع للمستودع)

تأكد أنها موجودة على مشروع الإنتاج (Encrypted):

- `DATABASE_URL` (Neon)
- `AUTH_SECRET` / `IDENTITY_TOKEN_SECRET`
- `RESEND_API_KEY` (مفتاح نظيف بلا BOM)
- `RESEND_FROM_EMAIL` مثل `BHD Identity <noreply@bhd-om.com>`
- `BHD_PLATFORM_ADMIN_EMAILS` (قائمة أدمن المنصة)
- Google / Facebook OAuth إن لزم
- نطاق `bhd-om.com` موثّق في Resend، و**click tracking = off**

---

## اختبار سريع بعد السحب على الجهاز الآخر

1. `git pull` ثم تأكد أن `main` عند `d6f207f` أو أحدث.
2. `/admin` → قوالب البريد → معاينة وحفظ.
3. إرسال إعادة كلمة مرور من `/login` → يظهر صندوق النجاح ويختفي الزر 60ث.
4. افتح الإيميل → رأس داكن بشعار BHD (فعّل عرض الصور في Outlook إن لزم).
5. الرئيسية → EN → قائمة الحساب والفوتر بالإنجليزية.
6. موبايل: أيقونة المستخدم والبرامج داخل الشاشة وفوق شبكة التطبيقات.

---

## متبقٍ / أفكار للمتابعة (لم تُنفَّذ هنا)

- ترجمة **محتوى** الصفحات الداخلية الكاملة (about/privacy/…) — التنقّل والفوتر والمبدّل جاهزة؛ نصوص الصفحات ما زالت عربية في أغلبها عبر `InnerPageShell` props.
- تحسين إضافي لصور الإيميل عبر CID/attachment داخل Resend إن استمر حجب Outlook.
- معالجة فشل نشر Render لـ BHD-R (ظهرت في صندوق الوارد أثناء الاختبار؛ خارج نطاق ONE-BHD).
- حد معدّل موزَّع (Redis) بدل الذاكرة المحلية على Vercel إن احتجت حماية أقوى عبر عدة instances.

---

## وثائق مرتبطة في نفس اليوم

- `docs/notes/2026-08-26-branded-email-templates-admin.md`
- `docs/notes/2026-08-26-admin-client-registry.md`
- `docs/notes/2026-08-26-unified-login-docs-page.md`
- `docs/notes/2026-08-26-identity-admin-console.md`
- `docs/notes/2026-08-26-resend-email-verification.md`
- `docs/notes/2026-08-26-platform-admin-email.md`
- `docs/notes/2026-08-26-wazen-email-unverified-fix.md`
