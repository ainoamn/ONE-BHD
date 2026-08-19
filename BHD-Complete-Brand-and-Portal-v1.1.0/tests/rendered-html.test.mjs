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

test("keeps the login surface private and wires identity APIs", async () => {
  const [config, login, googleRoute, facebookStart, schema, discovery] = await Promise.all([
    readFile(new URL("next.config.ts", root), "utf8"),
    readFile(new URL("app/login/page.tsx", root), "utf8"),
    readFile(new URL("app/api/auth/google/route.ts", root), "utf8"),
    readFile(new URL("app/api/auth/facebook/start/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/.well-known/openid-configuration/route.ts", root), "utf8"),
  ]);
  assert.match(config, /noindex, noarchive/);
  assert.match(config, /private, no-store/);
  assert.match(config, /\/admin/);
  assert.match(config, /\/account/);
  assert.match(config, /accounts\.google\.com/);
  assert.match(login, /LoginForm/);
  assert.match(googleRoute, /loginOrRegisterWithGoogle/);
  assert.match(facebookStart, /facebookLoginUrl/);
  const accountConsole = await readFile(new URL("app/account/AccountConsole.tsx", root), "utf8");
  const usersLib = await readFile(new URL("app/lib/auth/users.ts", root), "utf8");
  assert.match(accountConsole, /إنشاء كلمة مرور/);
  assert.doesNotMatch(usersLib, /throw new Error\("NO_PASSWORD"\)/);
  assert.match(schema, /facebook_id/);
  assert.match(schema, /birth_date/);
  assert.match(schema, /hometown/);
  assert.match(schema, /bhd_users/);
  assert.match(schema, /bhd_contacts/);
  assert.match(schema, /bhd_oauth_tickets/);
  assert.match(discovery, /authorization_endpoint/);
  assert.match(discovery, /bhd-identity\.v1/);
  await access(new URL(".env.example", root));
  await access(new URL("app/api/auth/login/route.ts", root));
  await access(new URL("app/api/auth/google/route.ts", root));
  await access(new URL("app/api/auth/facebook/start/route.ts", root));
  await access(new URL("app/api/auth/facebook/callback/route.ts", root));
  await access(new URL("app/api/auth/register/route.ts", root));
  await access(new URL("app/oauth/authorize/route.ts", root));
  await access(new URL("app/oauth/token/route.ts", root));
  await access(new URL("app/api/auth/bhd/start/route.ts", root));
  await access(new URL("app/api/auth/bhd/callback/route.ts", root));
  await access(new URL("app/admin/page.tsx", root));
  await access(new URL("app/account/page.tsx", root));
  await access(new URL("app/api/account/route.ts", root));
  await access(new URL("app/api/admin/overview/route.ts", root));
  await access(new URL("app/api/admin/users/route.ts", root));
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
  assert.match(warmup, /\/apps/);
  assert.match(warmup, /\/about/);
  assert.match(warmup, /\/brand/);
  assert.match(instantLink, /prefetch/);
  assert.match(advisor, /يعمل هذا الدليل محليًا/);
});

test("enforces idle sign-out, one session, programs footer, and shared brand chrome", async () => {
  const [config, keepAlive, footer, apps, layout, middleware, session] = await Promise.all([
    readFile(new URL("app/lib/auth/config.ts", root), "utf8"),
    readFile(new URL("app/components/auth/SessionKeepAlive.tsx", root), "utf8"),
    readFile(new URL("app/components/SiteFooter.tsx", root), "utf8"),
    readFile(new URL("app/apps/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("middleware.ts", root), "utf8"),
    readFile(new URL("app/lib/auth/session.ts", root), "utf8"),
  ]);
  assert.match(config, /SESSION_IDLE_MAX_AGE_SEC = 60 \* 60 \* 48/);
  assert.match(keepAlive, /\/api\/auth\/me/);
  assert.match(footer, /برامجنا/);
  assert.match(footer, /عن الشركة/);
  assert.match(footer, /هوية الشركة/);
  assert.match(apps, /كيف يعمل/);
  assert.match(apps, /الفوائد/);
  assert.match(layout, /SessionKeepAlive/);
  assert.match(middleware, /id\.bhd-om\.com/);
  assert.match(session, /SWITCH_REQUIRES_LOGOUT/);
  await access(new URL("docs/BHD-UNIFIED-LOGIN-AND-APPS.md", root));
});

test("points live BHD products at official bhd-om.com hosts", async () => {
  const products = await readFile(new URL("app/lib/products.ts", root), "utf8");
  assert.match(products, /https:\/\/wazen\.bhd-om\.com\//);
  assert.match(products, /https:\/\/hisaby\.bhd-om\.com\//);
  assert.match(products, /https:\/\/nasab\.bhd-om\.com\//);
  assert.match(products, /https:\/\/baitak\.bhd-om\.com\//);
  assert.match(products, /https:\/\/bhdstor\.bhd-om\.com\//);
  assert.match(products, /nameAr: "بيتك"/);
  assert.match(products, /appId: "wazen"/);
  assert.match(products, /appId: "hisaby"/);
  assert.doesNotMatch(products, /عين عُمان/);
  assert.doesNotMatch(products, /AIN OMAN/);
  assert.doesNotMatch(products, /wazen-roan\.vercel\.app/);
  assert.doesNotMatch(products, /bhd-pro\.vercel\.app/);
  assert.doesNotMatch(products, /nasab-mu\.vercel\.app/);
});

test("ships the frozen BHD app switcher beside the signed-in account", async () => {
  const [apps, switcher, session, icon] = await Promise.all([
    readFile(new URL("app/lib/bhd/apps.ts", root), "utf8"),
    readFile(new URL("app/components/bhd/BhdAppSwitcher.tsx", root), "utf8"),
    readFile(new URL("app/components/auth/SessionMenu.tsx", root), "utf8"),
    readFile(new URL("app/components/bhd/BhdAppIcon.tsx", root), "utf8"),
  ]);
  assert.match(apps, /bhd-appswitcher\.v1/);
  assert.match(apps, /https:\/\/bhdstor\.bhd-om\.com/);
  assert.match(switcher, /تطبيقات BHD/);
  assert.match(switcher, /\/account/);
  assert.match(switcher, /BhdAppIcon/);
  assert.match(session, /BhdAppSwitcher/);
  assert.match(icon, /wazen/);
  assert.match(icon, /baitak/);
  await access(new URL("docs/BHD-APP-SWITCHER.md", root));
});

test("uses the official BHD logo assets across the portal", async () => {
  const [brandLogo, home] = await Promise.all([
    readFile(new URL("app/components/BrandLogo.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);
  assert.match(brandLogo, /official-logo/);
  assert.match(home, /BrandLogo/);
  assert.match(home, /BUILD[\s\S]*HIGHER[\s\S]*DREAMS/);
  assert.match(home, /<b>ا<\/b>بنِ\./);
  assert.match(home, /<b>أ<\/b>حلامًا\./);
  assert.match(home, /<b>أ<\/b>كبر\./);
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
