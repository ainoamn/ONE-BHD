# وثيقة مستودع ONE-BHD

> **المشروع:** بوابة Bin Hamood Development وهويتها البصرية  
> **التاريخ:** 16–17 أغسطس 2026  
> **الموقع الحي:** https://one-bhd.vercel.app  
> **المستودع:** https://github.com/ainoamn/ONE-BHD  
> **منصة النشر:** Vercel — مشروع `one-bhd`  
> **مجلد البناء:** `BHD-Complete-Brand-and-Portal-v1.1.0`

هذه الوثيقة تسجّل بنية المستودع، تاريخ الإصدارات، طريقة الدمج، التشغيل، النشر، الأمان، والتحقق من كفاءة الموقع.

---

## 1. الغرض

ONE-BHD هو المستودع الأم لـ:

1. البوابة العامة للشركة ومنتجاتها الرقمية.
2. نظام الهوية البصرية (الشعار، الألوان، القوالب، دليل الاستخدام).
3. وثائق التقنية والأمان والخصوصية والنشر.

البوابة **ليست** قاعدة بيانات مركزية للمنتجات. كل منتج (WAZEN، HISAB، NASAB، وغيرها) يبقى مستقلاً بمستودعه ونشره وبياناته.

---

## 2. العلامة

| البند | القيمة |
|---|---|
| الاسم القانوني | Bin Hamood Development |
| الاختصار | BHD |
| الوعد | Build Higher Dreams |
| العربية | ابنِ أحلامًا أكبر |
| المقر | مسقط، سلطنة عُمان |

معاني الحروف:

- **B — BUILD:** نبني منتجات وأعمالاً قابلة للحياة.
- **H — HIGHER:** نرفع الجودة والطموح.
- **D — DREAMS:** نحوّل الطموح إلى واقع.

ألوان الهوية الأساسية:

- عُمان العميق `#092D24`
- فيروز BHD `#08A39F`
- بحري BHD `#174B70`
- ذهب الطموح `#B58D55`

---

## 3. خريطة المستودع

```
ONE-BHD/
├── README.md
├── docs/BHD-REPOSITORY-DOCUMENTATION.md   ← هذه الوثيقة
├── docs/BHD-IDENTITY-SSO.md               ← مواصفة الهوية الموحّدة (تُنسخ لبقية المواقع)
├── docs/BHD-PORTAL-FULL-AUDIT.md          ← المراجعة الشاملة للأمان والبناء والترقية
├── BHD-Complete-Brand-and-Portal-v1.1.1   ← أحدث مصدر محتوى
├── BHD-Complete-Brand-and-Portal-v1.1.0   ← نسخة النشر على Vercel
├── BHD-Portal-GitHub-Source-v1.0.0        ← النسخة الأولى بعد دمج اللاحق فيها
├── BHD-Brand-Kit-v1.0/                    ← حقيبة الهوية
├── BHD-Brand-Assets/                      ← أصول الشعار
├── BHD-BRAND-IDENTITY-Arabic.md
├── BHD-Portal-Documentation-Arabic.md
├── BHD-Visual-Identity-Guidelines.pdf
├── SHA256SUMS.txt
├── BHD-Brand-Assets.zip
├── BHD-Brand-Kit-v1.0.zip
├── BHD-Portal-GitHub-Source-v1.0.0.zip
├── BHD-Complete-Brand-and-Portal-v1.1.0.zip
├── BHD-Complete-Brand-and-Portal-v1.1.1.zip   ← أحدث حزمة تسليم
└── شعارات PNG/SVG الرسمية
```

---

## 4. سياسة الإصدارات (دائماً ادمج الأحدث في الأقدم)

القاعدة المعتمدة في هذا المستودع:

