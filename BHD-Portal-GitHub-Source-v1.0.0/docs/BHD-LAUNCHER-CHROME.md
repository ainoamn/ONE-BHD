# محوّل تطبيقات BHD — الشكل والتثبيت (نمط خمسات/حسوب)

> **تاريخ:** 12 نوفمبر 2026  
> **المرجع البصري:** شبكة تطبيقات حسوب على خمسات + صورة حساب جوجل دائرية في الشريط العلوي  
> **المصدر الحي:** https://id.bhd-om.com

## الشكل الموحّد

1. **صورة الحساب:** دائرة 32px، `object-fit: cover`، `referrerPolicy="no-referrer"`، تُجلب من مطالبة الهوية `picture` (غالباً `googleusercontent.com` بحجم `s96`). إن تعذّرت تُعرض الحرف الأول.
2. **زر الشبكة:** 9 نقاط 3×3 بجانب الصورة (ترتيب: الصورة ثم الشبكة — كخمسات).
3. **لوحة التطبيقات:** بطاقة بيضاء، ظل خفيف، شبكة **3 أعمدة**، كل بلاطة أيقونة مربعة مستديرة 48px + اسم عربي مختصر.
4. **المصدر:** `GET https://id.bhd-om.com/api/bhd/catalog` (لا قوائم ثابتة في المنتجات).
5. **الأداء:** سكربت واحد من الهوية، `preconnect` لأصول البرامج، صورة جوجل مضغوطة، كتالوج يُحدَّث عبر حدث `bhd-catalog`.

## التثبيت السريع (أي موقع)

```html
<link rel="stylesheet" href="https://id.bhd-om.com/bhd-launcher.css" />
<div data-bhd-launcher data-locale="ar"></div>
<script src="https://id.bhd-om.com/bhd-identity.js" defer></script>
<script src="https://id.bhd-om.com/bhd-launcher.js" defer></script>
```

أو في React/Next: مركّب `BhdAppSwitcher` + أنماط `bhd-switcher-*` (نفس الشكل).

## ملفات المصدر على الهوية

| ملف | دور |
|---|---|
| `/bhd-launcher.css` | شكل الشريط واللوحة |
| `/bhd-launcher.js` | تركيب `[data-bhd-launcher]` |
| `/bhd-identity.js` | `me()` / `catalog()` / عزل الحساب |
| `app/components/bhd/BhdAppSwitcher.tsx` | محوّل React على بوابة الهوية |

## ما تغيّر في كل موقع (12 نوفمبر 2026)

| الموقع | التغيير |
|---|---|
| **ONE-BHD / id.bhd-om.com** | محوّل مرتّب (صورة→شبكة)، صورة جوجل مضغوطة، نشر `bhd-launcher.js/css`، توثيق الشكل |
| **Legal-Practice-Management** | كان فيه `BhdAppSwitcher`؛ يُزامَن ترتيب الصورة/الشبكة + الأنماط مع المواصفة |
| **Business-Management** | شريط رأس + فوتر كتالوج + `BhdAppSwitcher` في مساحة العمل؛ يُزامَن الشكل |
| **-BHD-Cars** | إضافة نقطة تركيب `data-bhd-launcher` في الهيدر + سكربتات الهوية |
| **hikaya** | إضافة نقطة تركيب في `header-actions` + سكربتات الهوية |
| **بقية البرامج (وازن، حسابي، نسب، …)** | تستهلك الكتالوج الحي؛ يُفضَّل تركيب `data-bhd-launcher` أو `BhdAppSwitcher` بنفس المواصفة |

## تحقق يدوي

1. ادخل بحساب جوجل على الهوية → الصورة الدائرية تظهر في الرأس.  
2. افتح الشبكة → بلاطات 3×3 من الكتالوج الحي.  
3. نفس الشكل على Cars / Hikaya / Legal / Business بعد النشر.
