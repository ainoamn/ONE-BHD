"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./components/BrandLogo";
import { InstantLink } from "./components/InstantLink";
import { SessionMenu } from "./components/auth/SessionMenu";
import { SiteFooter } from "./components/SiteFooter";
import { BhdAppIcon } from "./components/bhd/BhdAppIcon";
import { gatewayApps, launchUrlForApp, type BhdApp } from "./lib/bhd/apps";

type Language = "ar" | "en";

const copy = {
  ar: {
    signIn: "دخول",
    company: "عن الشركة",
    brand: "الهوية",
    appsGuide: "دليل البرامج",
    eyebrow: "منظومة بن حمود للتطوير",
    brandLine: "بن حمود للتطوير",
    title: "بوابتك إلى كل تطبيقات BHD",
    lead: "حساب واحد، ثم انتقل مباشرة إلى مساحة عملك في وازن وحسابي ونَسَب وBHD R والمتجر — دون المرور بالصفحات التسويقية.",
    guestHint: "سجّل الدخول مرة واحدة، ثم افتح أي تطبيق من الشبكة أدناه.",
    signedHint: "اختر تطبيقاً للانتقال مباشرة إلى لوحة عملك.",
    openWorkspace: "فتح مساحة العمل",
    companyCta: "بوابة بن حمود",
    companyHint: "الموقع التعريفي للشركة",
    footerLine: "ابنِ أحلامًا أكبر.",
    rights: "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
  },
  en: {
    signIn: "Sign in",
    company: "Company",
    brand: "Brand",
    appsGuide: "Apps guide",
    eyebrow: "Bin Hamood Development ecosystem",
    brandLine: "Bin Hamood Development",
    title: "Your gateway to every BHD app",
    lead: "One account — then go straight into your workspace in WAZEN, HISAB, NASAB, BHD R and Store, skipping marketing landings.",
    guestHint: "Sign in once, then open any app from the grid below.",
    signedHint: "Choose an app to open your workspace directly.",
    openWorkspace: "Open workspace",
    companyCta: "Bin Hamood Portal",
    companyHint: "Company site and story",
    footerLine: "Build Higher Dreams.",
    rights: "Bin Hamood Development. All rights reserved.",
  },
};

function openGatewayApp(app: BhdApp) {
  window.location.assign(launchUrlForApp(app, window.location.origin));
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const t = copy[language];
  const isArabic = language === "ar";
  const apps = gatewayApps();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: unknown }) => setSignedIn(Boolean(data.user)))
      .catch(() => setSignedIn(false))
      .finally(() => setReady(true));
  }, []);

  return (
    <main
      id="main-content"
      className="gateway-shell"
      lang={language}
      dir={isArabic ? "rtl" : "ltr"}
      tabIndex={-1}
    >
      <div className="gateway-atmosphere" aria-hidden="true">
        <div className="gateway-photo" />
        <div className="gateway-veil" />
        <div className="gateway-glow" />
      </div>

      <header className="gateway-header">
        <InstantLink className="gateway-brand" href="/" aria-label={t.brandLine}>
          <BrandLogo kind="full" tone="light" className="gateway-logo" />
        </InstantLink>

        <nav className="gateway-nav" aria-label={isArabic ? "روابط ثانوية" : "Secondary links"}>
          <InstantLink href="/company">{t.company}</InstantLink>
          <InstantLink href="/brand">{t.brand}</InstantLink>
          <InstantLink href="/apps">{t.appsGuide}</InstantLink>
        </nav>

        <div className="gateway-actions">
          <SessionMenu signInLabel={t.signIn} />
          <button
            type="button"
            className="gateway-lang"
            onClick={() => setLanguage(isArabic ? "en" : "ar")}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "EN" : "عربي"}
          </button>
        </div>
      </header>

      <section className="gateway-hero">
        <p className="gateway-eyebrow">{t.eyebrow}</p>
        <p className="gateway-brand-signal">{t.brandLine}</p>
        <h1>{t.title}</h1>
        <p className="gateway-lead">{t.lead}</p>
        <p className="gateway-hint">{ready ? (signedIn ? t.signedHint : t.guestHint) : "…"}</p>
        {ready && !signedIn ? (
          <div className="gateway-cta-row">
            <InstantLink className="gateway-signin" href="/login?next=/">
              {t.signIn}
              <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
            </InstantLink>
            <InstantLink className="gateway-company-ghost" href="/company">
              {t.companyCta}
            </InstantLink>
          </div>
        ) : null}
      </section>

      <section className="gateway-grid-section" aria-label={isArabic ? "تطبيقات المجموعة" : "Group applications"}>
        <div className="gateway-grid">
          {apps.map((app, index) => {
            const isPortal = app.id === "portal";
            return (
              <button
                key={app.id}
                type="button"
                className={`gateway-tile${isPortal ? " gateway-tile-portal" : ""}`}
                style={{ "--tile-accent": app.accent, "--tile-soft": app.soft, "--tile-delay": `${index * 45}ms` } as React.CSSProperties}
                onClick={() => openGatewayApp(app)}
              >
                <BhdAppIcon id={app.id} title={isArabic ? app.nameAr : app.nameEn} className="gateway-tile-icon" />
                <span className="gateway-tile-name">{isArabic ? app.nameAr : app.nameEn}</span>
                <span className="gateway-tile-meta">
                  {isPortal ? t.companyHint : t.openWorkspace}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="gateway-foot-cta">
        <InstantLink className="gateway-company-link" href="/company">
          {t.companyCta}
          <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
        </InstantLink>
      </div>

      <SiteFooter promise={t.footerLine} rights={t.rights} />
    </main>
  );
}
