# BHD Identity — سجل النشر والربط

## 2026-10-29 — Multi-product wire rollout

| البند | التفاصيل |
|---|---|
| الهوية | `id.bhd-om.com` — runtime + catalog + `bhd-identity.js` (rebind-first isolate) |
| مرجع العزل | `docs/BHD-ACCOUNT-ISOLATION.md` — BHD-HR §93 |
| ain-oman-web | سلك أدنى Pages Router + شريط كتالوج + `/api/auth/bhd/*` stubs |
| nextjs-boilerplate | قالب App Router BHD-wired (initial seed) |
| ONE-BHD portal | `logout` + `rebind` تحت `app/api/auth/bhd/` في v1.1.0 / v1.1.1 / GitHub-source |
| حالة المنتجات | `docs/BHD-PRODUCTS-WIRE-STATUS.md` |

**نشر Vercel (بوابة):** من جذر ONE-BHD — `npx vercel --prod --yes` (مجلد `BHD-Complete-Brand-and-Portal-v1.1.0`).

## 94. ربط كل منتجات BHD بالهوية الحيّة (2026-10-29)

**المطلوب:** توثيق جاد لأعمال العزل/الكتالوج، وتطبيق السلك (تسجيل، أيقونات، ربط، rebind) على كل المستودعات المدرجة.

| # | ما نُفّذ |
|---|---|
| 1 | وثائق مركزية: ACCOUNT-ISOLATION، CURSOR-WIRE، PRODUCTS-WIRE-STATUS |
| 2 | تحديث BHD-HR كمرجع (§93) + خريطة ملفات PRODUCT-WIRE |
| 3 | دفع السلك إلى WAZEN، hisaby، BHD-STOR، BHD-R، Nasab، bhd-om، ain-oman-web، nextjs-boilerplate |
| 4 | بوابة ONE-BHD: logout + rebind؛ مزامنة الأشجار الثلاث |

**الخطوات:** commit، push main، `npx vercel --prod --yes`.


## 95. جذر عزل التبديل على الهوية: كتابة bhd_id دائماً (2026-10-29)

**المشكلة:** بعد التبديل على id.bhd-om.com (وكل المنتجات) تبقى بيانات أول إيميل — لأن `/api/auth/switch` مع Bearer كان لا يكتب كوكي `bhd_id`.

| # | ما نُفّذ |
|---|---|
| 1 | `switch` يعيد كتابة `bhd_id` + roster دائماً |
| 2 | `me` يعيد دائماً `token` للحساب النشط |
| 3 | بعد التبديل: تنقل صلب بـ `?_bhd=` بدل reload |

**الخطوات:** push + `npx vercel --prod --yes`.

