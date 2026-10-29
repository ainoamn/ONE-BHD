"use client";

import { useEffect } from "react";
import {
  clearAccountRebindLock,
  isAccountRebindPending,
  isIdentityOrigin,
  scrubCacheBustFromUrl,
} from "../../lib/identity/client";
import { readActiveAu, setActiveAu } from "../../lib/identity/window-session";

/**
 * Identity host: keep URL ?au= aligned with the active window account.
 * No overlay notices — scrub _bhd after stable load.
 */
export function BhdSilentSso() {
  useEffect(() => {
    if (!isIdentityOrigin()) return;

    let cancelled = false;

    function sync() {
      if (cancelled || isAccountRebindPending()) return;
      const au = readActiveAu();
      if (au) setActiveAu(au);
      clearAccountRebindLock();
      scrubCacheBustFromUrl();
    }

    sync();
    const onVis = () => {
      if (!document.hidden) sync();
    };
    document.addEventListener("visibilitychange", onVis);
    const timer = window.setInterval(() => {
      if (!document.hidden) sync();
    }, 20_000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
