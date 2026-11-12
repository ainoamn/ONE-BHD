# حالة ربط منتجات BHD — عزل صامت موحّد

> **آخر تحديث:** 12 نوفمبر 2026  
> **الهوية:** https://id.bhd-om.com  
> **الكتالوج الحي:** https://id.bhd-om.com/api/bhd/catalog  
> **مرجع الكتالوج:** `docs/BHD-CATALOG-APPS-2026-11-12.md`

## الأسلوب (كل المواقع)

- `?au=<sub>` + رموز لكل حساب في sessionStorage  
- `silentRebind` JSON بلا ملاحظات على التحديث  
- غطاء فارغ فقط عند تبديل صريح  
- الربط من: `id.bhd-om.com` (switch/me/catalog) + `/api/auth/bhd/rebind` محلياً  
- شريط الأيقونات والفوتر من `GET /api/bhd/catalog` الحي

## كتالوج الأيقونات / الفوتر (كل مستودعات اللقطة)

account · portal (bhd-om) · wazen · hisaby · nasab · bhd-r · store · office · hr · legal · work · cars · hikaya · ain · boilerplate · ahhha

## مواقع السلك (12 نوفمبر 2026)

| المستودع | client_id | commit | نشر |
|---|---|---|---|
| ONE-BHD (الهوية/الكتالوج) | — | `3ccba98` | Ready → id.bhd-om.com |
| Legal-Practice-Management | `bhd-legal` | `c677a21` (+ إصلاح بناء TS) | legal-office-web |
| Business-Management | `bhd-work` | `b01c97c` | يحتاج ربط Vercel / دومين work.bhd-om.com |
| -BHD-Cars | `bhd-cars` | `0de50db` | Ready (bhd-cars) |
| hikaya | `bhd-hikaya` | `8c14a42` | Ready (hikaya) |

## متبقٍّ تشغيلي

1. أسرار OAuth لكل عميل من `/admin#clients` على Vercel/الدومين.  
2. CNAME: legal / work / cars / hikaya / ain / boilerplate / ahhha.  
3. مراجعة `AUTH_SECRET` و`BHD_OAUTH_CLIENT_*` على كل منتج.
