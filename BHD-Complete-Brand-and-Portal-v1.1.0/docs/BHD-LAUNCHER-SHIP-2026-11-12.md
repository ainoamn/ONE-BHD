# رفع ونشر وتطبيق محوّل BHD (نمط خمسات) — 12 نوفمبر 2026

> **الهوية:** https://id.bhd-om.com  
> **مواصفة الشكل:** https://id.bhd-om.com/docs/BHD-LAUNCHER-CHROME.md  
> **أصول حية:** `/bhd-launcher.css` · `/bhd-launcher.js` · `/bhd-identity.js` · `/api/bhd/catalog`

## المطلوب المطبَّق

- دخول موحّد (SSO) عبر الهوية  
- شريط أيقونات + فوتر من الكتالوج الحي  
- محوّل تطبيقات: صورة جوجل دائرية ثم شبكة 3×3  

## حالة النشر (هذا اليوم)

| المستودع | commit | نشر |
|---|---|---|
| ONE-BHD | `17e88e5` | Ready (id.bhd-om.com) |
| Legal-Practice-Management | `ec6b300` | Ready (legal-office-web) |
| Business-Management | `f71fefb` | Ready (business-management) |
| -BHD-Cars | `1e71115` | Ready (bhd-cars) |
| hikaya | `1da8bb3` | Ready (hikaya) |

## تثبيت سريع لأي موقع متبقٍ

```html
<link rel="stylesheet" href="https://id.bhd-om.com/bhd-launcher.css" />
<div data-bhd-launcher data-locale="ar"></div>
<script src="https://id.bhd-om.com/bhd-identity.js" defer></script>
<script src="https://id.bhd-om.com/bhd-launcher.js" defer></script>
```

أو مكوّن React `BhdAppSwitcher` بنفس ترتيب الصورة→الشبكة و`googleAvatarSrc`.

## تحقق

1. `GET /api/bhd/catalog` يعرض كل برامج اللقطة.  
2. بعد دخول جوجل تظهر الصورة الدائرية ثم شبكة التطبيقات.  
3. البلاطات 3 أعمدة من الكتالوج (بدون بلاطة الحساب داخل الشبكة).