1. **المصدر الأحدث هو المرجع.** حالياً `v1.1.1`.
2. **نسخة النشر تُحدَّث من الأحدث.** `v1.1.0` يستقبل محتوى `v1.1.1` مع الإبقاء على طبقة Next.js اللازمة لـ Vercel.
3. **النسخ الأقدم تُحدَّث أيضاً.** `v1.0.0` يستقبل صفحة الهوية `/brand`، الأصول القابلة للتنزيل، الصفحة الرئيسية المحدَّثة، وNext.js حتى لا تبقى نسخة متخلفة.
4. لا يُنشر vinext/Cloudflare على Vercel؛ النشر المعتمد هو **Next.js 16**.

ما دُمج من `v1.1.1` إلى النسخ الأقدم في 16 أغسطس 2026:

- نص الرئيسية العربية (`بن حمود للتطوير · ابنِ أحلامًا أكبر`).
- تحديثات `app/globals.css`.
- صفحة `/brand` وملفات التنزيل في `v1.0.0`.
- طبقة Next.js و`/healthz` ورؤوس الحماية في كل نسخ البوابة الثلاث.

---

## 5. لماذا Vercel كانت تظهر 404

1. جذر GitHub لا يحتوي تطبيق Next.js؛ التطبيق داخل مجلد فرعي.
2. القوالب الأصلية تستخدم **vinext** الموجه لـ Cloudflare، وVercel لا تخدمه كإنتاج.
3. رفع Git بعد إنشاء المشروع بدون **Root Directory** يجعل Vercel تبني الجذر فتفشل.

العلاج المعتمد:

- إطار المشروع: **Next.js**
- Root Directory: `BHD-Complete-Brand-and-Portal-v1.1.0`
- `vercel.json` داخل مجلد النشر: `{ "framework": "nextjs" }`
- Node: `22` عبر `.node-version`

---

## 6. التشغيل

المتطلب: Node.js `>= 22.13.0`

```bash
cd BHD-Complete-Brand-and-Portal-v1.1.0
npm install
npm run dev      # http://localhost:3000
npm run build
npm test
npm start
```

السكربتات:

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تطوير Next.js |
| `npm run build` | بناء الإنتاج |
| `npm start` | تشغيل البناء |
| `npm test` | بناء ثم اختبارات الملفات والحماية والهوية |
| `npm run lint` | فحص ESLint |

---

## 7. المسارات

| المسار | الوظيفة |
|---|---|
| `/` | الرئيسية ثنائية اللغة |
| `/products` | دليل المنتجات |
| `/products/[slug]` | صفحة منتج |
| `/brand` | نظام الهوية وملفات التنزيل |
| `/about` | الشركة |
| `/technology` | البنية التقنية |
| `/security` | الأمان |
| `/privacy` | الخصوصية |
| `/terms` | الشروط |
| `/contact` | التواصل |
| `/apps` | دليل تطبيقات للزائر (تسويقي) |
| `/account` | ملف حساب BHD: البيانات، المواقع المرتبطة، الاشتراكات (يتطلب دخولًا) |
| `/login` | دخول حساب BHD (بريد/اسم مستخدم + Google) على الهوية |
| `/admin` | لوحة تحكم الهوية — مدراء المنصة فقط (`BHD_PLATFORM_ADMIN_EMAILS`) |
| `/healthz` | `{ "status": "ok", "service": "bhd-portal" }` |
| `/sitemap.xml` | خريطة الموقع |
| `/robots.txt` | قواعد الأرشفة |
| `/manifest.webmanifest` | بيان تطبيق الويب |

---

## 8. الأمان الحالي

المراجعة التفصيلية (فوائد، ثغرات، تشفير، نواقص، ترقية) في [`BHD-PORTAL-FULL-AUDIT.md`](BHD-PORTAL-FULL-AUDIT.md).

مطبق عبر `next.config.ts`:

