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
    brandAria: "بن حمود للتطوير",
    openWorkspace: "فتح مساحة العمل",
    companyHint: "الموقع التعريفي للشركة",
    footerLine: "ابنِ أحلامًا أكبر.",
    rights: "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
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
  },
};

function openGatewayApp(app: BhdApp) {
  window.location.assign(launchUrlForApp(app, window.location.origin));
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const t = copy[language];
  const isArabic = language === "ar";
  const apps = gatewayApps();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

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

      <SiteFooter promise={t.footerLine} rights={t.rights} hidePrograms />
    </main>
  );
}
