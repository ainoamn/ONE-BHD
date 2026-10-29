"use client";

import { identityFetch, isIdentityOrigin, isPortalPublicOrigin, productStartPath } from "../../lib/identity/client";
import { useEffect } from "react";

/**
 * If identity already has an active account and this host has no matching
 * product session, bind silently via start — never /login?add=1.
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
    const here = `${window.location.pathname}${window.location.search || ""}` || "/";
    const guardKey = `bhd-sso:${here}`;
    if (sessionStorage.getItem(guardKey) === "1") return;
    identityFetch("/api/auth/me")
      .then((response) => response.json())
      .then(async (identity: { user?: { id?: string } | null }) => {
        if (cancelled || !identity.user?.id) return;
        const localResponse = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        const local = (await localResponse.json().catch(() => ({}))) as { user?: { id?: string } | null };
        if (cancelled) return;
        if (local.user?.id && local.user.id === identity.user.id) return;
        sessionStorage.setItem(guardKey, "1");
        window.location.replace(productStartPath(here));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
