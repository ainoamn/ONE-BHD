# حالة ربط منتجات BHD — عزل صامت موحّد

> **آخر تحديث:** 29 أكتوبر 2026  
> **الهوية:** https://id.bhd-om.com  
> **التوثيق:** `BHD-ACCOUNT-ISOLATION.md` · `BHD-SILENT-ISOLATION-ROLLOUT.md`

## الأسلوب (كل المواقع)

- `?au=<sub>` + رموز لكل حساب في sessionStorage  
- `silentRebind` JSON بلا ملاحظات على التحديث  
- غطاء فارغ فقط عند تبديل صريح  
- الربط من: `id.bhd-om.com` (switch/me/catalog) + `/api/auth/bhd/rebind` محلياً

## SHAs بعد النشر

| المستودع | SHA | GitHub |
|---|---|---|
| ONE-BHD | `affcb7e` | [ONE-BHD](https://github.com/ainoamn/ONE-BHD) |
| BHD-HR | `9df36b5` | [BHD-HR](https://github.com/ainoamn/BHD-HR) |
| WAZEN | `9391b42` | [WAZEN](https://github.com/ainoamn/WAZEN) |
| bhd-om | `a360843` | [bhd-om](https://github.com/ainoamn/bhd-om) |
| hisaby | `4615005` | [hisaby](https://github.com/ainoamn/hisaby) |
| BHD-STOR | `15a70a0` | [BHD-STOR](https://github.com/ainoamn/BHD-STOR) |
| BHD-R | `8e200b21` | [BHD-R](https://github.com/ainoamn/BHD-R) |
| Nasab | `5e75a0a` | [Nasab](https://github.com/ainoamn/Nasab) |
| ainoamn-ain-oman-web | `2e67b62` | [ainoamn-ain-oman-web](https://github.com/ainoamn/ainoamn-ain-oman-web) |
| nextjs-boilerplate | `4fecd43` | [nextjs-boilerplate](https://github.com/ainoamn/nextjs-boilerplate) |

## نشر Vercel

| موقع | حالة |
|---|---|
| id.bhd-om.com (ONE-BHD) | نُشر |
| hr.bhd-om.com (BHD-HR) | نُشر |
| wazen | نُشر بعد إصلاح typecheck |
| bhd-om | نُشر |
| BHD-R (bhd-r-api) | نُشر |
| hisaby | نُشر |
| Nasab | نُشر |
| BHD-STOR | نُشر (frontend) |
| ain-oman-web | الكود مرفوع — البناء فشل لأخطاء قديمة في `contracts/*.tsx` (ليست من سلك العزل) |
| nextjs-boilerplate | قالب مرفوع |

