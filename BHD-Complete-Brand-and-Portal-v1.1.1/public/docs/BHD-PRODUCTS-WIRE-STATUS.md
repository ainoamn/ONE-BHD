# حالة ربط منتجات BHD بالهوية الحيّة

> **آخر تحديث:** 29 أكتوبر 2026 (بعد §98–§99 — عزل صامت موحّد على كل المواقع)  
> **الهوية:** https://id.bhd-om.com  
> **مرجع العزل:** `BHD-ACCOUNT-ISOLATION.md` + `BHD-SILENT-ISOLATION-ROLLOUT.md`

## أين يعيش الإصلاح؟

| الطبقة | ماذا؟ |
|---|---|
| **ONE-BHD / id.bhd-om.com** | `/api/auth/switch` + `me` + `rebind` JSON + `?au=` |
| **كل منتج** | `silentRebind` / `BhdPrivacyGate` / `BhdSilentSso` من Bearer النافذة |

## المستودعات

| المستودع | سلك العزل الصامت | من أين الربط |
|---|---|---|
| ONE-BHD | نعم (§99) | هوية أم — id.bhd-om.com |
| BHD-HR | نعم (§97–98) | rebind محلي + id.bhd-om.com |
| WAZEN | نعم | نفس الأسلوب |
| hisaby | نعم | frontend + API proxy |
| BHD-STOR | نعم | frontend |
| BHD-R | نعم | apps/web |
| Nasab | نعم | Express rebind |
| bhd-om | نعم | Next app |
| ainoamn-ain-oman-web | نعم | Pages/_app إن وُجد |
| nextjs-boilerplate | نعم | قالب |

## تحقق

1. F5 → لا رسالة عزل.
2. تبديل حساب → بيانات الحساب الجديد فقط.
3. `?au=` يبقى مربوطاً بالتبويب.
