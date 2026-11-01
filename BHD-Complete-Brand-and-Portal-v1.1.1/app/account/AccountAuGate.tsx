"use client";

import { useEffect, useState } from "react";
import { identityFetch, switchWindowAccount } from "../lib/identity/client";
import { readActiveAu, setActiveAu } from "../lib/identity/window-session";

/**
 * When /account?au=<sub> opens from a product tab, bind the identity cookie
 * to that same account before the console paints (Google-style authuser).
 */
export function AccountAuGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bind() {
      const au =
        (typeof window !== "undefined"
          ? new URL(window.location.href).searchParams.get("au")?.trim()
          : "") || readActiveAu();
      if (!au) {
        if (!cancelled) setReady(true);
        return;
      }
      setActiveAu(au);
      try {
        const me = await identityFetch("/api/auth/me");
        const body = (await me.json().catch(() => ({}))) as { user?: { id?: string } | null };
        if (cancelled) return;
        if (body.user?.id && body.user.id === au) {
          setReady(true);
          return;
        }
        const switched = await switchWindowAccount(au);
        if (cancelled) return;
        if (switched.ok) {
          const next = `/account?au=${encodeURIComponent(au)}`;
          window.location.replace(next);
          return;
        }
      } catch {
        /* fall through */
      }
      if (!cancelled) setReady(true);
    }

    void bind();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div style={{ minHeight: "40vh", display: "grid", placeItems: "center", opacity: 0.7 }}>
        …
      </div>
    );
  }
  return <>{children}</>;
}
