# ربط بوابة BHD بقاعدة Neon

> **لوحة Neon:** [console.neon.tech — org projects](https://console.neon.tech/app/org-broad-surf-16375800/projects)  
> **الموقع:** https://one-bhd.vercel.app  
> **الجداول:** `bhd_users` و`bhd_contacts` (مثل مستخدمي ودفتر عناوين حسابي)  
> **الهوية الموحّدة:** الاسم المعتمد لمشروع Neon هو `bhd-identity` — التفاصيل في [BHD-IDENTITY-SSO.md](BHD-IDENTITY-SSO.md)

---

## 1. إنشاء المشروع في Neon

1. افتح [مشاريع المنظمة](https://console.neon.tech/app/org-broad-surf-16375800/projects).
2. **New Project** → الاسم المقترح: `one-bhd` أو `bhd-portal`.
3. اختر منطقة قريبة (مثلاً Frankfurt / Singapore).
4. بعد الإنشاء: **Dashboard → Connection details**.
5. انسخ **Connection string** من نوع:
   - للإنتاج على Vercel: **Pooled** (غالبًا يحتوي `-pooler` في المضيف).
   - للـ `drizzle-kit push` محليًا: يمكن استخدام Direct أو Pooled.

الصيغة تشبه:

`postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`

---

## 2. المتغيرات

في `BHD-Complete-Brand-and-Portal-v1.1.0/.env.local` وفي **Vercel → one-bhd → Settings → Environment Variables**:

| المتغير | مطلوب | ملاحظة |
|---|---|---|
| `DATABASE_URL` | نعم | رابط Neon |
| `AUTH_SECRET` | نعم | `openssl rand -base64 48` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | لاحقًا | بعد الدومين |
| `GOOGLE_CLIENT_ID` | لاحقًا | نفس القيمة |

---

## 3. إنشاء الجداول

من مجلد النشر:

```bash
cd BHD-Complete-Brand-and-Portal-v1.1.0
# بعد وضع DATABASE_URL في .env.local
npx drizzle-kit push
```

هذا ينشئ:

- `bhd_users` — الحساب (إيميل، اسم مستخدم، كلمة مرور مشفّرة، Google ID، هاتف…)
- `bhd_contacts` — دفتر العناوين (`SELF` للملف الشخصي، و`PERSON`/`COMPANY` لجهات الاتصال)

---

## 4. التحقق

```bash
npm run dev
```

- افتح `/login` وأنشئ حسابًا.
- افتح `/api/health/identity` — يجب أن يظهر `"databaseOk": true`.

على Vercel: أضف المتغيرات ثم **Redeploy**، وشغّل `drizzle-kit push` مرة واحدة من جهازك ضد نفس `DATABASE_URL`.

---

## 5. ما الذي يعمل بعد الربط

- تسجيل بإيميل/اسم مستخدم + كلمة مرور
- حفظ بطاقة عنوان (هاتف، عنوان، مدينة، دولة…)
- Google يكتب في نفس جداول المستخدمين عند تفعيله
- الجلسة: كوكي `bhd_portal` موقّع بـ `AUTH_SECRET`
