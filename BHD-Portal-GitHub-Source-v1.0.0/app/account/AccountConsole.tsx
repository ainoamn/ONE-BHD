"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { SessionMenu } from "../components/auth/SessionMenu";
import { SiteFooter } from "../components/SiteFooter";
import { BhdAppIcon } from "../components/bhd/BhdAppIcon";
import { FormEvent, useEffect, useState } from "react";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
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
};

type LinkedSite = {
  id: string;
  nameAr: string;
  nameEn: string;
  origin: string;
  enabled: boolean;
  status: "linked" | "available" | "soon";
};

type AccountPayload = {
  user: AccountUser;
  contact: AccountContact | null;
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

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
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
    fetch("/api/account", { cache: "no-store" })
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
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
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
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: username || null,
          phone: phone || null,
          gender: gender || null,
          birthDate: birthDate || null,
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
          عدّل ملفك هنا مرة واحدة. الاسم والهاتف وصورة الحساب تنتقل إلى وازن وحسابي وبقية المواقع عبر هوية BHD، دون مشاركة قواعد بياناتها.
        </p>

        {loading ? <p className="account-status">جاري تحميل الحساب…</p> : null}
        {error ? <p className="account-status is-error">{error}</p> : null}
        {saved ? <p className="account-status is-ok">{saved}</p> : null}

        {user ? (
          <>
            <section className="account-hero-card">
              {user.picture ? (
                <img src={user.picture} alt="" width={72} height={72} />
              ) : (
                <span className="account-hero-initial">{initial}</span>
              )}
              <div>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
                <div className="account-chips">
                  {user.emailVerified ? <span>بريد موثّق</span> : <span>بريد غير موثّق</span>}
                  {user.googleLinked ? <span>مرتبط بجوجل</span> : null}
                  {user.facebookLinked ? <span>مرتبط بفيسبوك</span> : null}
                  {user.hasPassword ? <span>دخول بكلمة مرور</span> : null}
                </div>
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
              </dl>
            </section>

            <div className="account-grid">
              <form className="account-panel" onSubmit={onSubmit}>
                <div className="account-panel-head">
                  <h2>تعديل البيانات</h2>
                  <p>البريد ثابت لأنه مفتاح الدخول. إن دخلت بفيسبوك أو جوجل يمكنك هنا إنشاء كلمة مرور للمرات القادمة. رقم الهاتف لا يأتي من فيسبوك.</p>
                </div>
                <div className="account-fields">
                  <label>
                    الاسم الكامل
                    <input value={name} onChange={(event) => setName(event.target.value)} required />
                  </label>
                  <label>
                    اسم المستخدم
                    <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="اختياري" />
                  </label>
                  <label>
                    البريد
                    <input value={user.email} readOnly />
                  </label>
                  <label>
                    الهاتف
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="فيسبوك لا يرسل الرقم — أدخله هنا" />
                  </label>
                  <label>
                    الجنس
                    <select value={gender} onChange={(event) => setGender(event.target.value)}>
                      <option value="">غير محدد</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </label>
                  <label>
                    تاريخ الميلاد
                    <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                  </label>
                  <label>
                    هاتف إضافي
                    <input value={phone2} onChange={(event) => setPhone2(event.target.value)} />
                  </label>
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
