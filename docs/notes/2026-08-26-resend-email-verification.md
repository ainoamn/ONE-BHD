# تأكيد البريد عبر Resend

تاريخ: 26 أغسطس 2026

## المتغيرات (Vercel فقط — لا تُرفع إلى Git)

| المتغير | الغرض |
|---|---|
| `RESEND_API_KEY` | مفتاح API من [Resend](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | عنوان المرسل، مثال: `BHD Identity <noreply@bhd-om.com>` |

يجب أن يكون نطاق المرسل **موثّقاً** في Resend (Domains) وإلا يفشل الإرسال.

## المسارات

- بعد التسجيل: إرسال رابط تلقائي إن وُجد المفتاح
- `POST /api/auth/resend-verification` من `/account` للمستخدم المسجّل
- `GET /api/auth/verify-email?token=…` → `/verify-email?status=ok`

منتجات مثل وازن ترفض الدخول إذا `email_verified=false` في هوية BHD.
