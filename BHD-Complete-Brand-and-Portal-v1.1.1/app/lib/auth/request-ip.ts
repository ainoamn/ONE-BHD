/** Best-effort client IP behind Vercel / proxies. */
export function getRequestIp(request?: Request | null): string | null {
  if (!request) return null;
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first.slice(0, 64);
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return null;
}

/** ISO country from the edge (Vercel / Cloudflare). Empty when unknown. */
export function getRequestCountry(request?: Request | null): string | null {
  if (!request) return null;
  const value =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    "";
  const code = value.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code.slice(0, 8);
}

export function getRequestUserAgent(request?: Request | null): string | null {
  const value = request?.headers.get("user-agent")?.trim() || "";
  return value ? value.slice(0, 300) : null;
}
