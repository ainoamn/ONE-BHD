# دخول BHD الموحّد عبر Google

> **التاريخ:** 17 أغسطس 2026  
> **المصدر المنسوخ:** [حسابي / hisaby](https://github.com/ainoamn/hisaby)  
> **التطبيق الأول:** بوابة [one-bhd.vercel.app](https://one-bhd.vercel.app) — مجلد النشر `BHD-Complete-Brand-and-Portal-v1.1.0`  
> **الحالة:** المرحلة 0 فقط (دخول Google محلي بنفس Client ID).  
> **SSO المعتمد:** نفّذ [`docs/BHD-IDENTITY-SSO.md`](BHD-IDENTITY-SSO.md) — الإصدار `bhd-identity.v1`. هذه الوثيقة لا توحّد الجلسات ولا دفتر العناوين.

---

## 1. الفكرة الكاملة

نريد **حساب Google واحد** لكل منتجات بن حمود للتطوير: البوابة، حسابي، وازن، نَسَب، والمتاجر لاحقًا.

حسابي يفعل ذلك اليوم هكذا:

1. الواجهة تعرض زر Google الرسمي (`@react-oauth/google`).
2. Google يعيد **ID Token**.
3. الخادم يتحقق من الرمز بـ `google-auth-library` و`audience` = Client ID.
4. إن كان البريد موثّقًا، يُصدر الخادم جلسة JWT في كوكي **HttpOnly**.

البوابة نسخت **نفس الآلية** دون نسخ قاعدة بيانات حسابي. البوابة لا تنشئ شركة ولا تخزّن كلمة مرور. الجلسة تبقى في كوكي `bhd_portal` على نطاق البوابة فقط.

```
المستخدم
   │
   ▼
زر Google (نفس Client ID لكل مواقع BHD)
   │  ID Token
   ▼
خادم ذلك الموقع يتحقق من الرمز
   │
   ▼
جلسة HttpOnly خاصة بهذا الموقع
```

**مهم:** تسجيل الدخول بـ Google على كل موقع يعني «نفس الشخص»، لكنه **لا يشارك الكوكي** بين `one-bhd.vercel.app` و`bhd-pro.vercel.app` لأن النطاق مختلف. التوحيد الحقيقي للجلسة يحتاج لاحقًا نطاقًا أبًا مثل `*.bhd-om.com` أو خدمة **BHD Identity** بمعيار OpenID Connect.

---

## 2. ما الذي ثُبّت على البوابة

| العنصر | الموقع في الكود |
|---|---|
| زر Google | `app/components/auth/GoogleSignInButton.tsx` |
| مزوّد Google | `app/components/auth/GoogleOAuthRoot.tsx` في `app/layout.tsx` |
| التحقق من الرمز | `POST /api/auth/google` + `app/lib/auth/google.ts` |
| الجلسة | كوكي `bhd_portal` عبر `jose` HS256 لمدة 7 أيام |
| أنا / خروج | `GET /api/auth/me` و`POST /api/auth/logout` |
| الواجهة | `/login` + قائمة الجلسة في رأس الرئيسية والصفحات الداخلية |

لا تُنسخ أسرار حسابي إلى المستودع. تُضبط في Vercel.

---

## 3. ضبط Google Cloud (مرة واحدة لكل المنظومة)

استخدم **نفس مشروع Google Cloud ونفس OAuth 2.0 Client ID** الموجود في حسابي.

1. افتح [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → APIs & Services → Credentials.
2. عميل النوع **Web application**.
3. **Authorized JavaScript origins** — أضف كل واجهة:

   - `http://localhost:3000`
   - `https://one-bhd.vercel.app`
   - `https://bhd-pro.vercel.app` (حسابي)
   - لاحقًا: `https://wazen-roan.vercel.app` و`https://nasab-mu.vercel.app` وأي نطاق رسمي.

4. **Authorized redirect URIs** إن طُلبت لتدفق آخر: أبقِ ما يستخدمه حسابي، وأضف أصل البوابة عند الحاجة.
5. انسخ **Client ID** (ليس Client Secret لزر GIS هذا؛ التدفق الحالي ID Token في المتصفح).

---

## 4. متغيرات البيئة على البوابة

في Vercel للمشروع `one-bhd` (Production + Preview):

| المتغير | الغرض |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID الظاهر للمتصفح (نفس حسابي) |
| `GOOGLE_CLIENT_ID` | نفس القيمة للتحقق على الخادم |
| `AUTH_SECRET` | مفتاح توقيع جلسة البوابة — `openssl rand -base64 48` |

بعد ضبطها: Redeploy.

محليًا انسخ `BHD-Complete-Brand-and-Portal-v1.1.0/.env.example` إلى `.env.local`.

بدون هذه القيم يظهر في `/login` تنبيه الإعداد بدل الزر، و`POST /api/auth/google` يعيد 503.

---

## 5. تعليمات تطبيق نفس الدخول على كل موقع

لكل منتج (وازن، نَسَب، متجر، مكتب):

### أ. لا تربط قواعد البيانات

لا تستدعِ API حسابي من وازن أو من البوابة لتسجيل المستخدم. كل منتج يتحقق من Google ثم يدير **مستخدميه** في مخزنه.

### ب. انسخ النمط لا الخدمة

1. نفس `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
2. زر `@react-oauth/google`.
3. مسار خادم `POST /auth/google` أو ما يعادله.
4. `verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`.
5. ارفض إن لم يكن `email_verified`.
6. ابحث عن المستخدم بـ `googleId` أو البريد؛ أنشئه إن كان التسجيل مسموحًا في ذلك المنتج.
7. أصدر كوكي HttpOnly باسم خاص بالمنتج (`bhd_access` في حسابي، `bhd_portal` في البوابة).
8. حدّث CSP: `accounts.google.com` في script/frame/connect، وصور `*.googleusercontent.com`.
9. `Cross-Origin-Opener-Policy: same-origin-allow-popups` حتى يعمل زر Google.
10. أضف أصل الموقع في Google Console.
11. حدّث سياسة الخصوصية قبل الإطلاق.

### ج. قائمة تحقق لكل منتج

- [ ] Client ID نفسه
- [ ] Origin مضاف في Google Cloud
- [ ] تحقق الخادم من `audience`
- [ ] كوكي HttpOnly + Secure في الإنتاج + SameSite=Lax
- [ ] معدل محاولات على مسار الدخول
- [ ] لا كلمة مرور مخزّنة لهذا المسار
- [ ] جلسة المنتج لا تُقرأ من منتج آخر

مرجع حسابي:

- الواجهة: `frontend/src/components/auth/GoogleSignInButton.tsx`
- الخادم: `backend/src/auth/auth.service.ts` → `loginWithGoogle`
- المسار: `POST /auth/google`

---

## 6. المرحلة التالية (هوية واحدة فعلًا)

المواصفة الملزمة: [`BHD-IDENTITY-SSO.md`](BHD-IDENTITY-SSO.md).

- المُصدِر: `https://id.bhd-om.com`
- البروتوكول: Authorization Code + PKCE + OIDC
- المعرّف المشترك: `sub` / عمود `bhd_sub`
- لا تُشارك قواعد البيانات ولا كوكي المنتجات

حتى اكتمال المرحلة 2 في تلك المواصفة: المستخدم يسجّل بـ Google في كل موقع مرة؛ الهوية هي بريد Google نفسه، والجلسات منفصلة.

---

## 7. الأمان

- التحقق يتم على الخادم، لا يُوثق بالمتصفح وحده.
- لا يُرفع `AUTH_SECRET` إلى Git.
- مسار Google محدود بـ 10 طلبات / دقيقة / عنوان.
- صفحة `/login` تبقى `noindex` و`no-store`.
- البوابة لا تملك قاعدة مستخدمين؛ إن سُرقت الجلسة فهي لهذا الموقع فقط وتنتهي خلال 7 أيام.

---

## 8. التشغيل المحلي

```bash
cd BHD-Complete-Brand-and-Portal-v1.1.0
cp .env.example .env.local
# املأ Client ID و AUTH_SECRET
npm install
npm run dev
```

افتح `/login` وجرّب الزر. إن فشل Google بسبب origin: أضف `http://localhost:3000` في Google Cloud.
