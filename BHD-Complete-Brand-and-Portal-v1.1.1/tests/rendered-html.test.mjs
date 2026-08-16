import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

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

test("applies production browser security headers", async () => {
  const config = await readFile(new URL("next.config.ts", root), "utf8");
  assert.match(config, /default-src 'self'/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /object-src 'none'/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /max-age=31536000/);
});

test("keeps the future login surface private and non-cacheable", async () => {
  const [config, login] = await Promise.all([
    readFile(new URL("next.config.ts", root), "utf8"),
    readFile(new URL("app/login/page.tsx", root), "utf8"),
  ]);
  assert.match(config, /noindex, noarchive/);
  assert.match(config, /private, no-store/);
  assert.match(login, /OpenID Connect|الحساب الموحد/);
});

test("provides a minimal non-cacheable health endpoint", async () => {
  const route = await readFile(new URL("app/healthz/route.ts", root), "utf8");
  assert.match(route, /no-store/);
  assert.match(route, /bhd-portal/);
});

test("warms internal routes and keeps the smart guide private by design", async () => {
  const [warmup, instantLink, advisor] = await Promise.all([
    readFile(new URL("app/components/NavigationWarmup.tsx", root), "utf8"),
    readFile(new URL("app/components/InstantLink.tsx", root), "utf8"),
    readFile(new URL("app/components/BhdAdvisor.tsx", root), "utf8"),
  ]);
  assert.match(warmup, /router\.prefetch/);
  assert.match(instantLink, /prefetch/);
  assert.match(advisor, /يعمل هذا الدليل محليًا/);
});

test("uses the official BHD logo assets across the portal", async () => {
  const [brandLogo, home] = await Promise.all([
    readFile(new URL("app/components/BrandLogo.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);
  assert.match(brandLogo, /official-logo/);
  assert.match(home, /BrandLogo/);
  assert.match(home, /BUILD[\s\S]*HIGHER[\s\S]*DREAMS/);
  assert.match(home, /ابْنِ[\s\S]*أَحْلَامًا[\s\S]*أَكْبَرَ/);
  await access(new URL("public/brand/bhd-logo.svg", root));
  await access(new URL("public/brand/bhd-mark.svg", root));
  await access(new URL("public/brand/bhd-logo-4096.png", root));
  await access(new URL("public/brand/bhd-mark-2048.png", root));
});

test("publishes the complete downloadable BHD brand system", async () => {
  const brandPage = await readFile(new URL("app/brand/page.tsx", root), "utf8");
  assert.match(brandPage, /شرح الشعار/);
  assert.match(brandPage, /BHD-Brand-Kit\.zip/);
  assert.match(brandPage, /BHD-Visual-Identity-Guidelines\.pdf/);
  await access(new URL("public/downloads/BHD-Brand-Kit.zip", root));
  await access(new URL("public/downloads/BHD-Visual-Identity-Guidelines.pdf", root));
});
