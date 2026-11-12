# كتالوج الأيقونات والفوتر — تحديث 12 نوفمبر 2026

المصدر: `BHD-Complete-Brand-and-Portal-v1.1.0/app/lib/bhd/apps.ts`  
الحي: `GET https://id.bhd-om.com/api/bhd/catalog` · الإدارة: `/admin#apps`

## التطبيقات في الشريط/الفوتر (enabled)

| id | الاسم | origin | client_id |
|---|---|---|---|
| account | الحساب | id.bhd-om.com | — |
| portal | بوابة بن حمود | www.bhd-om.com | bhd-portal |
| wazen | وازن | wazen.bhd-om.com | bhd-wazen |
| hisaby | حسابي | hisaby.bhd-om.com | bhd-hisaby |
| nasab | نَسَب | nasab.bhd-om.com | bhd-nasab |
| bhd-r | BHD R | r.bhd-om.com | bhd-r |
| store | المتجر | bhdstor.bhd-om.com | bhd-store |
| office | المكتب | baitak.bhd-om.com | bhd-office |
| hr | الموارد البشرية | hr.bhd-om.com | bhd-hr |
| legal | المكتب القانوني | legal.bhd-om.com | bhd-legal |
| work | إدارة الأعمال | work.bhd-om.com | bhd-work |
| cars | BHD سيارات | cars.bhd-om.com | bhd-cars |
| hikaya | حكاية | hikaya.bhd-om.com | bhd-hikaya |
| ain | عين عُمان | ain.bhd-om.com | bhd-ain |
| boilerplate | قالب BHD | boilerplate.bhd-om.com | bhd-boilerplate |
| ahhha | AHHHA | ahhha.bhd-om.com | browse |

تطابق قائمة مستودعات GitHub الظاهرة لدى ainoamn (مع استثناء أن AHHHA وضع browse بلا OAuth سرّي بعد).

## ما يلزم بعد النشر

1. تسجيل العملاء الجدد في `/admin#clients` بأسرار الإنتاج.
2. ربط النطاقات CNAME → `cname.vercel-dns.com`.
3. ضبط env على كل منتج: `BHD_OAUTH_CLIENT_ID/SECRET` و`AUTH_SECRET`.
