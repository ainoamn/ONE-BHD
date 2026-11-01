# حالة ربط منتجات BHD — عزل صامت موحّد

> **آخر تحديث:** 1 نوفمبر 2026  
> **الهوية:** https://id.bhd-om.com  
> **التوثيق:** `BHD-ACCOUNT-ISOLATION.md` · `BHD-SILENT-ISOLATION-ROLLOUT.md` · `BHD-MULTI-TAB-STABILITY.md` · `BHD-MANAGE-ACCOUNT-AU.md`

## الأسلوب (كل المواقع)

- `?au=<sub>` + رموز لكل حساب في sessionStorage  
- `silentRebind` JSON بلا ملاحظات على التحديث  
- غطاء فارغ فقط عند تبديل صريح  
- الربط من: `id.bhd-om.com` (switch/me/catalog) + `/api/auth/bhd/rebind` محلياً  
- «إدارة الحساب» عبر `/auth/switch?sub=` ثم `/account?au=`

## SHAs بعد النشر (1 نوفمبر 2026)

| المستودع | SHA | ملاحظة |
|---|---|---|
| ONE-BHD | `d417c0f` | ربط `/account` بـ `?au=` + AccountAuGate |
| BHD-R | `db637839` | عزل تبويبات + رابط إدارة الحساب |
| BHD-HR | `39e8b2f` | استقرار تبويبات |
| WAZEN | `5fbea81` | استقرار تبويبات |
| bhd-om | `e62a95a` | استقرار تبويبات |
| hisaby | `dae3234` | استقرار تبويبات |
| BHD-STOR | `b9a5d9e` | استقرار تبويبات |
| Nasab | `24598f0` | استقرار تبويبات |
| ainoamn-ain-oman-web | `00981bd` | استقرار تبويبات |
| nextjs-boilerplate | `d750c78` | استقرار تبويبات |

## نشر Vercel

| مشروع | حالة آخر إنتاج معروف |
|---|---|
| one-bhd | Ready (`d417c0f`) |
| bhd-r-api | Ready (`db637839`) |
| bhd-hr · wazen · bhd-om · hisaby · nasab · bhdstor · bhd-stor-x7dc · frontend · nextjs-boilerplate · ain-oman-web | Ready |
