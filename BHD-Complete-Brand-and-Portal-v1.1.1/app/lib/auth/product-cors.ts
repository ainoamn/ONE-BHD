/**
 * Credentialed CORS for product headers calling identity /api/auth/{me,switch,logout}.
 * Host-only cookies stay on id.bhd-om.com; products read the JSON response only.
 * See docs/BHD-SESSION-POLICY.md (multi-account from product header).
 */

const PRODUCT_ORIGINS = new Set([
  "https://www.bhd-om.com",
  "https://bhd-om.com",
  "https://wazen.bhd-om.com",
  "https://wazen-roan.vercel.app",
  "https://hisaby.bhd-om.com",
  "https://nasab.bhd-om.com",
  "https://r.bhd-om.com",
  "https://bhdstor.bhd-om.com",
  "https://baitak.bhd-om.com",
  "https://hr.bhd-om.com",
  "https://hr.hd-om.com",
  "https://bhd-hr.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
]);

export function allowedProductOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (PRODUCT_ORIGINS.has(origin)) return origin;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host.endsWith(".bhd-om.com") || host.endsWith(".vercel.app")) return origin;
  } catch {
    /* ignore */
  }
  return null;
}

export function productCorsHeaders(request: Request): HeadersInit {
  const origin = allowedProductOrigin(request);
  if (!origin) return { "Cache-Control": "no-store" };
  return {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
}

export function productCorsPreflight(request: Request): Response {
  return new Response(null, { status: 204, headers: productCorsHeaders(request) });
}
