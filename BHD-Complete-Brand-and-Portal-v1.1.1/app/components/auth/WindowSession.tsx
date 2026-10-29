"use client";

import { useEffect } from "react";
import { identityFetch } from "../../lib/identity/client";
import { captureWindowToken, WINDOW_SIGNED_OUT_KEY, WINDOW_TOKEN_KEY } from "../../lib/identity/window-session";

/** Copies the cookie session into this window only when the window has no token yet. */
export function WindowSession() {
  useEffect(() => {
    if (sessionStorage.getItem(WINDOW_SIGNED_OUT_KEY) === "1") return;
    if (sessionStorage.getItem(WINDOW_TOKEN_KEY)) return;
    identityFetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { token?: string }) => {
        captureWindowToken(data.token);
      })
      .catch(() => undefined);
  }, []);
  return null;
}
