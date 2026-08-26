"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./components/BrandLogo";
import { InstantLink } from "./components/InstantLink";
import { SessionMenu } from "./components/auth/SessionMenu";
import { SiteFooter } from "./components/SiteFooter";
import { BhdAppIcon } from "./components/bhd/BhdAppIcon";
import { gatewayApps, launchUrlForApp, type BhdApp } from "./lib/bhd/apps";
import type { UiLocale } from "./lib/ui-locale";
import {
  applyDocumentLocale,
  readStoredUiLocale,
  writeStoredUiLocale,
} from "./lib/ui-locale";

const copy = {
  ar: {
    signIn: "دخول",
    company: "عن الشركة",
    brand: "الهوية",
    appsGuide: "دليل البرامج",
    brandAria: "بن حمود للتطوير",
    openWorkspace: "فتح مساحة العمل",
    companyHint: "الموقع التعريفي للشركة",
    footerLine: "ابنِ أحلامًا أكبر.",
    rights: "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
    secondaryNav: "روابط ثانوية",
    appsSection: "تطبيقات المجموعة",
  },
  en: {
    signIn: "Sign in",
    company: "Company",
    brand: "Brand",
    appsGuide: "Apps guide",
    brandAria: "Bin Hamood Development",
    openWorkspace: "Open workspace",
    companyHint: "Company introductory site",
    footerLine: "Build Higher Dreams.",
    rights: "Bin Hamood Development. All rights reserved.",
    secondaryNav: "Secondary links",
    appsSection: "Group applications",
  },
};

function openGatewayApp(app: BhdApp) {
  window.location.assign(launchUrlForApp(app, window.location.origin));
}

export default function Home() {
  const [language, setLanguage] = useState<UiLocale>("ar");
  const [ready, setReady] = useState(false);
  const t = copy[language];
  const isArabic = language === "ar";
  const apps = gatewayApps();

  useEffect(() => {
    const stored = readStoredUiLocale();
    if (stored) setLanguage(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredUiLocale(language);
    applyDocumentLocale(language);
  }, [language, ready]);

  function switchLanguage(next: UiLocale) {
    setLanguage(next);
  }

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
        <InstantLink className="gateway-brand" href="/" aria-label={t.brandAria}>
          <BrandLogo kind="full" tone="light" className="gateway-logo" />
        </InstantLink>

        <nav className="gateway-nav" aria-label={t.secondaryNav}>
          <InstantLink href="/company">{t.company}</InstantLink>
          <InstantLink href="/brand">{t.brand}</InstantLink>
          <InstantLink href="/apps">{t.appsGuide}</InstantLink>
        </nav>

        <div className="gateway-actions">
          <SessionMenu signInLabel={t.signIn} locale={language} />
          <button
            type="button"
            className="gateway-lang"
            onClick={() => switchLanguage(isArabic ? "en" : "ar")}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "EN" : "عربي"}
          </button>
        </div>
      </header>

      <section className="gateway-grid-section" aria-label={t.appsSection}>
        <div className="gateway-grid">
          {apps.map((app, index) => {
            const isPortal = app.id === "portal";
            const label = isArabic ? app.nameAr : app.nameEn;
            return (
              <button
                key={app.id}
                type="button"
                className={`gateway-tile${isPortal ? " gateway-tile-portal" : ""}`}
                style={{ "--tile-accent": app.accent, "--tile-soft": app.soft, "--tile-delay": `${index * 45}ms` } as React.CSSProperties}
                onClick={() => openGatewayApp(app)}
              >
                <BhdAppIcon id={app.id} title={label} className="gateway-tile-icon" />
                <span className="gateway-tile-name">{label}</span>
                <span className="gateway-tile-meta">
                  {isPortal ? t.companyHint : t.openWorkspace}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <SiteFooter promise={t.footerLine} rights={t.rights} hidePrograms locale={language} />
    </main>
  );
}
