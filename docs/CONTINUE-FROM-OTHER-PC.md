# اقرأني أولاً — استكمال العمل من جهاز آخر

**تاريخ التوثيق:** 4 أكتوبر 2026  
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
→ [`docs/notes/2026-10-04-session-until-logout.md`](notes/2026-10-04-session-until-logout.md)

---

## ملخص هذه المحادثة (ما تم إنجازه ورفعه)

| # | الموضوع | النتيجة |
|---|---------|---------|
| 1 | سياسة جلسة: البقاء حتى «خروج» — بلا خمول 48 ساعة | `docs/BHD-SESSION-POLICY.md` على الهوية |
| 2 | حذف KeepAlive، `/me` و`PATCH /api/account` بلا Set-Cookie | مجلد النشر v1.1.0 |
| 3 | جوجل على `/login` فقط؛ لا تسخين `/login`؛ لا One Tap | InstantLink + NavigationWarmup + GIS |
| 4 | توثيق المنتجات: انسخ السياسة إلى مستودع كل موقع | وازن/حساب/كيمي/مكتب/متجر |

**الإنتاج:** انشر من جذر المستودع: `npx vercel --prod --yes` (جذر المشروع `BHD-Complete-Brand-and-Portal-v1.1.0`).

---

## أين تكمل؟

1. في مستودعات المنتجات: انسخ `BHD-SESSION-POLICY.md` ونفّذ قائمة التنفيذ (حذف KeepAlive، كوكي 400 يوم، `/me` قراءة فقط).
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
