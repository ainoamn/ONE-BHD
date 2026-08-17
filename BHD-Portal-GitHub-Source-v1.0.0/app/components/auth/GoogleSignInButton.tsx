"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useState } from "react";

type Props = {
  onSuccess?: () => void;
};

export function GoogleSignInButton({ onSuccess }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
        setError("تعذّر استلام رمز Google.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: credentialResponse.credential }),
        });
        const data = (await response.json()) as { message?: string };
        if (!response.ok) {
          setError(data.message || "تعذّر تسجيل الدخول عبر Google.");
          return;
        }
        onSuccess?.();
      } catch {
        setError("تعذّر الاتصال بخادم الدخول.");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  if (!clientId) {
    return (
      <div className="google-signin google-signin-ready">
        <button type="button" className="google-ready-button" disabled>
          <GoogleMark />
          المتابعة مع Google
        </button>
        <p className="login-setup-note">
          Google جاهز في الواجهة. يُفعَّل بعد ضبط Client ID وربط Neon و`AUTH_SECRET` وإضافة الدومين في Google Cloud.
        </p>
      </div>
    );
  }

  return (
    <div className="google-signin">
      <GoogleLogin
        onSuccess={(credential) => void handleSuccess(credential)}
        onError={() => setError("تعذّر تسجيل الدخول عبر Google.")}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
      {loading ? <p className="login-status">جاري التحقق من حساب Google…</p> : null}
      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.9 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.1 39.5 16 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.5 7.3l.1.1 6.2 5.2C36.8 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
