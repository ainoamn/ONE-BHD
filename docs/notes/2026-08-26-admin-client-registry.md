# دليل موحّد موسّع + تسجيل عملاء من الإدارة

- الصفحة: https://id.bhd-om.com/docs/unified-login (دليل مبتدئ مفصّل).
- بعد تنفيذ start/callback على المنتج: سجّل العميل من `/admin` → «العملاء والربط» أو `POST /api/admin/clients`.
- الجدول: `bhd_oauth_clients` (ديناميكي) يُدمج مع `IDENTITY_CLIENTS` الثابت عند authorize/token.
- تفعيل `mode=sso` من الواجهة أو `PATCH /api/admin/clients`.
