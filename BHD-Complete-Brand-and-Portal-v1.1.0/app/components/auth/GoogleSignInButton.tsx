"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useState } from "react";
import { BHD_GOOGLE_WEB_CLIENT_ID } from "../../lib/auth/config";

type Props = {
  onSuccess?: () => void;
  locale?: "ar" | "en";
  label: string;
};

export function GoogleSignInButton({ onSuccess, locale = "ar", label }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || BHD_GOOGLE_WEB_CLIENT_ID;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
        setError(locale === "en" ? "Google did not return a sign-in token." : "تعذّر استلام رمز Google.");
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
          setError(data.message || (locale === "en" ? "Google sign-in failed." : "تعذّر تسجيل الدخول عبر Google."));
          return;
        }
        onSuccess?.();
      } catch {
        setError(locale === "en" ? "Could not reach the sign-in server." : "تعذّر الاتصال بخادم الدخول.");
      } finally {
        setLoading(false);
      }
    },
    [locale, onSuccess],
  );

  if (!clientId) return null;

  return (
    <div className="login-provider">
      <div className="login-provider-hit" title={label} aria-label={label}>
        <GoogleLogin
          onSuccess={(credential) => void handleSuccess(credential)}
          onError={() => setError(locale === "en" ? "Google sign-in failed." : "تعذّر تسجيل الدخول عبر Google.")}
          useOneTap={false}
          type="icon"
          shape="circle"
          theme="filled_white"
          size="large"
          locale={locale === "en" ? "en" : "ar"}
        />
      </div>
      {loading ? <span className="login-provider-status">…</span> : null}
      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
