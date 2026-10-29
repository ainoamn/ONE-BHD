import { BHD_APPS } from "../bhd/apps";
import { DEFAULT_IDENTITY_ISSUER } from "./issuer";
import { captureWindowToken, windowFetchHeaders } from "./window-session";

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
    .then((data: { token?: unknown } | null) => {
      if (data && typeof data.token === "string") captureWindowToken(data.token);
    })
    .catch(() => undefined);
  return responsePromise;
}

export function currentReturnPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search || ""}` || "/";
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

export async function applyAccountIsolation() {
  if (typeof window === "undefined") return;
  const here = currentReturnPath();
  if (isIdentityOrigin()) {
    // Hard navigation + cache bust so /account RSC and cookie-backed routes remount
    // on the switched bhd_id (reload alone can keep a stale document).
    const url = new URL(here, window.location.origin);
    url.searchParams.set("_bhd", String(Date.now()));
    window.location.assign(`${url.pathname}${url.search}`);
    return;
  }
  try {
    const response = await identityFetch("/api/auth/window-handoff", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { ticket?: string };
    const start = new URL(productStartPath(here), window.location.origin).toString();
    if (data.ticket) {
      const handoff = new URL("/auth/handoff", DEFAULT_IDENTITY_ISSUER);
      handoff.searchParams.set("ticket", data.ticket);
      handoff.searchParams.set("next", start);
      window.location.assign(handoff.toString());
      return;
    }
  } catch {
    /* fall through to start */
  }
  window.location.assign(productStartPath(here));
}
