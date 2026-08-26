"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";
import { InstantLink } from "./InstantLink";
import { SessionMenu } from "./auth/SessionMenu";
import { SiteFooter } from "./SiteFooter";
import type { UiLocale } from "../lib/ui-locale";
import {
  applyDocumentLocale,
  readStoredUiLocale,
  writeStoredUiLocale,
} from "../lib/ui-locale";
import { useEffect, useState } from "react";

type InnerPageShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

const NAV = {
  ar: [
    ["الرئيسية", "/"],
    ["المنتجات", "/products"],
    ["التقنية", "/technology"],
    ["الهوية", "/brand"],
    ["الشركة", "/about"],
    ["الأمان", "/security"],
    ["التواصل", "/contact"],
  ],
  en: [
    ["Home", "/"],
    ["Products", "/products"],
    ["Technology", "/technology"],
    ["Brand", "/brand"],
    ["Company", "/about"],
    ["Security", "/security"],
    ["Contact", "/contact"],
  ],
} as const;

const CHROME = {
  ar: {
    brandAria: "العودة إلى الرئيسية",
    mainNav: "التنقل الرئيسي",
    openMenu: "فتح قائمة التنقل",
    menu: "القائمة",
    signIn: "دخول",
  },
  en: {
    brandAria: "Back to home",
    mainNav: "Main navigation",
    openMenu: "Open navigation menu",
    menu: "Menu",
    signIn: "Sign in",
  },
} as const;

export function InnerPageShell({ eyebrow, title, lead, children }: InnerPageShellProps) {
  const [locale, setLocale] = useState<UiLocale>("ar");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredUiLocale();
    if (stored) setLocale(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredUiLocale(locale);
    applyDocumentLocale(locale);
  }, [locale, ready]);

  const isArabic = locale === "ar";
  const navItems = NAV[locale];
  const t = CHROME[locale];

  return (
    <main
      id="main-content"
      className="inner-shell"
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      tabIndex={-1}
    >
      <div className="flag-line" aria-hidden="true" />
      <header className="inner-header section-wrap">
        <InstantLink className="brand" href="/" aria-label={t.brandAria}>
          <BrandLogo className="header-official-logo" />
        </InstantLink>
        <nav aria-label={t.mainNav}>
          {navItems.map(([label, href]) => (
            <InstantLink key={href} href={href}>
              {label}
            </InstantLink>
          ))}
        </nav>
        <details className="inner-mobile-nav">
          <summary aria-label={t.openMenu}>
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {t.menu}
          </summary>
          <div className="inner-mobile-nav-panel">
            {navItems.map(([label, href]) => (
              <InstantLink key={href} href={href}>
                {label}
              </InstantLink>
            ))}
          </div>
        </details>
        <div className="inner-header-end">
          <button
            type="button"
            className="gateway-lang inner-lang"
            onClick={() => setLocale(isArabic ? "en" : "ar")}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "EN" : "عربي"}
          </button>
          <SessionMenu signInLabel={t.signIn} locale={locale} />
        </div>
      </header>

      <section className="inner-hero">
        <div className="inner-hero-image" aria-hidden="true" />
        <div className="inner-hero-overlay" aria-hidden="true" />
        <div className="section-wrap inner-hero-content">
          <p className="eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </section>

      <div className="inner-content section-wrap">{children}</div>

      <SiteFooter locale={locale} />
    </main>
  );
}
