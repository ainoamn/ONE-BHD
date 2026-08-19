# دخول فيسبوك على هوية BHD

الزر يعمل **فقط** على `https://id.bhd-om.com/login` (ونفس التطبيق على `www` و`one-bhd.vercel.app`). المنتجات لا تضيف فيسبوك.

تطبيق Meta الحالي: **bhd-om.com** — App ID `2020952291888711`.

## في لوحة Meta (ما يبقى لك)

1. أنت في المكان الصحيح: **حالات الاستخدام → تسجيل دخول فيسبوك**.
2. الأذونات اللازمة للدخول: `email` و`public_profile`. لملء الملف: `user_birthday` و`user_gender` و`user_location`. **لا تضف** `user_hometown` (فيسبوك يرفضه في هذا الإصدار). **لا تضف** الصور أو المنشورات أو الأصدقاء. فيسبوك **لا يعطي رقم الهاتف** عبر تسجيل الدخول؛ الهاتف ومسقط الرأس يُكتبان في `/account`.
3. من الشريط الجانبي اضغط **الإعدادات** داخل حالة استخدام فيسبوك، وأضف **Valid OAuth Redirect URIs** حرفياً:
   - `https://id.bhd-om.com/api/auth/facebook/callback`
   - `https://www.bhd-om.com/api/auth/facebook/callback`
   - `https://one-bhd.vercel.app/api/auth/facebook/callback`
   - `http://localhost:3000/api/auth/facebook/callback` (تطوير)
4. **إعدادات التطبيق → أساسي**: انسخ **App Secret**. لا تلصقه في Git ولا في الشات.
5. في Vercel → مشروع `one-bhd` → Environment Variables → Production:
   - `FACEBOOK_APP_ID` = `2020952291888711`
   - `FACEBOOK_APP_SECRET` = السر
6. أضف حساب فيسبوك الخاص بك كمسؤول/مطوّر/مختبر للتطبيق. في وضع التطوير لا يدخل إلا هؤلاء.
7. التحويل إلى **Live** ومراجعة التطبيق لاحقاً عندما تريد دخولاً عاماً. التحقق التجاري غير مطلوب لبدء الاختبار.

## في الكود (مُنفَّذ)

- `GET /api/auth/facebook/start` يحوّل إلى Meta.
- `GET /api/auth/facebook/callback` يستبدل الرمز على الخادم، يتحقق أن التوكن لهذا الـ App ID، ثم يفتح جلسة `bhd_id`.
- العمود `bhd_users.facebook_id`. إن وُجد بريد موثّق مطابق يُربط الحساب بدل إنشاء حساب ثانٍ.
- بعد الدخول تُملأ في `/account` إن وُجدت: الجنس، تاريخ الميلاد، المدينة (`user_location`). مسقط الرأس والهاتف يُدخلان يدوياً.

واتساب ليس جزءاً من هذا المسار؛ يُضبط لاحقاً كرمز لمرة واحدة.
