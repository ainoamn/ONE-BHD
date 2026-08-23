# استبدال بيتك بـ BHD R في البوابة

تاريخ: 23 أغسطس 2026

## التغيير

- منتج العقار العام في الكتالوج والمشغّل أصبح **BHD R** بدل «بيتك».
- الرابط العام: [https://r.bhd-om.com/ar](https://r.bhd-om.com/ar)
- `slug` / `appId` / `client_id`: `bhd-r`
- التحويل: `/products/baitak` و`/products/ain-oman` → `/products/bhd-r`
- الأسماء القديمة `bhd-baitak` و`bhd-ain-oman` تُحلّ إلى `bhd-r` في الهوية
- وضع المشغّل حالياً: `browse` مع `startUrl` للصفحة العربية حتى يُفعَّل SSO الحي

## ما لم يتغيّر

- **مكتب BHD** يبقى على `https://baitak.bhd-om.com` بـ `client_id=bhd-office`
