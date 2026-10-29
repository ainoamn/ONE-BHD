"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { BHD_ACCOUNT_CHANGED, SessionMenu } from "../components/auth/SessionMenu";
import { SiteFooter } from "../components/SiteFooter";
import { BhdAppIcon } from "../components/bhd/BhdAppIcon";
import { NATIONALITIES } from "../lib/auth/nationalities";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { identityFetch } from "../lib/identity/client";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  nationality: string | null;
  nameAr: string | null;
  nameEn: string | null;
  civilId: string | null;
  civilIdExpires: string | null;
  passportNumber: string | null;
  passportExpires: string | null;
  accountKind: "person" | "company";
  companyNameAr: string | null;
  companyNameEn: string | null;
  crNumber: string | null;
  crExpires: string | null;
  taxId: string | null;
  picture: string | null;
  emailVerified: boolean;
  googleLinked: boolean;
  facebookLinked: boolean;
  hasPassword: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
};

type AccountContact = {
  phone2: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  hometown: string | null;
  country: string | null;
  zipCode: string | null;
  crNumber?: string | null;
  taxId?: string | null;
};

type LinkedSite = {
  id: string;
  nameAr: string;
  nameEn: string;
  origin: string;
  enabled: boolean;
  status: "linked" | "available" | "soon";
};

type AccountFileMeta = { id: string; filename: string; kind: string };

type AccountPayload = {
  user: AccountUser;
  contact: AccountContact | null;
  files?: { civilIdFile: AccountFileMeta | null; passportFile: AccountFileMeta | null };
  sites: LinkedSite[];
  subscriptions: Array<{ id: string; nameAr: string; plan: string; status: string }>;
  message?: string;
};

const STATUS_LABEL: Record<LinkedSite["status"], string> = {
  linked: "مرتبط بحسابك",
  available: "متاح بحساب BHD",
  soon: "قريبًا",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("ar-OM", { dateStyle: "medium" });
  } catch {
    return value;
  }
}

