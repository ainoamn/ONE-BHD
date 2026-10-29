# اقرأني أولاً — استكمال العمل من جهاز آخر

**تاريخ التوثيق:** 29 أكتوبر 2026  
**المستودع:** https://github.com/ainoamn/ONE-BHD  
**الفرع:** `main` (يجب أن يكون متزامناً مع `origin/main`)

## ماذا تفعل الآن على الكمبيوتر الثاني؟

```bash
git clone https://github.com/ainoamn/ONE-BHD.git
# أو إن كان المستودع موجوداً مسبقاً:
cd ONE-BHD
git pull origin main

# مجلد العمل والنشر:
cd BHD-Complete-Brand-and-Portal-v1.1.0
npm install
```

ثم افتح سياسة الجلسة المعتمدة ودليل التسليم:

→ [`docs/BHD-SESSION-POLICY.md`](BHD-SESSION-POLICY.md)  
→ [`docs/notes/2026-10-20-fast-multi-account.md`](notes/2026-10-20-fast-multi-account.md)

---

## ملخص هذه المحادثة (ما تم إنجازه ورفعه)

| # | الموضوع | النتيجة |
|---|---------|---------|
| 1 | دخول/خروج/تبديل/تنقل أسرع من جزء من الثانية | `/me` من الكوكي، كود OAuth موقّع، GIS بعد الضغطة |
| 2 | تعدد الحسابات من الرأس | `bhd_id_roster` + `/api/auth/switch` |
| 3 | وثائق لكل المنتجات | `BHD-SESSION-POLICY` و`BHD-APP-SWITCHER` و`BHD-ACCOUNT-SWITCHER` و`BHD-UNIFIED-LOGIN-AND-APPS` |
| 4 | حقول الحساب KYC | ترجمة الاسم عربي/إنجليزي، جنسية، جنس، ميلاد، مدني+جواز+مرفقات، هاتف |
| 5 | تنقّل فوري | تسخين الصفحات فور الفتح، بلا SSO على www، جوجل جاهز على `/login` |
| 6 | نوافذ متعددة | `sessionStorage` + Bearer حتى لا يسرق تبديل نافذة جلسة نافذة أخرى |
| 7 | 400 يوم | JWT بتاريخ انتهاء مطلق يطابق الكوكي |
| 8 | حماية `/admin` | سجل IP/دولة، حظر العنوان، قفل أمني، `/recover` |
| 9 | الكتالوج | ليس تلقائياً؛ اسحب `https://id.bhd-om.com/api/bhd/catalog` أو انسخ `apps.ts` |

**الإنتاج:** انشر من جذر المستودع: `npx vercel --prod --yes` (جذر المشروع `BHD-Complete-Brand-and-Portal-v1.1.0`).

---

## أين تكمل؟

1. في مستودعات المنتجات: انسخ `BHD-SESSION-POLICY.md` و`BHD-APP-SWITCHER.md` و`BHD-ACCOUNT-SWITCHER.md` مع `lib/bhd/apps.ts` و`BhdAppIcon.tsx` — يشمل **الموارد البشرية** `https://hr.bhd-om.com` في المشغّل والحساب والفوتر.
2. ترجمة محتوى الصفحات الداخلية الكامل (about/privacy/…) — التنقّل جاهز.
3. حد معدّل موزَّع إن احتجت حماية أقوى عبر عدة instances على Vercel.

---

## قواعد المستودع (لا تنسَ)

1. اعمل في `BHD-Complete-Brand-and-Portal-v1.1.0` ثم زامن إلى `v1.1.1` و`BHD-Portal-GitHub-Source-v1.0.0`.
2. وثّق في `docs/` عند الحاجة.
3. `git push origin main` ثم `npx vercel --prod --yes` من جذر المستودع.
4. لا ترفع أسراراً (`.env`، مفاتيح Resend، إلخ) — موجودة Encrypted على Vercel فقط.

---

## روابط سريعة بعد السحب

| الصفحة | الرابط |
|--------|--------|
| الإدارة / قوالب البريد | https://id.bhd-om.com/admin |
| الدخول / نسيت كلمة المرور | https://id.bhd-om.com/login |
| دليل الدخول الموحّد | https://id.bhd-om.com/docs/unified-login |
| رأس الإيميل (صورة) | https://id.bhd-om.com/brand/bhd-email-header.png |
