# قوالب بريد الهوية + حذف المستخدم + تسريع الروابط

## المشكلة
- رسائل إعادة كلمة المرور/التفعيل كانت بلا شعار ولا شبكة برامج.
- روابط Outlook تمرّ عبر Safe Links، وكانت قبل ذلك تمرّ أيضاً عبر تتبّع نقرات Resend (`noreply.bhd-om.com/CL0/...`) فتزيد التأخير.

## ما تغيّر
1. **قالب HTML احترافي**: شعار BHD من `id.bhd-om.com/brand/bhd-logo.svg` + نصوص واضحة + شبكة أيقونات برامج المجموعة (`BHD_APPS`).
2. **إدارة القوالب**: `/admin` → «قوالب البريد» — تعديل subject/headline/body/cta/footnote مع معاينة حية. الجدول `bhd_email_templates`.
3. **حذف نهائي**: من تفاصيل المستخدم → «حذف نهائي من الهوية» (`DELETE /api/admin/users?id=`) لمسح الحساب من Neon (للت steست وإعادة التسجيل). لا يمس قواعد المنتجات.
4. **Resend**: إيقاف click/open tracking على نطاق `bhd-om.com` حتى تكون الروابط مباشرة إلى `id.bhd-om.com` (قد يبقى تأخير قصير من Outlook Safe Links فقط).

## APIs
- `GET/PATCH /api/admin/emails`
- `DELETE /api/admin/users?id=`
