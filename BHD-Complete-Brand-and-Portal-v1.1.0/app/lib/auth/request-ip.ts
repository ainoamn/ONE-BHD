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
