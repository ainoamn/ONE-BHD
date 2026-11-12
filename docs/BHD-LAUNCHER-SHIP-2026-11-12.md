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
| ONE-BHD | `8a4ac4b`+ | Ready (id.bhd-om.com) |
| Legal-Practice-Management | `ec6b300` | Ready |
| Business-Management | `f71fefb` | Ready |
| -BHD-Cars | `1e71115` | Ready |
| hikaya | `1da8bb3` | Ready |
| WAZEN | `b2cbd90` | Ready |
| Nasab | `ff2bab1` | Ready (+ `.vercelignore` لأرشيف hikaya) |
| hisaby | `c87279c` (`launch/phase-1-build`) | Ready |
| BHD-R | `c757a939` | Ready |
| BHD-STOR | `9c3c287` | كود مرفوع — ربط Vercel مفقود محلياً |
| BHD-HR-live | `1464693` | Ready |
| ain-oman-web | `6f6bbb3` | Ready |
| nextjs-boilerplate | `23eb74c` | Ready |
| bhd-om | `3e3635d` | Ready |

## تثبيت سريع

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
