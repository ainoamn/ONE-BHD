"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { FacebookSignInButton } from "../components/auth/FacebookSignInButton";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { BhdAppIcon } from "../components/bhd/BhdAppIcon";
import { BHD_APPS } from "../lib/bhd/apps";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Mode = "login" | "register" | "forgot";
type Lang = "ar" | "en";

const COPY = {
  ar: {
    kicker: "بوابة BHD",
    title: "من هنا تبدأ الخطوة نحو أحلام أكبر",
    brand: "بن حمود للتطوير",
    leadBefore: "سجّل دخولك إلى المنظومة الرقمية لـ ",
    leadAfter: "، واستمتع بوصول موحّد إلى جميع خدمات ومنصات BHD من خلال هوية رقمية واحدة.",
    highlight: "بوابة واحدة تجمع أعمالك، خدماتك، ومشاريعك في مكان واحد.",
    slogan: "Build Higher Dreams",
    promiseBefore: "مع ",
    promiseAfter: "، تبدأ الأحلام وتكبر.",
    login: "دخول",
    register: "إنشاء حساب",
    identifier: "البريد أو اسم المستخدم",
    password: "كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
    forgotTitle: "إعادة تعيين كلمة المرور",
    forgotLead: "أدخل بريدك أو اسم المستخدم وسنرسل رابط التعيين إن وُجد الحساب.",
    forgotSubmit: "إرسال رابط إعادة التعيين",
    backToLogin: "العودة لتسجيل الدخول",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    username: "اسم المستخدم (اختياري)",
    phone: "رقم الهاتف",
    more: "تفاصيل إضافية",
    hide: "إخفاء التفاصيل",
    phone2: "هاتف إضافي",
    whatsapp: "واتساب",
    address: "العنوان",
    city: "المدينة",
    zip: "الرمز البريدي",
    country: "الدولة",
    submitLogin: "دخول",
    submitRegister: "إنشاء الحساب",
    loading: "جاري المعالجة…",
    or: "أو الدخول عبر",
    google: "الدخول بجوجل",
    facebook: "الدخول بفيسبوك",
    whatsappSoon: "واتساب قريباً",
    footnote: "بالدخول فإنك توافق على",
    privacy: "الخصوصية",
    terms: "والشروط",
    apps: "برامج المجموعة",
    alreadyTitle: "جلسة نشطة حالياً",
    alreadyBody:
      "أنت مسجّل الدخول الآن بهذا الحساب. يمكنك المتابعة به، أو الخروج ثم الدخول بحساب BHD آخر.",
    continueAccount: "المتابعة بهذا الحساب",
    switchOut: "خروج والدخول بحساب آخر",
    switchTitle: "تبديل حساب BHD",
    switchBody:
      "الجلسة الحالية مرتبطة بحساب مختلف عن البيانات التي أدخلتها. اختر المتابعة بالجلسة النشطة، أو أنهِها للدخول بالحساب الجديد.",
    continueSession: "المتابعة بالجلسة الحالية",
    lang: "English",
    fail: "تعذّر إكمال العملية.",
    network: "تعذّر الاتصال بالخادم.",
  },
  en: {
    kicker: "BHD Gateway",
    title: "This is the first step toward bigger dreams",
    brand: "Bin Hamood Development",
    leadBefore: "Sign in to the ",
    leadAfter: " digital ecosystem and reach every BHD service and platform through one digital identity.",
    highlight: "One gateway that brings your work, services, and projects together.",
    slogan: "Build Higher Dreams",
    promiseBefore: "With ",
    promiseAfter: ", dreams begin — and grow.",
    login: "Sign in",
    register: "Create account",
    identifier: "Email or username",
    password: "Password",
    forgot: "Forgot password?",
    forgotTitle: "Reset your password",
    forgotLead: "Enter your email or username and we will send a reset link if the account exists.",
    forgotSubmit: "Send reset link",
    backToLogin: "Back to sign in",
    name: "Full name",
    email: "Email",
    username: "Username (optional)",
    phone: "Phone",
    more: "More profile details",
    hide: "Hide details",
    phone2: "Second phone",
    whatsapp: "WhatsApp",
    address: "Address",
    city: "City",
    zip: "Postal code",
    country: "Country",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    loading: "Please wait…",
    or: "Or continue with",
    google: "Continue with Google",
    facebook: "Continue with Facebook",
    whatsappSoon: "WhatsApp coming soon",
    footnote: "By continuing you agree to the",
    privacy: "privacy",
    terms: "and terms",
    apps: "BHD programmes",
    alreadyTitle: "Active session",
    alreadyBody:
      "You are currently signed in with this account. Continue with it, or sign out to use a different BHD account.",
    continueAccount: "Continue with this account",
    switchOut: "Sign out and use another account",
    switchTitle: "Switch BHD account",
    switchBody:
      "An active session belongs to a different account than the credentials you entered. Continue with the current session, or end it to sign in with the new account.",
    continueSession: "Continue current session",
    lang: "العربية",
    fail: "Something went wrong.",
    network: "Could not reach the server.",
  },
} as const;

