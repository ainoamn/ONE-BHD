"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  async function finishOk() {
    const next = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
    router.push(next);
    router.refresh();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
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
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر إكمال العملية.");
        return;
      }
      await finishOk();
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-stage">
        <aside className="login-brand-panel">
          <InstantLink href="/" className="login-brand-link" aria-label="العودة للرئيسية">
            <BrandLogo kind="full" tone="light" className="login-brand-logo" />
          </InstantLink>
          <p className="login-brand-kicker">حساب BHD</p>
          <h1>دخول حساب BHD — بوابة الهوية.</h1>
          <p>
            هذا هو الدخول الرسمي لمنظومة بن حمود للتطوير. المواقع الأخرى (وازن، حسابي، نَسَب، بيتك، المتجر…)
            تُحوِّل إلى هنا ثم تتعرّف عليك بنفس الحساب.
          </p>
          <ul>
            <li>إيميل أو اسم مستخدم + كلمة مرور</li>
            <li>دفتر عناوين مرتبط بالحساب</li>
            <li>Google بنفس حساب منظومة BHD</li>
          </ul>
        </aside>

        <section className="login-card">
          <div className="login-card-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "is-active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? "is-active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              إنشاء حساب
            </button>
          </div>

          <form className="login-form" onSubmit={(event) => void onSubmit(event)}>
            {mode === "register" ? (
              <>
                <label>
                  <span>الاسم الكامل</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  <span>البريد الإلكتروني</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>اسم المستخدم (اختياري)</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="مثال: abdulhamid"
                  />
                </label>
              </>
            ) : (
              <label>
                <span>الإيميل أو اسم المستخدم</span>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
            )}

            <label>
              <span>كلمة المرور</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={8}
              />
            </label>

            {mode === "register" ? (
              <>
                <label>
                  <span>رقم الهاتف</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+968..."
                  />
                </label>
                <button
                  type="button"
                  className="login-more-toggle"
                  onClick={() => setShowMore((value) => !value)}
                >
                  {showMore ? "إخفاء تفاصيل دفتر العناوين" : "إضافة تفاصيل دفتر العناوين"}
                </button>
                {showMore ? (
                  <div className="login-address-grid">
                    <label>
                      <span>هاتف إضافي</span>
                      <input value={phone2} onChange={(e) => setPhone2(e.target.value)} />
                    </label>
                    <label>
                      <span>واتساب</span>
                      <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                    </label>
                    <label className="full">
                      <span>العنوان</span>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} />
                    </label>
                    <label>
                      <span>المدينة</span>
                      <input value={city} onChange={(e) => setCity(e.target.value)} />
                    </label>
                    <label>
                      <span>الرمز البريدي</span>
                      <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                    </label>
                    <label>
                      <span>الدولة</span>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} />
                    </label>
                  </div>
                ) : null}
              </>
            ) : null}

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "جاري المعالجة…" : mode === "login" ? "دخول" : "إنشاء الحساب"}
            </button>
          </form>

          <div className="login-divider">
            <span>أو</span>
          </div>

          <GoogleSignInButton onSuccess={() => void finishOk()} />

          <p className="login-footnote">
            بالدخول فإنك توافق على{" "}
            <InstantLink href="/privacy">الخصوصية</InstantLink> و
            <InstantLink href="/terms">الشروط</InstantLink>.
          </p>
        </section>
      </div>
    </div>
  );
}