export function AccountConsole() {
  const [data, setData] = useState<AccountPayload | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("OM");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [civilId, setCivilId] = useState("");
  const [civilIdExpires, setCivilIdExpires] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpires, setPassportExpires] = useState("");
  const [civilIdFile, setCivilIdFile] = useState<AccountFileMeta | null>(null);
  const [passportFile, setPassportFile] = useState<AccountFileMeta | null>(null);
  const [accountKind, setAccountKind] = useState<"person" | "company">("person");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [crExpires, setCrExpires] = useState("");
  const [taxId, setTaxId] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploading, setUploading] = useState("");
  const [phone2, setPhone2] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hometown, setHometown] = useState("");
  const [country, setCountry] = useState("OM");
  const [zipCode, setZipCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function applyPayload(payload: AccountPayload) {
    setData(payload);
    setName(payload.user.name || "");
    setUsername(payload.user.username || "");
    setPhone(payload.user.phone || "");
    setGender(payload.user.gender || "");
    setBirthDate(payload.user.birthDate || "");
    setNationality(payload.user.nationality || "OM");
    setNameAr(payload.user.nameAr || "");
    setNameEn(payload.user.nameEn || "");
    setCivilId(payload.user.civilId || "");
    setCivilIdExpires(payload.user.civilIdExpires || "");
    setPassportNumber(payload.user.passportNumber || "");
    setPassportExpires(payload.user.passportExpires || "");
    setCivilIdFile(payload.files?.civilIdFile || null);
    setPassportFile(payload.files?.passportFile || null);
    setAccountKind(payload.user.accountKind === "company" ? "company" : "person");
    setCompanyNameAr(payload.user.companyNameAr || "");
    setCompanyNameEn(payload.user.companyNameEn || "");
    setCrNumber(payload.user.crNumber || payload.contact?.crNumber || "");
    setCrExpires(payload.user.crExpires || "");
    setTaxId(payload.user.taxId || payload.contact?.taxId || "");
    setPhone2(payload.contact?.phone2 || "");
    setWhatsapp(payload.contact?.whatsapp || "");
    setAddress(payload.contact?.address || "");
    setCity(payload.contact?.city || "");
    setHometown(payload.contact?.hometown || "");
    setCountry(payload.contact?.country || "OM");
    setZipCode(payload.contact?.zipCode || "");
  }

  useEffect(() => {
    let cancelled = false;
    function load() {
      identityFetch("/api/account")
        .then(async (response) => {
          const payload = (await response.json()) as AccountPayload;
          if (!response.ok) throw new Error(payload.message || "تعذّر تحميل الحساب.");
          if (!cancelled) applyPayload(payload);
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    load();
    window.addEventListener(BHD_ACCOUNT_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(BHD_ACCOUNT_CHANGED, load);
    };
  }, []);

  useEffect(() => {
    if (!data?.user) return;
    const kind = data.user.accountKind === "company" ? "company" : "person";
    if (kind === "company") {
      if (data.user.companyNameAr && data.user.companyNameEn) return;
      const seed = data.user.companyNameAr || data.user.companyNameEn || data.user.name;
      if (seed) void translateName(seed, true);
      return;
    }
    if (data.user.nameAr && data.user.nameEn) return;
    const seed = data.user.nameAr || data.user.nameEn || data.user.name;
    if (seed) void translateName(seed, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.id]);

  async function translateName(source?: string, silent = false) {
    const seed = (source || nameAr || nameEn || companyNameAr || companyNameEn || name).trim();
    if (!seed) {
      if (!silent) setError("اكتب الاسم في أحد الحقلين ثم اضغط الترجمة.");
      return;
    }
    setTranslating(true);
    if (!silent) setError("");
    try {
      const response = await identityFetch("/api/account/translate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: seed }),
      });
      const payload = (await response.json()) as { ar?: string; en?: string; message?: string };
      if (!response.ok || !payload.ar || !payload.en) {
        throw new Error(payload.message || "تعذّرت الترجمة الآلية.");
      }
      if (accountKind === "company") {
        setCompanyNameAr(payload.ar);
        setCompanyNameEn(payload.en);
        setNameAr(payload.ar);
        setNameEn(payload.en);
        setName(payload.ar);
      } else {
        setNameAr(payload.ar);
        setNameEn(payload.en);
        setName(payload.ar);
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "تعذّرت الترجمة الآلية. أعد المحاولة.");
    } finally {
      setTranslating(false);
    }
  }

  async function uploadFile(kind: "civil_id" | "passport", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    setError("");
    try {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", file);
      const response = await identityFetch("/api/account/file", { method: "POST", body: form });
      const payload = (await response.json()) as AccountFileMeta & { message?: string };
      if (!response.ok) throw new Error(payload.message || "تعذّر رفع المرفق.");
      if (kind === "civil_id") setCivilIdFile(payload);
      else setPassportFile(payload);
      setSaved("تم رفع المرفق. احفظ بقية البيانات.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر رفع المرفق.");
    } finally {
      setUploading("");
    }
  }

  const missing = useMemo(
    () =>
      (accountKind === "company"
        ? [
            { key: "companyNameAr", label: "اسم الشركة بالعربية", value: companyNameAr },
            { key: "companyNameEn", label: "اسم الشركة بالإنجليزية", value: companyNameEn },
            { key: "nameAr", label: "اسم المفوض بالعربية", value: nameAr },
            { key: "nameEn", label: "اسم المفوض بالإنجليزية", value: nameEn },
            { key: "crNumber", label: "السجل التجاري", value: crNumber },
            { key: "phone", label: "رقم الهاتف", value: phone },
          ]
        : [
            { key: "nameAr", label: "الاسم بالعربية", value: nameAr },
            { key: "nameEn", label: "الاسم بالإنجليزية", value: nameEn },
            { key: "phone", label: "رقم الهاتف", value: phone },
            { key: "nationality", label: "الجنسية", value: nationality },
            { key: "gender", label: "الجنس", value: gender },
            { key: "birthDate", label: "تاريخ الميلاد", value: birthDate },
          ]
      ).filter((item) => !item.value.trim()),
    [accountKind, companyNameAr, companyNameEn, crNumber, nameAr, nameEn, phone, nationality, gender, birthDate],
  );

  function fieldTone(value: string) {
    if (value.trim()) return attempted ? "is-ok" : "";
    return attempted ? "is-missing" : "";
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setSaving(true);
    setError("");
    setSaved("");
    if (missing.length) {
      setError(`نواقص يجب تعبئتها: ${missing.map((item) => item.label).join("، ")}`);
      setSaving(false);
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      setSaving(false);
      return;
    }
    if (data?.user && !data.user.hasPassword && newPassword && newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      setSaving(false);
      return;
    }
    try {
      const response = await identityFetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameAr || companyNameAr || name,
          nameAr,
          nameEn,
          accountKind,
          companyNameAr,
          companyNameEn,
          crNumber,
          crExpires,
          taxId,
          username: username || null,
          phone: phone || null,
          gender: gender || null,
          birthDate: birthDate || null,
          nationality: nationality || null,
          civilId,
          civilIdExpires,
          passportNumber,
          passportExpires,
          phone2: phone2 || null,
          whatsapp: whatsapp || null,
          address: address || null,
          city: city || null,
          hometown: hometown || null,
          country: country || "OM",
          zipCode: zipCode || null,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const payload = (await response.json()) as AccountPayload;
      if (!response.ok) throw new Error(payload.message || "تعذّر حفظ التعديلات.");
      applyPayload(payload);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(
        newPassword
          ? "تم حفظ كلمة المرور. يمكنك الدخول لاحقاً بالبريد وكلمة المرور أو عبر فيسبوك/جوجل."
          : "تم حفظ بياناتك. ستظهر في بقية مواقع BHD عند الدخول التالي.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر حفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  }

  const user = data?.user;
  const initial = (user?.name || "B").trim().slice(0, 1);

  return (
    <div className="account-screen" dir="rtl">
      <div className="flag-line" aria-hidden="true" />
      <header className="account-topbar">
        <InstantLink className="brand" href="/" aria-label="العودة إلى الرئيسية">
          <BrandLogo className="header-official-logo" />
        </InstantLink>
        <SessionMenu signInLabel="دخول" />
      </header>

      <main className="account-main" id="main-content">
        <p className="section-kicker">حساب BHD الموحّد</p>
        <h1>بياناتك. مواقعك. اشتراكاتك.</h1>
        <p className="account-lead">
          عدّل ملفك هنا مرة واحدة. الاسم بالعربية والإنجليزية والهاتف والجنسية تنتقل إلى وازن وحسابي وبقية المواقع عبر هوية BHD، دون مشاركة قواعد بياناتها.
        </p>

        {loading ? <p className="account-status">جاري تحميل الحساب…</p> : null}
        {error ? <p className="account-status is-error">{error}</p> : null}
        {saved ? <p className="account-status is-ok">{saved}</p> : null}
        {attempted && missing.length ? (
          <div className="account-missing" role="alert">
            <strong>هذه الحقول ناقصة:</strong>
            <ul>
              {missing.map((item) => (
                <li key={item.key}>{item.label}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {user ? (
          <>
            <section className="account-hero-card">
              {user.picture ? (
                <img src={user.picture} alt="" width={72} height={72} />
              ) : (
                <span className="account-hero-initial">{initial}</span>
              )}
              <div>
                <strong>{user.companyNameAr || user.name}</strong>
                {user.accountKind === "company" ? <small>حساب شركة</small> : null}
                <small>{user.email}</small>
                <div className="account-chips">
                  {user.emailVerified ? <span>بريد موثّق</span> : <span>بريد غير موثّق</span>}
                  {user.googleLinked ? <span>مرتبط بجوجل</span> : null}
                  {user.facebookLinked ? <span>مرتبط بفيسبوك</span> : null}
                  {user.hasPassword ? <span>دخول بكلمة مرور</span> : null}
                </div>
                {!user.emailVerified ? (
                  <div className="account-verify-banner">
                    <p>وازن والمنتجات الأخرى ترفض الدخول حتى يُؤكَّد البريد. أرسلنا رابطاً أو اطلب إرسالاً جديداً.</p>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={resending}
                      onClick={async () => {
                        setResending(true);
                        setError("");
                        setSaved("");
                        try {
                          const response = await fetch("/api/auth/resend-verification", { method: "POST" });
                          const payload = (await response.json()) as { message?: string };
                          if (!response.ok) {
                            setError(payload.message || "تعذّر إرسال رابط التأكيد.");
                            return;
                          }
                          setSaved(payload.message || "أُرسل رابط التأكيد.");
                        } catch {
                          setError("تعذّر الاتصال بالخادم.");
                        } finally {
                          setResending(false);
                        }
                      }}
                    >
                      {resending ? "جاري الإرسال…" : "إرسال رابط تأكيد البريد"}
                    </button>
                  </div>
                ) : null}
              </div>
              <dl>
                <div>
                  <dt>معرّف الحساب</dt>
                  <dd>{user.id}</dd>
                </div>
                <div>
                  <dt>أُنشئ</dt>
                  <dd>{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt>آخر دخول</dt>
                  <dd>{formatDate(user.lastLoginAt)}</dd>
                </div>
                <div>
                  <dt>الجنس</dt>
                  <dd>{user.gender === "male" ? "ذكر" : user.gender === "female" ? "أنثى" : user.gender || "—"}</dd>
                </div>
                <div>
                  <dt>تاريخ الميلاد</dt>
                  <dd>{user.birthDate || "—"}</dd>
                </div>
                <div>
                  <dt>الجنسية</dt>
                  <dd>{NATIONALITIES.find((item) => item.code === user.nationality)?.ar || user.nationality || "—"}</dd>
                </div>
              </dl>
            </section>

            <div className="account-grid">
              <form className="account-panel" onSubmit={onSubmit}>
                <div className="account-panel-head">
                  <h2>تعديل البيانات</h2>
                  <p>
                    {accountKind === "company"
                      ? "حساب شركة: اسم الشركة بالعربي والإنجليزي والسجل التجاري والهاتف واسم المفوض إلزامية."
                      : "حساب فرد: الاسم بالعربية والإنجليزية والهاتف والجنسية والجنس وتاريخ الميلاد إلزامية. البطاقة والجواز اختيارية."}
                  </p>
                </div>
                <div className="account-fields">
                  {accountKind === "company" ? (
                    <>
                      <label className={fieldTone(companyNameAr)}>
                        اسم الشركة بالعربية *
                        <input
                          value={companyNameAr}
                          onChange={(event) => {
                            setCompanyNameAr(event.target.value);
                            setName(event.target.value);
                          }}
                        />
                      </label>
                      <label className={fieldTone(companyNameEn)}>
                        اسم الشركة بالإنجليزية *
                        <input dir="ltr" value={companyNameEn} onChange={(event) => setCompanyNameEn(event.target.value)} />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={fieldTone(nameAr)}>
                        الاسم بالعربية *
                        <input
                          value={nameAr}
                          onChange={(event) => {
                            setNameAr(event.target.value);
                            setName(event.target.value);
                          }}
                        />
                      </label>
                      <label className={fieldTone(nameEn)}>
                        الاسم بالإنجليزية *
                        <input dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
                      </label>
                    </>
                  )}
                  <div className="account-translate is-wide">
                    <button type="button" className="outline-button" disabled={translating} onClick={() => void translateName()}>
                      {translating ? "جاري الترجمة…" : "ترجمة بالذكاء الاصطناعي"}
                    </button>
                    <small>نفس أسلوب BHD R: اكتب أحد الحقلين ثم ترجم. يمكنك التصحيح يدوياً.</small>
                  </div>
                  {accountKind === "company" ? (
                    <>
                      <label className={fieldTone(nameAr)}>
                        اسم المفوض بالعربية *
                        <input value={nameAr} onChange={(event) => setNameAr(event.target.value)} />
                      </label>
                      <label className={fieldTone(nameEn)}>
                        اسم المفوض بالإنجليزية *
                        <input dir="ltr" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
                      </label>
                      <label className={fieldTone(crNumber)}>
                        السجل التجاري *
                        <input value={crNumber} onChange={(event) => setCrNumber(event.target.value)} />
                      </label>
                      <label>
                        تاريخ انتهاء السجل
                        <input type="date" value={crExpires} onChange={(event) => setCrExpires(event.target.value)} />
                      </label>
                      <label>
                        الرقم الضريبي
                        <input value={taxId} onChange={(event) => setTaxId(event.target.value)} />
                      </label>
                    </>
                  ) : null}
                  <label>
                    اسم المستخدم
                    <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="اختياري" />
                  </label>
                  <label>
                    البريد
                    <input value={user.email} readOnly />
                  </label>
                  <label className={fieldTone(phone)}>
                    رقم الهاتف *
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="مثال: 9689xxxxxxx" />
                  </label>
                  <label>
                    رقم هاتف بديل
                    <input value={phone2} onChange={(event) => setPhone2(event.target.value)} />
                  </label>
                  {accountKind === "person" ? (
                  <>
                  <label className={fieldTone(nationality)}>
                    الجنسية *
                    <select value={nationality} onChange={(event) => setNationality(event.target.value)}>
                      {NATIONALITIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.ar}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={fieldTone(gender)}>
                    الجنس *
                    <select value={gender} onChange={(event) => setGender(event.target.value)}>
                      <option value="">اختر</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </label>
                  <label className={fieldTone(birthDate)}>
                    تاريخ الميلاد *
                    <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                  </label>
                  <label>
                    الرقم المدني
                    <input value={civilId} onChange={(event) => setCivilId(event.target.value)} placeholder="اختياري" />
                  </label>
                  <label>
                    تاريخ انتهاء البطاقة
                    <input type="date" value={civilIdExpires} onChange={(event) => setCivilIdExpires(event.target.value)} />
                  </label>
                  <div className="account-upload is-wide">
                    <span>مرفق نسخة البطاقة المدنية</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(event) => void uploadFile("civil_id", event.target.files?.[0])}
                    />
                    {uploading === "civil_id" ? <small>جاري الرفع…</small> : null}
                    {civilIdFile ? (
                      <a href="/api/account/file?kind=civil_id" target="_blank" rel="noreferrer">
                        {civilIdFile.filename}
                      </a>
                    ) : (
                      <small>صورة أو PDF حتى 4 ميغابايت.</small>
                    )}
                  </div>
                  <label>
                    رقم جواز السفر
                    <input value={passportNumber} onChange={(event) => setPassportNumber(event.target.value)} placeholder="اختياري" />
                  </label>
                  <label>
                    تاريخ انتهاء الجواز
                    <input type="date" value={passportExpires} onChange={(event) => setPassportExpires(event.target.value)} />
                  </label>
                  <div className="account-upload is-wide">
                    <span>مرفق نسخة الجواز</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(event) => void uploadFile("passport", event.target.files?.[0])}
                    />
                    {uploading === "passport" ? <small>جاري الرفع…</small> : null}
                    {passportFile ? (
                      <a href="/api/account/file?kind=passport" target="_blank" rel="noreferrer">
                        {passportFile.filename}
                      </a>
                    ) : (
                      <small>صورة أو PDF حتى 4 ميغابايت.</small>
                    )}
                  </div>
                  </>
                  ) : null}
                  <label>
                    واتساب
                    <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
                  </label>
                  <label className="is-wide">
                    العنوان
                    <input value={address} onChange={(event) => setAddress(event.target.value)} />
                  </label>
                  <label>
                    المدينة / مكان الإقامة
                    <input value={city} onChange={(event) => setCity(event.target.value)} />
                  </label>
                  <label>
                    مسقط الرأس
                    <input value={hometown} onChange={(event) => setHometown(event.target.value)} />
                  </label>
                  <label>
                    الدولة
                    <input value={country} onChange={(event) => setCountry(event.target.value)} />
                  </label>
                  <label>
                    الرمز البريدي
                    <input value={zipCode} onChange={(event) => setZipCode(event.target.value)} />
                  </label>
                  {user.hasPassword ? (
                    <>
                      <label>
                        كلمة المرور الحالية
                        <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
                      </label>
                      <label>
                        كلمة مرور جديدة
                        <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
                      </label>
                      <label>
                        تأكيد كلمة المرور الجديدة
                        <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
                      </label>
                    </>
                  ) : (
                    <>
                      <label>
                        إنشاء كلمة مرور
                        <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="8 أحرف على الأقل" />
                      </label>
                      <label>
                        تأكيد كلمة المرور
                        <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
                      </label>
                    </>
                  )}
                </div>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "جاري الحفظ…" : "حفظ التعديلات"}
                </button>
              </form>

              <div className="account-side">
                <section className="account-panel">
                  <div className="account-panel-head">
                    <h2>المواقع المرتبطة</h2>
                    <p>نفس حساب BHD يفتح هذه المواقع. بيانات العمل تبقى داخل كل موقع.</p>
                  </div>
                  <ul className="account-sites">
                    {(data.sites || []).map((site) => (
                      <li key={site.id}>
                        <BhdAppIcon id={site.id} title={site.nameAr} />
                        <div>
                          <strong>{site.nameAr}</strong>
                          <small>{site.origin.replace(/^https:\/\//, "") || STATUS_LABEL[site.status]}</small>
                        </div>
                        <span className={`account-site-status is-${site.status}`}>{STATUS_LABEL[site.status]}</span>
                        {site.enabled && site.origin ? (
                          <a href={site.origin} rel="noreferrer">فتح</a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="account-panel">
                  <div className="account-panel-head">
                    <h2>الاشتراكات</h2>
                    <p>تظهر هنا عندما يشترك حسابك في منتج مثل حسابي أو المتجر.</p>
                  </div>
                  {data.subscriptions?.length ? (
                    <ul className="account-subs">
                      {data.subscriptions.map((sub) => (
                        <li key={sub.id}>
                          <strong>{sub.nameAr}</strong>
                          <small>{sub.plan} · {sub.status}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="account-empty">اشتراكات وفواتير كل برنامج تبقى داخله ولا تُعرض هنا. هنا بيانات حساب BHD وارتباطك بالمواقع فقط. لا توجد اشتراكات هوية مسجّلة حتى الآن.</p>
                  )}
                </section>
              </div>
            </div>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