function facebookCopy(code: string | null, lang: Lang) {
  const ar: Record<string, string> = {
    setup: "دخول فيسبوك غير مكتمل على الخادم.",
    database: "قاعدة البيانات غير مربوطة.",
    denied: "أُلغي الدخول عبر فيسبوك.",
    email: "يلزم السماح لفيسبوك بمشاركة البريد الإلكتروني.",
    locked: "هذا الحساب غير متاح للدخول.",
    rate: "محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.",
    switch: "أنت داخل بحساب آخر. اخرج أولاً ثم ادخل بالحساب الجديد.",
    failed: "تعذّر التحقق من حساب فيسبوك.",
  };
  const en: Record<string, string> = {
    setup: "Facebook sign-in is not fully configured.",
    database: "The database is not connected.",
    denied: "Facebook sign-in was cancelled.",
    email: "Facebook must share your email address.",
    locked: "This account cannot sign in.",
    rate: "Too many attempts. Wait a minute and try again.",
    switch: "You are already signed in. Sign out first to use another account.",
    failed: "Facebook could not be verified.",
  };
  return code ? (lang === "en" ? en : ar)[code] || "" : "";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [lang, setLang] = useState<Lang>("ar");
  const t = COPY[lang];
  const facebookMessage = facebookCopy(searchParams.get("fb"), lang);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("OM");
  const [zipCode, setZipCode] = useState("");
  const [existing, setExisting] = useState<{ name: string; email: string } | null | undefined>(undefined);
  const [switchPrompt, setSwitchPrompt] = useState<{ name: string; email: string } | null>(null);

  function logoutThenReload() {
    const returnTo = `${window.location.origin}/login${window.location.search || ""}`;
    const end = new URL("/oauth/end-session", window.location.origin);
    end.searchParams.set("client_id", "bhd-portal");
    end.searchParams.set("post_logout_redirect_uri", returnTo);
    window.location.assign(end.toString());
  }

  useEffect(() => {
    const local = searchParams.get("local");
    const next = searchParams.get("next") || "";
    if (local === "1" && next.startsWith("/admin")) {
      window.location.replace("/api/auth/admin-entry");
    }
  }, [searchParams]);

  useEffect(() => {
    const stored = window.localStorage.getItem("bhd-login-lang");
    if (stored === "en" || stored === "ar") setLang(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("bhd-login-lang", lang);
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: { name?: string; email?: string } | null }) => {
        if (cancelled) return;
        if (data.user?.email) setExisting({ name: data.user.name || data.user.email, email: data.user.email });
        else setExisting(null);
      })
      .catch(() => {
        if (!cancelled) setExisting(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const apps = useMemo(() => BHD_APPS.filter((app) => app.id !== "account"), []);

  async function finishOk() {
    const next = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.push(next);
    router.refresh();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "forgot") {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        });
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          setError(data.message || t.fail);
          return;
        }
        setNotice(data.message || "");
        return;
      }

      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { identifier, password }
            : {
                name,
                email,
                username: username || undefined,
                password,
                phone: phone || undefined,
                phone2: phone2 || undefined,
                whatsapp: whatsapp || undefined,
                address: address || undefined,
                city: city || undefined,
                country: country || "OM",
                zipCode: zipCode || undefined,
              },
        ),
      });
      const data = (await response.json()) as {
        message?: string;
        code?: string;
        activeSession?: { name?: string; email?: string } | null;
      };
      if (!response.ok) {
        if (response.status === 409 && data.code === "SWITCH_REQUIRES_LOGOUT") {
          const active = data.activeSession;
          if (active?.email) {
            setSwitchPrompt({ name: active.name || active.email, email: active.email });
            setExisting({ name: active.name || active.email, email: active.email });
            setError("");
            return;
          }
        }
        setError(data.message || t.fail);
        return;
      }
      await finishOk();
    } catch {
      setError(t.network);
    } finally {
      setLoading(false);
    }
  }

  function toggleLang() {
    setLang((current) => (current === "ar" ? "en" : "ar"));
  }

  return (
    <div className="login-screen" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="login-shell">
        <header className="login-top">
          <InstantLink href="/" className="login-top-logo" aria-label="BHD">
            <BrandLogo kind="full" tone="ink" className="login-top-mark" />
          </InstantLink>
          <button type="button" className="language-button login-lang" onClick={toggleLang}>
            {t.lang}
          </button>
        </header>

        <div className="login-stage">
          <aside className="login-brand-panel">
            <p className="login-brand-kicker">{t.kicker}</p>
            <h1>{t.title}</h1>
            <p className="login-lead">
              {t.leadBefore}
              <span className="login-brand-name">{t.brand}</span>
              {t.leadAfter}
            </p>
            <p className="login-highlight">{t.highlight}</p>
            <p className="login-slogan">
              <strong>{t.slogan}</strong>
            </p>
            <p className="login-promise">
              {t.promiseBefore}
              <span className="login-brand-name">{t.brand}</span>
              {t.promiseAfter}
            </p>
          </aside>

          <section className="login-card">
            {existing ? (
              <div className="login-already">
                <h2>{switchPrompt ? t.switchTitle : t.alreadyTitle}</h2>
                <p>
                  <strong>{existing.name}</strong>
                  <br />
                  <small>{existing.email}</small>
                </p>
                <p>{switchPrompt ? t.switchBody : t.alreadyBody}</p>
                <InstantLink className="login-submit" href={nextPath && nextPath.startsWith("/") ? nextPath : "/account"}>
                  {switchPrompt ? t.continueSession : t.continueAccount}
                </InstantLink>
                <button type="button" className="login-switch-out" onClick={logoutThenReload}>
                  {t.switchOut}
                </button>
              </div>
            ) : (
              <>
                <div className="login-card-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "login" || mode === "forgot"}
                    className={mode === "login" || mode === "forgot" ? "is-active" : ""}
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setNotice("");
                    }}
                  >
                    {t.login}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "register"}
                    className={mode === "register" ? "is-active" : ""}
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setNotice("");
                    }}
                  >
                    {t.register}
                  </button>
                </div>

                {mode === "forgot" ? (
                  <div className="login-forgot-intro">
                    <h2>{t.forgotTitle}</h2>
                    <p>{t.forgotLead}</p>
                  </div>
                ) : null}

                <form className="login-form" onSubmit={(event) => void onSubmit(event)}>
                  {mode === "register" ? (
                    <>
                      <label>
                        <span>{t.name}</span>
                        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                      </label>
                      <label>
                        <span>{t.email}</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                      </label>
                      <label>
                        <span>{t.username}</span>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                      </label>
                    </>
                  ) : (
                    <label>
                      <span>{t.identifier}</span>
                      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
                    </label>
                  )}

                  {mode !== "forgot" ? (
                    <label>
                      <span>{t.password}</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        required
                        minLength={8}
                      />
                    </label>
                  ) : null}

                  {mode === "login" ? (
                    <div className="login-forgot-row">
                      <button
                        type="button"
                        className="login-forgot-link"
                        onClick={() => {
                          setMode("forgot");
                          setError("");
                          setNotice("");
                          setPassword("");
                        }}
                      >
                        {t.forgot}
                      </button>
                    </div>
                  ) : null}

                  {mode === "register" ? (
                    <>
                      <label>
                        <span>{t.phone}</span>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+968" />
                      </label>
                      <button type="button" className="login-more-toggle" onClick={() => setShowMore((value) => !value)}>
                        {showMore ? t.hide : t.more}
                      </button>
                      {showMore ? (
                        <div className="login-address-grid">
                          <label>
                            <span>{t.phone2}</span>
                            <input value={phone2} onChange={(e) => setPhone2(e.target.value)} />
                          </label>
                          <label>
                            <span>{t.whatsapp}</span>
                            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                          </label>
                          <label className="full">
                            <span>{t.address}</span>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} />
                          </label>
                          <label>
                            <span>{t.city}</span>
                            <input value={city} onChange={(e) => setCity(e.target.value)} />
                          </label>
                          <label>
                            <span>{t.zip}</span>
                            <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                          </label>
                          <label>
                            <span>{t.country}</span>
                            <input value={country} onChange={(e) => setCountry(e.target.value)} />
                          </label>
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {error || facebookMessage ? (
                    <p className="login-error" role="alert">
                      {error || facebookMessage}
                    </p>
                  ) : null}
                  {notice ? (
                    <p className="login-notice" role="status">
                      {notice}
                    </p>
                  ) : null}

                  <button type="submit" className="login-submit" disabled={loading}>
                    {loading
                      ? t.loading
                      : mode === "login"
                        ? t.submitLogin
                        : mode === "forgot"
                          ? t.forgotSubmit
                          : t.submitRegister}
                  </button>

                  {mode === "forgot" ? (
                    <button
                      type="button"
                      className="login-forgot-back"
                      onClick={() => {
                        setMode("login");
                        setError("");
                        setNotice("");
                      }}
                    >
                      {t.backToLogin}
                    </button>
                  ) : null}
                </form>

                {mode !== "forgot" ? (
                  <>
                <div className="login-divider">
                  <span>{t.or}</span>
                </div>

                <div className="login-social">
                  <GoogleSignInButton onSuccess={() => void finishOk()} locale={lang} label={t.google} />
                  <FacebookSignInButton label={t.facebook} />
                  <button type="button" className="login-provider-btn is-whatsapp" title={t.whatsappSoon} aria-label={t.whatsappSoon} disabled>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.04 2c-5.5 0-10 4.47-10 10 0 1.76.46 3.47 1.34 4.98L2 22l5.16-1.35A9.96 9.96 0 0 0 12.04 22c5.5 0 10-4.47 10-10s-4.5-10-10-10Zm0 18.2c-1.6 0-3.16-.43-4.53-1.25l-.32-.19-3.06.8.82-2.98-.21-.33A8.18 8.18 0 0 1 3.84 12c0-4.52 3.68-8.2 8.2-8.2 4.51 0 8.18 3.68 8.18 8.2 0 4.52-3.67 8.2-8.18 8.2Zm4.49-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.2 3.7.59.25 1.04.41 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z"
                      />
                    </svg>
                  </button>
                </div>

                <p className="login-footnote">
                  {t.footnote} <InstantLink href="/privacy">{t.privacy}</InstantLink>{" "}
                  <InstantLink href="/terms">{t.terms}</InstantLink>.
                </p>
                  </>
                ) : null}
              </>
            )}
          </section>
        </div>

        <nav className="login-apps" aria-label={t.apps}>
          <p>{t.apps}</p>
          <ul>
            {apps.map((app) => (
              <li key={app.id} className={app.enabled ? "" : "is-soon"}>
                <BhdAppIcon id={app.id} title={lang === "ar" ? app.nameAr : app.nameEn} />
                <span>{lang === "ar" ? app.nameAr : app.nameEn}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
