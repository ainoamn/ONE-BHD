# BHD Identity — سجل النشر والربط

## 2026-10-29 — Multi-product wire rollout

| البند | التفاصيل |
|---|---|
| الهوية | `id.bhd-om.com` — runtime + catalog + `bhd-identity.js` (rebind-first isolate) |
| مرجع العزل | `docs/BHD-ACCOUNT-ISOLATION.md` — BHD-HR §93 |
| ain-oman-web | سلك أدنى Pages Router + شريط كتالوج + `/api/auth/bhd/*` stubs |
| nextjs-boilerplate | قالب App Router BHD-wired (initial seed) |
| ONE-BHD portal | `logout` + `rebind` تحت `app/api/auth/bhd/` في v1.1.0 / v1.1.1 / GitHub-source |
| حالة المنتجات | `docs/BHD-PRODUCTS-WIRE-STATUS.md` |

**نشر Vercel (بوابة):** من جذر ONE-BHD — `npx vercel --prod --yes` (مجلد `BHD-Complete-Brand-and-Portal-v1.1.0`).
