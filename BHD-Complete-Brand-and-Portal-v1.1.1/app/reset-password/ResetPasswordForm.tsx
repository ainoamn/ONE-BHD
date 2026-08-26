"use client";

import { FormEvent, useMemo, useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { InstantLink } from "../components/InstantLink";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const missingToken = useMemo(() => !token.trim(), [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (missingToken) {
      setError("رابط إعادة التعيين ناقص.");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "تعذّر تحديث كلمة المرور.");
        return;
      }
      setDone(true);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="verify-email-screen" dir="rtl">
      <div className="verify-email-card">
        <BrandLogo kind="full" className="verify-email-logo" />
        <h1>{done ? "تم تحديث كلمة المرور" : "تعيين كلمة مرور جديدة"}</h1>
        {done ? (
          <>
            <p>يمكنك الآن الدخول بحساب BHD.</p>
            <div className="verify-email-actions">
              <InstantLink className="primary-button" href="/login">
                تسجيل الدخول
              </InstantLink>
            </div>
          </>
        ) : (
          <>
            <p>أدخل كلمة مرور جديدة لحسابك. الرابط صالح لساعة واحدة.</p>
            {error ? (
              <p className="admin-error" role="alert">
                {error}
              </p>
            ) : null}
            <form className="reset-password-form" onSubmit={onSubmit}>
              <label>
                <span>كلمة المرور الجديدة</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy || missingToken}
                  required
                  minLength={8}
                />
              </label>
              <label>
                <span>تأكيد كلمة المرور</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  disabled={busy || missingToken}
                  required
                  minLength={8}
                />
              </label>
              <button type="submit" className="primary-button" disabled={busy || missingToken}>
                {busy ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