- Content-Security-Policy: `default-src 'self'` و`frame-ancestors 'none'`
- HSTS، `X-Frame-Options: DENY`، `X-Content-Type-Options: nosniff`
- Permissions-Policy تعطّل الكاميرا والميكروفون والموقع والدفع
- صفحة `/login` و`/admin` و`/account` و`/oauth/*`: `noindex, noarchive` و`Cache-Control: private, no-store`
- هوية BHD (OIDC) على `https://id.bhd-om.com` — المواصفة: [`BHD-IDENTITY-SSO.md`](BHD-IDENTITY-SSO.md)
- لوحة الإدارة: `https://id.bhd-om.com/admin` (نفس المسار على `www.bhd-om.com/admin`)
- مشغّل التطبيقات بعد الدخول: تسع نقاط بجانب صورة الحساب — المواصفة [`BHD-APP-SWITCHER.md`](BHD-APP-SWITCHER.md)
- Neon `bhd-identity` عبر `DATABASE_URL` — لا تُشارك مع وازن أو حسابي

ما يبقى لكل منتج (مقصود):

- أدوار المدير داخل كل تطبيق، لا من الهوية
- ربط SSO في وازن ثم حسابي ثم نَسَب وبيتك والمتجر (القسم 6 من مواصفة الهوية)
- نسخ مشغّل التطبيقات (`BhdAppSwitcher` + `lib/bhd/apps.ts`) إلى تلك المواقع بعد SSO

---

## 9. النشر

| البند | القيمة |
|---|---|
| الإنتاج | https://www.bhd-om.com وhttps://id.bhd-om.com |
| Git | فرع `main` على `ainoamn/ONE-BHD` |
| البناء | `next build` داخل مجلد `v1.1.0` |
| إعادة النشر CLI | من جذر المستودع: `npx vercel --prod --yes` بعد ربط المشروع |

بعد كل دمج إصدار جديد:

1. دمج المحتوى في `v1.1.0` و`v1.0.0`.
2. `npm run build` و`npm test` في مجلد النشر.
3. `git add -A` ثم commit و`git push origin main`.
4. نشر Vercel إذا لم يُربَط Git تلقائياً.

---

## 10. التحقق من كفاءة الموقع

يُفحص الإنتاج على:

- `GET /` يجب أن يعيد `200` وHTML
- `GET /brand` `/products` `/about` `/apps` `/login` `/technology` `/security` `/contact` يجب أن تعيد `200`
- `GET /healthz` يجب أن يعيد JSON مع `Cache-Control: no-store`
- رؤوس CSP وHSTS و`X-Frame-Options` موجودة
- البناء يولّد المسارات دون أخطاء TypeScript

---

## 11. المنتجات المرتبطة (حسب البوابة)

البوابة تعرض المنتجات وتربط إلى مواقعها الرسمية تحت `bhd-om.com`. البيانات التشغيلية تبقى خارج البوابة.

| المنتج | النطاق |
|---|---|
| وازن | https://wazen.bhd-om.com |
| حسابي | https://hisaby.bhd-om.com |
| نَسَب | https://nasab.bhd-om.com |
| بيتك (العقار، كان عين عُمان) | https://baitak.bhd-om.com |
| متجر BHD | https://bhdstor.bhd-om.com |
| مكتب BHD | عند الإطلاق |

CNAME لكل نطاق فرعي من عُمان: `cname.vercel-dns.com` (ليس `vercel-dns-017`).

---

## 12. المراجعة الشاملة (17 أغسطس 2026)

أُنجزت مراجعة للكود المنشور وللموقع الحي. الخلاصة:

- البوابة واجهة علامة ودليل منتجات، ليست هوية موحّدة ولا قاعدة بيانات مركزية.
- الأمان الحالي يناسب موقعاً بلا حسابات: TLS/HSTS، رؤوس متصفح، وعدم جمع بيانات.
- لا تشفير عند التخزين لأنه لا تُخزَّن بيانات مستخدم.
- النواقص: تناقض `bhd-om.com` في robots/security.txt مع النطاق الحي، CSP فيها `unsafe-inline`، بقايا vinext وchatgpt-auth.
- مسار الترقية: ضبط النطاق والإفصاح، ثم النطاق الرسمي، ثم خدمة هوية مستقلة (OIDC) دون خلط قواعد بيانات المنتجات.

