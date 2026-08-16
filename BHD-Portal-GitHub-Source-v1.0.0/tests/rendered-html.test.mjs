import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://bhd-om.com${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the BHD portal and core routes", async () => {
  for (const pathname of ["/", "/products", "/products/wazen", "/technology", "/security", "/privacy"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, pathname);
    const html = await response.text();
    assert.match(html, /BHD|Bin Hamood Development/i, pathname);
    assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i, pathname);
  }
});

test("applies production browser security headers", async () => {
  const response = await render("/");
  const csp = response.headers.get("content-security-policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("x-dns-prefetch-control"), "off");
  assert.equal(response.headers.get("x-permitted-cross-domain-policies"), "none");
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
  assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=31536000/);
});

test("keeps the future login surface private and non-cacheable", async () => {
  const response = await render("/login");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, noarchive");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(await response.text(), /OpenID Connect|الحساب الموحد/);
});

test("ships production metadata and security disclosure", async () => {
  const [layout, page] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);
  assert.match(layout, /og\.png/);
  assert.match(layout, /Build Higher Dreams/);
  assert.match(layout, /application\/ld\+json/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
  await access(new URL("public/og.png", root));
  await access(new URL("public/.well-known/security.txt", root));
  await access(new URL("public/images/bhd-philosophy-hero.webp", root));
});

test("provides a minimal non-cacheable health endpoint", async () => {
  const response = await render("/healthz");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "ok", service: "bhd-portal" });
});

test("warms internal routes and keeps the smart guide private by design", async () => {
  const [warmup, instantLink, advisor, worker] = await Promise.all([
    readFile(new URL("app/components/NavigationWarmup.tsx", root), "utf8"),
    readFile(new URL("app/components/InstantLink.tsx", root), "utf8"),
    readFile(new URL("app/components/BhdAdvisor.tsx", root), "utf8"),
    readFile(new URL("worker/index.ts", root), "utf8"),
  ]);

  assert.match(warmup, /router\.prefetch/);
  assert.match(instantLink, /prefetch/);
  assert.match(advisor, /يعمل هذا الدليل محليًا/);
  assert.match(worker, /max-age=31536000, immutable/);
});

test("uses the official BHD logo assets across the portal", async () => {
  const [brandLogo, home] = await Promise.all([
    readFile(new URL("app/components/BrandLogo.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);

  assert.match(brandLogo, /official-logo/);
  assert.match(home, /BrandLogo/);
  assert.match(home, /BUILD[\s\S]*HIGHER[\s\S]*DREAMS/);
  await access(new URL("public/brand/bhd-logo.svg", root));
  await access(new URL("public/brand/bhd-mark.svg", root));
  await access(new URL("public/brand/bhd-logo-4096.png", root));
  await access(new URL("public/brand/bhd-mark-2048.png", root));
});
