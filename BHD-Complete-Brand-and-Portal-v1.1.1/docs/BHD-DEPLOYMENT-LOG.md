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


## 96. عزل التبويبات: لا تزامن حساب بين نوافذ المنتج (2026-10-29)

**المشكلة:** تبويبان لـ HR — تبديل الأول يغيّر الثاني لأن `hr_session` مشتركة و`LiveUpdates` يعمل refresh، ولأن switch كان يكتب `bhd_id` دائماً.

| # | ما نُفّذ |
|---|---|
| 1 | `switch` يكتب الكوكي فقط بلا Bearer أو مع `X-BHD-Persist-Cookie: 1` (الهوية) |
| 2 | HR `BhdSilentSso` يعيد الربط دورياً لـ Bearer النافذة عند الانحراف |
| 3 | HR `LiveUpdates` يتخطى refresh عند اختلاف الهوية عن جلسة المنتج |


## 97. نموذج جوجل authuser على HR — عزل حقيقي بـ ?au= (2026-10-29)

**المشكلة:** بعد التبديل يبقى المبدّل على إيميل واللوحة على بيانات حساب آخر / نفس المنشأة بلا عزل بصري؛ التبويبات تختلط.

| # | ما نُفّذ |
|---|---|
| 1 | `?au=<sub>` مثل Google authuser + خريطة رموز لكل حساب في sessionStorage |
| 2 | `BhdPrivacyGate` — حجاب كامل حتى identity ≡ product ≡ au |
| 3 | تبديل المنتج يرسل `X-BHD-Persist-Cookie: 1` لتتبع البرامج المرتبطة |
| 4 | rebind يثبّت `au` في returnTo ويعيد ختم الجلسة دائماً |
| 5 | لوحة HR تعرض إيميل الجلسة تحت التحية |

**الخطوات:** push BHD-HR + ONE-BHD docs، `npx vercel --prod --yes` من جذر كل مستودع معني.

## 98. عزل صامت بلا ملاحظات ولا وميض (2026-10-29)

**المشكلة:** عند F5 تظهر «جاري عزل بيانات الحساب…» والموقع يومض؛ ملاحظة «إكمال التحديث» من إعادة الربط المتكررة.

| # | ما نُفّذ |
|---|---|
| 1 | إزالة كل نصوص العزل الظاهرة — غطاء فارغ فقط عند تبديل صريح |
| 2 | `rebind` JSON صامت للتوافق الخلفي (تحديث/تبويب) بلا redirect |
| 3 | إزالة `_bhd` من الرابط بعد الاستقرار |
| 4 | `SilentSso` كل 20ث بدل 4ث — لا حجاب |

