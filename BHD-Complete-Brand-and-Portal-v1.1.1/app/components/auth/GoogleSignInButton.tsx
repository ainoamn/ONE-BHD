"use client";

import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const arm = () => setReady(true);
    const idle = window.requestIdleCallback?.(arm, { timeout: 600 });
    if (idle == null) {
      const timer = window.setTimeout(arm, 0);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, []);

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
      {ready ? (
        <div className="login-provider-hit" title={label} aria-label={label}>
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={(credential) => void handleSuccess(credential)}
              onError={() => setError(locale === "en" ? "Google sign-in failed." : "تعذّر تسجيل الدخول عبر Google.")}
              useOneTap={false}
              auto_select={false}
              type="icon"
              shape="circle"
              theme="outline"
              size="large"
            />
          </GoogleOAuthProvider>
        </div>
      ) : (
        <button type="button" className="login-provider-arm" title={label} aria-label={label} onClick={() => setReady(true)}>
          G
        </button>
      )}
      {loading ? <span className="login-provider-status">…</span> : null}
      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
