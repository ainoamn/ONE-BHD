# سياسة الجلسة الدائمة — 4 أكتوبر 2026

أُلغيت مهلة الخمول (48 ساعة). الجلسة تبقى حتى «خروج» صريح. المصدر المعتمد: [`docs/BHD-SESSION-POLICY.md`](../BHD-SESSION-POLICY.md).

## الهوية (هذا المستودع)

- كوكي `bhd_id`: 400 يوم. JWT وrefresh بنفس المدة.
- حُذف `app/components/auth/SessionKeepAlive.tsx`.
- `GET /api/auth/me` و`PATCH /api/account`: JSON فقط، بلا `Set-Cookie`.
- سكربت جوجل على `/login` فقط؛ `useOneTap` و`auto_select` معطّلان.
- `InstantLink` لا يسخّن `/login` ولا `/api/auth`. `NavigationWarmup` لا يعمل على `/login` ولا عند مجرد فتح التبويب.
- دخول جوجل/فيسبوك يفك قفل محاولات كلمة المرور الفاشلة.
- حدّ المعدل على `/api/auth/login` و`/api/auth/google` لا يُحسب إن وُجدت جلسة قائمة.
- فشل شبكة `/me` لا يُظهر المستخدم خارجاً.

## المنتجات

انسخ السياسة إلى `docs/BHD-SESSION-POLICY.md` في كل مستودع منتج ونفّذ قائمة التنفيذ هناك. صفوف المكتب في الدليل الموحّد كانت ما زالت تصف خمول 48 ساعة كحالة تاريخية؛ المطلوب الآن مطابقة السياسة في `ainoamn/bhd-om`.
