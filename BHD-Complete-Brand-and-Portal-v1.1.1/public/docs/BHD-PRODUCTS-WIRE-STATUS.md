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
| ONE-BHD | `1e1f9c1` | [ONE-BHD](https://github.com/ainoamn/ONE-BHD) |
| BHD-HR | `9df36b5` | [BHD-HR](https://github.com/ainoamn/BHD-HR) |
| WAZEN | `9391b42` | [WAZEN](https://github.com/ainoamn/WAZEN) |
| bhd-om | `a360843` | [bhd-om](https://github.com/ainoamn/bhd-om) |
| hisaby | `4615005` | [hisaby](https://github.com/ainoamn/hisaby) |
| BHD-STOR | `15a70a0` | [BHD-STOR](https://github.com/ainoamn/BHD-STOR) |
| BHD-R | `8e200b21` | [BHD-R](https://github.com/ainoamn/BHD-R) |
| Nasab | `5e75a0a` | [Nasab](https://github.com/ainoamn/Nasab) |
| ainoamn-ain-oman-web | `bca76ac` | [ainoamn-ain-oman-web](https://github.com/ainoamn/ainoamn-ain-oman-web) |
| nextjs-boilerplate | `a047410` | [nextjs-boilerplate](https://github.com/ainoamn/nextjs-boilerplate) |

## نشر Vercel (آخر إنتاج — الكل Ready)

| مشروع Vercel | حالة |
|---|---|
| one-bhd | Ready |
| bhd-hr | Ready |
| wazen | Ready |
| bhd-om | Ready |
| bhd-r-api | Ready |
| hisaby | Ready |
| nasab | Ready |
| bhdstor | Ready |
| bhd-stor-x7dc | Ready |
| frontend | Ready |
| nextjs-boilerplate | Ready |
| ain-oman-web | Ready (`bca76ac`) |

## إصلاحات ain-oman-web حتى Ready

1. إزالة `commandForIgnoringBuildStep` التالف (`echo …; no custom …`) من إعدادات المشروع عبر API.
2. عزل صفحات المسودة/الاختبار (`*.tsx.draft`) التي كانت تكسر الـ prerender.
3. fallback آمن أثناء الـ SSG لـ `useI18n` / `useCurrency` وباقي سياقـات الـ throw.
4. ترقية `next` إلى `15.4.11` لتجاوز بوابة CVE في Vercel.
