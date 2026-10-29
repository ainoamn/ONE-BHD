"use client";

import { applyAccountIsolation, identityFetch, isIdentityOrigin, isPortalPublicOrigin } from "../../lib/identity/client";
import { useEffect } from "react";

/**
 * If identity already has an active account and this host has no matching
 * product session, bind silently via start — never /login?add=1.
 * Re-bind whenever the identity account in this window differs from the product session.
 */
export function BhdSilentSso() {
  useEffect(() => {
    const path = window.location.pathname;
    if (
      isIdentityOrigin() ||
      isPortalPublicOrigin() ||
      path.startsWith("/login") ||
      path.startsWith("/oauth") ||
      path.startsWith("/api/") ||
      path.startsWith("/auth/") ||
      path.startsWith("/callback")
    ) {
      return;
    }

    let cancelled = false;
    identityFetch("/api/auth/me")
      .then((response) => response.json())
      .then(async (identity: { user?: { id?: string } | null }) => {
        if (cancelled || !identity.user?.id) return;
        const localResponse = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const local = (await localResponse.json().catch(() => ({}))) as { user?: { id?: string } | null };
        if (cancelled) return;
        if (local.user?.id && local.user.id === identity.user.id) return;
        const guardKey = `bhd-sso:${identity.user.id}`;
        const last = Number(sessionStorage.getItem(guardKey) || "0");
        if (last && Date.now() - last < 15_000) return;
        sessionStorage.setItem(guardKey, String(Date.now()));
        await applyAccountIsolation();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