التقرير الكامل: [`BHD-PORTAL-FULL-AUDIT.md`](BHD-PORTAL-FULL-AUDIT.md).

---

## 13. سجل العمل في 16–17 أغسطس 2026

| الخطوة | النتيجة |
|---|---|
| رفع المجلد الأول إلى GitHub | مستودع `ainoamn/ONE-BHD` على `main` |
| تثبيت التشغيل المحلي | `npm install` و`npm run dev` على المنفذ 3000 |
| 404 على Vercel | لا نشر إنتاج + vinext غير مدعوم + التطبيق في مجلد فرعي |
| التحويل إلى Next.js 16 | مجلد النشر `BHD-Complete-Brand-and-Portal-v1.1.0` |
| Root Directory في Vercel | نفس المجلد أعلاه |
| دمج v1.1.1 في v1.1.0 وv1.0.0 | سياسة «الأحدث يدخل الأقدم» |
| حزم Codex الأصلية | ZIP + `SHA256SUMS.txt` مطابق للمخرجات |
| خط وازن | IBM Plex Sans Arabic + Inter |
| تعريب الواجهة | أسماء المنتجات، مخطط المنظومة، معاينة الحساب، التذييل |
| صورة البطل | `object-fit: contain` بنسبة الملف الأصلية |
| وضوح النص | إصلاح تكسير الحروف العربية ورفع التباين من 6px باهت |
| وعد الرئيسية العربي | نفس آلية الإنجليزية: ثلاث كلمات بنقاط، الحرف الأول ذهبي والنقطة بلون الكلمة |
| دخول Google على البوابة | نسخ آلية حسابي: ID Token + تحقق خادم + كوكي HttpOnly — انظر `docs/BHD-UNIFIED-GOOGLE-AUTH.md` |
| مراجعة شاملة 17 أغسطس | تقرير `docs/BHD-PORTAL-FULL-AUDIT.md` وربطه من README |

## 14. قرارات الواجهة المعتمدة

- الصفحات الداخلية عربية فقط.
- الرئيسية عربية افتراضياً مع مفتاح إنجليزي.
- معادلة العلامة في العربية: **BHD = بن حمود للتطوير / ابنِ أحلامًا أكبر**.
- لا تُعرض الأسماء الإنجليزية للمنتجات (WAZEN، HISAB…) بجانب الاسم العربي في الوضع العربي.
- مخطط المنظومة بالعربية: دخول موحّد، الملف والأمان، بوابة الشركة.
- معاينة الحساب: حساب BHD، عبد الحميد، جلسة آمنة.

## 15. مرجع الخط (مثل وازن)

المصدر المعتمد: مستودع [WAZEN](https://github.com/ainoamn/WAZEN) وموقع [wazen-roan.vercel.app](https://wazen-roan.vercel.app/).

في `app/layout.tsx`:

- `IBM_Plex_Sans_Arabic` → `--font-plex-arabic`
- `Inter` → `--font-inter`

في `app/globals.css`: `--font-sans` يجمع الخطّين. الوضع الإنجليزي يستخدم Inter أولاً.

## 16. السجلات المرجعية الأخرى داخل المستودع

- `docs/BHD-UNIFIED-GOOGLE-AUTH.md` — دخول Google الموحّد وتعليمات تطبيقه على كل المواقع
- `docs/BHD-PORTAL-FULL-AUDIT.md` — مراجعة الإنتاج: البناء، الأمان، التشفير، النواقص، الترقية
- `BHD-Portal-Documentation-Arabic.md` — وثيقة البوابة الهندسية العربية
- `BHD-Complete-Brand-and-Portal-v1.1.0/docs/BHD-PORTAL-DOCUMENTATION.md` — المرجع التقني المفصّل
- `BHD-BRAND-IDENTITY-Arabic.md` وملفات `docs/BHD-BRAND-IDENTITY.md` داخل نسخ البوابة — الهوية
- `SHA256SUMS.txt` — بصمات حزم التسليم الأصلية
- هذا الملف — تشغيل المستودع والنشر والتعريب
