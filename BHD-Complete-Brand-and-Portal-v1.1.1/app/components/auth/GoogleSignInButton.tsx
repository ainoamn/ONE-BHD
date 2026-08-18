"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useCallback, useState } from "react";
import { BHD_GOOGLE_WEB_CLIENT_ID } from "../../lib/auth/config";

type Props = {
  onSuccess?: () => void;
};

export function GoogleSignInButton({ onSuccess }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || BHD_GOOGLE_WEB_CLIENT_ID;
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
      <p className="login-setup-note" role="status">
        معرّف Google غير متاح.
      </p>
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

