import { BHD_APPS } from "../bhd/apps";
import { DEFAULT_IDENTITY_ISSUER } from "./issuer";
import {
  boundWindowToken,
  captureAccountToken,
  captureWindowToken,
  readActiveAu,
  setActiveAu,
  tokenForAccount,
  windowFetchHeaders,
} from "./window-session";

export function pageOrigin() {
  return typeof window === "undefined" ? "" : window.location.origin.replace(/\/$/, "");
}

export function isIdentityOrigin(origin = pageOrigin()) {
  const here = origin.replace(/\/$/, "");
  return here === DEFAULT_IDENTITY_ISSUER || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(here);
}

/** البوابة التسويقية ليست منتج SSO — الرأس يقرأ الهوية مباشرة. */
export function isPortalPublicOrigin(origin = pageOrigin()) {
  const here = origin.replace(/\/$/, "");
  return (
    here === "https://www.bhd-om.com" ||
    here === "https://bhd-om.com" ||
    here.endsWith(".vercel.app")
  );
}

export function identityApiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (isIdentityOrigin()) return normalized;
  return `${DEFAULT_IDENTITY_ISSUER}${normalized}`;
}

export function identityFetch(path: string, init?: RequestInit) {
  const headers = windowFetchHeaders(init?.headers);
  const responsePromise = fetch(identityApiUrl(path), {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers,
  });
  void responsePromise
    .then((response) => response.clone().json())
    .then((data: { token?: unknown; user?: { id?: string } | null } | null) => {
      if (!data || typeof data.token !== "string") return;
      const sub = typeof data.user?.id === "string" ? data.user.id : readActiveAu();
      if (sub) captureAccountToken(sub, data.token);
      else captureWindowToken(data.token);
    })
    .catch(() => undefined);
  return responsePromise;
}

export function currentReturnPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search || ""}` || "/";
}

export function accountBoundPath(returnTo = "/", sub?: string | null) {
  const path = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  const au = (sub || readActiveAu() || "").trim();
  try {
    const url = new URL(path, "https://bhd.local");
    url.searchParams.delete("_bhd");
    if (au) url.searchParams.set("au", au);
    else url.searchParams.delete("au");
    return `${url.pathname}${url.search}`;
  } catch {
    return path;
  }
}

export function accountBoundReturnPath(returnTo = "/", sub?: string | null) {
  const path = accountBoundPath(returnTo, sub);
  try {
    const url = new URL(path, "https://bhd.local");
    url.searchParams.set("_bhd", String(Date.now()));
    return `${url.pathname}${url.search}`;
  } catch {
    return path.includes("?") ? `${path}&_bhd=${Date.now()}` : `${path}?_bhd=${Date.now()}`;
  }
}

export function scrubCacheBustFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("_bhd")) return;
    url.searchParams.delete("_bhd");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", next || "/");
  } catch {
    /* ignore */
  }
}

export function productStartPath(returnTo = "/") {
  const path = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  return `/api/auth/bhd/start?returnTo=${encodeURIComponent(path)}`;
}

export function allowedBhdUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.origin)) return "";
    if (url.origin === DEFAULT_IDENTITY_ISSUER) return url.toString();
    if (BHD_APPS.some((app) => app.origin.replace(/\/$/, "") === url.origin)) return url.toString();
    if (url.hostname === "bhd-om.com" || url.hostname.endsWith(".bhd-om.com")) return url.toString();
    if (url.hostname === "hr.hd-om.com") return url.toString();
  } catch {
    /* ignore */
  }
  return "";
}

export function addAccountUrl() {
  const next = isIdentityOrigin()
    ? currentReturnPath()
    : `/auth/continue?to=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`;
  return `${identityApiUrl("/login")}?add=1&next=${encodeURIComponent(next)}`;
}

const REBIND_LOCK = "bhd_rebind_lock";

export function isAccountRebindPending() {
  if (typeof sessionStorage === "undefined") return false;
  const raw = sessionStorage.getItem(REBIND_LOCK);
  if (!raw) return false;
  const at = Number(raw);
  return Number.isFinite(at) && Date.now() - at < 12_000;
}

/** Blank cover on explicit switch only — no text notices. */
export function paintPrivacyVeil(_message?: string) {
  if (typeof document === "undefined") return;
  try {
    document.documentElement.dataset.bhdSwitching = "1";
    let veil = document.getElementById("bhd-privacy-veil");
    if (!veil) {
      veil = document.createElement("div");
      veil.id = "bhd-privacy-veil";
      veil.setAttribute("aria-hidden", "true");
      veil.style.cssText =
        "position:fixed;inset:0;z-index:2147483647;background:var(--ink-900,#092d24);pointer-events:none";
      document.body.appendChild(veil);
    }
  } catch {
    /* ignore */
  }
}

export function clearAccountRebindLock() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(REBIND_LOCK);
  try {
    delete document.documentElement.dataset.bhdSwitching;
    document.getElementById("bhd-privacy-veil")?.remove();
  } catch {
    /* ignore */
  }
}

/**
 * Identity site: hard navigate with ?au= + one-shot _bhd, then scrub.
 * Product sites use form/JSON rebind — identity is the cookie authority.
 */
export async function applyAccountIsolation(options?: { sub?: string | null }) {
  if (typeof window === "undefined") return;
  const sub = (options?.sub || readActiveAu() || "").trim();
  if (sub) setActiveAu(sub);
  const here = currentReturnPath();
  sessionStorage.setItem(REBIND_LOCK, String(Date.now()));
  paintPrivacyVeil();
  if (isIdentityOrigin()) {
    window.location.assign(accountBoundReturnPath(here, sub));
    return;
  }
  // Portal marketing origin may still need product rebind path.
  const windowToken = (sub ? tokenForAccount(sub) : "") || boundWindowToken();
  if (windowToken) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/bhd/rebind";
    form.style.display = "none";
    const tokenInput = document.createElement("input");
    tokenInput.name = "token";
    tokenInput.value = windowToken;
    const returnInput = document.createElement("input");
    returnInput.name = "returnTo";
    returnInput.value = accountBoundReturnPath(here, sub);
    form.append(tokenInput, returnInput);
    document.body.appendChild(form);
    form.submit();
    return;
  }
  try {
    const response = await identityFetch("/api/auth/window-handoff", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { ticket?: string };
    const start = new URL(productStartPath(accountBoundReturnPath(here, sub)), window.location.origin).toString();
    if (data.ticket) {
      const handoff = new URL("/auth/handoff", DEFAULT_IDENTITY_ISSUER);
      handoff.searchParams.set("ticket", data.ticket);
      handoff.searchParams.set("next", start);
      window.location.assign(handoff.toString());
      return;
    }
  } catch {
    /* fall through */
  }
  window.location.assign(productStartPath(accountBoundReturnPath(here, sub)));
}

export async function switchWindowAccount(sub: string): Promise<{ ok: boolean; token?: string; userId?: string }> {
  if (!sub) return { ok: false };
  paintPrivacyVeil();
  const response = await identityFetch("/api/auth/switch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BHD-Persist-Cookie": "1",
    },
    body: JSON.stringify({ sub }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    token?: string;
    user?: { id?: string } | null;
  };
  const userId = typeof body.user?.id === "string" ? body.user.id : sub;
  if (typeof body.token === "string") {
    captureAccountToken(userId, body.token);
    setActiveAu(userId);
  }
  return {
    ok: response.ok,
    token: typeof body.token === "string" ? body.token : undefined,
    userId,
  };
}
