# ONE-BHD — بوابة Bin Hamood Development

المستودع الرسمي لبوابة **BHD** وهويتها البصرية ومنظومة منتجاتها.

- **العلامة:** Bin Hamood Development
- **الوعد:** Build Higher Dreams — ابنِ أحلامًا أكبر
- **الموقع الحي:** [https://one-bhd.vercel.app](https://one-bhd.vercel.app) — النطاق الرسمي [https://www.bhd-om.com](https://www.bhd-om.com)
- **اكتشاف الهوية:** [https://one-bhd.vercel.app/.well-known/openid-configuration](https://one-bhd.vercel.app/.well-known/openid-configuration)
- **GitHub:** [https://github.com/ainoamn/ONE-BHD](https://github.com/ainoamn/ONE-BHD)
- **Vercel:** [https://vercel.com/bhdom89-8158s-projects/one-bhd](https://vercel.com/bhdom89-8158s-projects/one-bhd)

## التوثيق

| الوثيقة | المحتوى |
|---|---|
| [`docs/CONTINUE-FROM-OTHER-PC.md`](docs/CONTINUE-FROM-OTHER-PC.md) | **استكمال من جهاز آخر** — ملخص الجلسة الأخيرة وأوامر `git pull` |
| [`docs/BHD-IDENTITY-SSO.md`](docs/BHD-IDENTITY-SSO.md) | **هوية BHD الموحّدة** — مواصفة OIDC للتنفيذ كما هي في كل المواقع |
| [`docs/BHD-NEON-DATABASE.md`](docs/BHD-NEON-DATABASE.md) | ربط Neon: الجداول، المتغيرات، و`drizzle-kit push` |
| [`docs/BHD-REPOSITORY-DOCUMENTATION.md`](docs/BHD-REPOSITORY-DOCUMENTATION.md) | بنية المستودع، الإصدارات، التشغيل، النشر، والتحقق |
| [`BHD-Portal-Documentation-Arabic.md`](BHD-Portal-Documentation-Arabic.md) | المرجع الهندسي العربي للبوابة |
| [`BHD-BRAND-IDENTITY-Arabic.md`](BHD-BRAND-IDENTITY-Arabic.md) | دليل الهوية البصرية |

## الإصدار المعتمد للتشغيل والنشر

دائماً يُدمَج **آخر إصدار** داخل الإصدارات السابقة ثم يُنشر منه.

| الإصدار | المجلد | الدور |
|---|---|---|
| **v1.1.1 (الأحدث)** | `BHD-Complete-Brand-and-Portal-v1.1.1` | مصدر المحتوى الأحدث |
| **v1.1.0 (النشر)** | `BHD-Complete-Brand-and-Portal-v1.1.0` | مجلد جذر Vercel — يضم أحدث المحتوى + Next.js |
| v1.0.0 | `BHD-Portal-GitHub-Source-v1.0.0` | نسخة أقدم محدَّثة بنفس المحتوى وطبقة Next.js |

**Root Directory في Vercel:** `BHD-Complete-Brand-and-Portal-v1.1.0`

## التشغيل المحلي

يتطلب Node.js `>=22.13.0`.

```bash
cd BHD-Complete-Brand-and-Portal-v1.1.0
npm install
npm run dev
```

ثم افتح [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm test
```

## الصفحات

- `/` الرئيسية
- `/products` و `/products/[slug]` المنتجات
- `/brand` مركز الهوية وملفات التنزيل
- `/about` `/technology` `/security` `/privacy` `/terms` `/contact`
- `/apps` مشغّل التطبيقات
- `/login` دخول حساب BHD (هوية المنظومة)
- `/.well-known/openid-configuration` اكتشاف OIDC للمواقع الأخرى
- `/healthz` فحص الصحة

## الهوية والأصول

- شعارات رسمية في الجذر و`BHD-Brand-Assets`
- حقيبة العلامة: `BHD-Brand-Kit-v1.0` و`BHD-Brand-Kit-v1.0.zip`
- حزم التسليم الأصلية: `BHD-Portal-GitHub-Source-v1.0.0.zip`، `BHD-Complete-Brand-and-Portal-v1.1.0.zip`، `BHD-Complete-Brand-and-Portal-v1.1.1.zip`، `BHD-Brand-Assets.zip`
- بصمات الملفات: `SHA256SUMS.txt`
- دليل الهوية: `BHD-BRAND-IDENTITY-Arabic.md`
- دليل الهوية البصري PDF: `BHD-Visual-Identity-Guidelines.pdf`
- وثيقة البوابة العربية: `BHD-Portal-Documentation-Arabic.md`

## الواجهة الحالية

- **العربية أولاً** في الصفحات الداخلية والرئيسية.
- **الخط:** نفس خط وازن — IBM Plex Sans Arabic للعربية وInter للاتينية.
- **صورة الهوية في الرئيسية:** تُعرض كاملة بنسبة 1200×630 بدون قص الأطراف.
- **النصوص:** كلمات عربية متصلة. وعد الرئيسية العربي يعمل بنفس آلية الإنجليزية: ثلاث كلمات بنقاط، والحرف المميز بالذهبي.
- زر **EN** يبقى للترجمة الإنجليزية الاختيارية.

## التحقق

الموقع الحي يجب أن يعيد `200` على: `/` `/brand` `/products` `/about` `/apps` `/login` `/technology` `/security` `/contact` `/healthz`.


عند وصول نسخة أحدث (مثل v1.1.1):

1. تُنسخ تحسينات المحتوى إلى `v1.1.0` (مجلد النشر).
2. تُنسخ نفسها إلى `v1.0.0` حتى لا تبقى النسخ القديمة متخلفة.
3. تُحفظ طبقة Next.js ورؤوس الحماية و`/healthz` في كل نسخ البوابة.
4. يُرفع المستودع بالكامل إلى GitHub ثم يُعاد نشر الإنتاج عند الحاجة.
