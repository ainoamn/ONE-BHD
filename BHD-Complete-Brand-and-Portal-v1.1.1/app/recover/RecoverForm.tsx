"use client";

import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";
import { FormEvent, useState } from "react";

type Step = "facts" | "codes" | "password" | "done";

export function RecoverForm() {
  const [step, setStep] = useState<Step>("facts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [whatsappReady, setWhatsappReady] = useState(false);
  const [email, setEmail] = useState("");
  const [civilId, setCivilId] = useState("");
  const [civilIdExpires, setCivilIdExpires] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lastLoginDate, setLastLoginDate] = useState("");
  const [lastTransactions, setLastTransactions] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("");
  const [password, setPassword] = useState("");

  async function onFacts(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/recover/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          civilId,
          civilIdExpires,
          birthDate,
          whatsapp,
          lastLoginDate,
          lastTransactions,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        challengeId?: string;
        whatsappReady?: boolean;
      };
      if (!response.ok) throw new Error(data.message || "تعذّرت الاستعادة.");
      setChallengeId(data.challengeId || "");
      setWhatsappReady(Boolean(data.whatsappReady));
      setMessage(data.message || "");
      setStep("codes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّرت الاستعادة.");
    } finally {
      setLoading(false);
    }
  }

  async function onCodes(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, emailCode, whatsappCode }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "رمز غير صالح.");
      setMessage(data.message || "");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "رمز غير صالح.");
    } finally {
      setLoading(false);
    }
  }

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/recover/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, password }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message || "تعذّر حفظ كلمة المرور.");
      setMessage(data.message || "");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر حفظ كلمة المرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen" lang="ar" dir="rtl">
      <div className="login-shell">
        <header className="login-top">
          <InstantLink href="/" className="login-top-logo" aria-label="BHD">
            <BrandLogo kind="full" tone="ink" />
          </InstantLink>
        </header>
        <main className="login-card" id="main-content">
          <p className="login-kicker">حماية الحساب</p>
          <h1>استعادة حساب مقفل</h1>
          <p>
            بعد محاولات سرقة متكررة يُقفل الحساب حتى يثبت المالك الرقم المدني وتاريخ الميلاد وآخر نشاط معروف، ثم رموز البريد
            وواتساب.
          </p>
          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="login-form-notice" role="status">
              {message}
            </p>
          ) : null}

          {step === "facts" ? (
            <form className="login-form" onSubmit={(event) => void onFacts(event)}>
              <label>
                <span>البريد</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                <span>الرقم المدني</span>
                <input value={civilId} onChange={(e) => setCivilId(e.target.value)} required />
              </label>
              <label>
                <span>انتهاء المدني</span>
                <input type="date" value={civilIdExpires} onChange={(e) => setCivilIdExpires(e.target.value)} required />
              </label>
              <label>
                <span>تاريخ الميلاد</span>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
              </label>
              <label>
                <span>واتساب</span>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
              </label>
              <label>
                <span>تاريخ آخر دخول تتذكره</span>
                <input type="date" value={lastLoginDate} onChange={(e) => setLastLoginDate(e.target.value)} required />
              </label>
              <label>
                <span>آخر معاملات أو نشاط تتذكره</span>
                <textarea rows={3} value={lastTransactions} onChange={(e) => setLastTransactions(e.target.value)} required />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "…" : "إرسال رموز التحقق"}
              </button>
            </form>
          ) : null}

          {step === "codes" ? (
            <form className="login-form" onSubmit={(event) => void onCodes(event)}>
              <label>
                <span>رمز البريد</span>
                <input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} required />
              </label>
              {whatsappReady ? (
                <label>
                  <span>رمز واتساب</span>
                  <input value={whatsappCode} onChange={(e) => setWhatsappCode(e.target.value)} required />
                </label>
              ) : (
                <p className="admin-muted">واتساب غير مفعّل بعد. يكفي رمز البريد الآن.</p>
              )}
              <button type="submit" disabled={loading}>
                {loading ? "…" : "تحقق"}
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form className="login-form" onSubmit={(event) => void onPassword(event)}>
              <label>
                <span>كلمة مرور جديدة</span>
                <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "…" : "حفظ كلمة المرور"}
              </button>
            </form>
          ) : null}

          {step === "done" ? (
            <p>
              <InstantLink href="/login">العودة لتسجيل الدخول</InstantLink>
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
