"use client";

import { BrandLogo } from "./BrandLogo";
import { InstantLink } from "./InstantLink";
import { BhdAppIcon } from "./bhd/BhdAppIcon";
import { publicUrlForApp } from "../lib/bhd/apps";
import { useLiveCatalog } from "../lib/bhd/use-live-catalog";
import type { UiLocale } from "../lib/ui-locale";
import { readStoredUiLocale } from "../lib/ui-locale";
import { useEffect, useState } from "react";

type SiteFooterProps = {
  promise?: string;
  rights?: string;
  /** إخفاء شبكة برامجنا — للبوابة الرئيسية حتى لا تتكرر أيقونات التطبيقات. */
  hidePrograms?: boolean;
  locale?: UiLocale;
};

const FOOTER_COPY = {
  ar: {
    programs: "برامجنا",
    allApps: "كل التطبيقات وشرحها",
    about: "عن الشركة",
    brand: "هوية الشركة",
    apps: "برامجنا",
    privacy: "الخصوصية",
    terms: "الشروط",
    security: "الأمان",
    admin: "دخول الإدارة",
    place: "مسقط · سلطنة عُمان",
    defaultPromise: "ابنِ أحلامًا أكبر.",
    defaultRights: "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
  },
  en: {
    programs: "Our programs",
    allApps: "All apps and guides",
    about: "About",
    brand: "Brand",
    apps: "Programs",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    admin: "Admin sign-in",
    place: "Muscat · Sultanate of Oman",
    defaultPromise: "Build Higher Dreams.",
    defaultRights: "Bin Hamood Development. All rights reserved.",
  },
} as const;

export function SiteFooter({
  promise,
  rights,
  hidePrograms = false,
  locale,
}: SiteFooterProps) {
  const [resolved, setResolved] = useState<UiLocale>(locale || "ar");
  const [origin, setOrigin] = useState("");
  const catalog = useLiveCatalog();

  useEffect(() => {
    setOrigin(window.location.origin);
    if (locale) {
      setResolved(locale);
      return;
    }
    setResolved(readStoredUiLocale() || "ar");
  }, [locale]);

  const t = FOOTER_COPY[resolved];
  const isArabic = resolved === "ar";
  const promiseText = promise ?? t.defaultPromise;
  const rightsText = rights ?? t.defaultRights;
  const programs = catalog.filter((app) => app.enabled && app.id !== "account");

  return (
    <footer className="site-footer" lang={resolved} dir={isArabic ? "rtl" : "ltr"}>
      {!hidePrograms ? (
        <div className="section-wrap footer-programs">
          <div className="footer-programs-head">
            <p>{t.programs}</p>
            <InstantLink href="/apps">{t.allApps}</InstantLink>
          </div>
          <div className="footer-programs-grid">
            {programs.map((app) => {
              const label = isArabic ? app.nameAr : app.nameEn;
              const href = publicUrlForApp(app, origin || undefined);
              const external = href.startsWith("http");
              return external ? (
                <a key={app.id} href={href} className="footer-program" title={label}>
                  <BhdAppIcon
                    id={app.id}
                    title={label}
                    logoUrl={app.logoUrl}
                    mark={app.mark}
                    accent={app.accent}
                    soft={app.soft}
                  />
                  <span>{label}</span>
                </a>
              ) : (
                <InstantLink key={app.id} href={href} className="footer-program" title={label}>
                  <BhdAppIcon
                    id={app.id}
                    title={label}
                    logoUrl={app.logoUrl}
                    mark={app.mark}
                    accent={app.accent}
                    soft={app.soft}
                  />
                  <span>{label}</span>
                </InstantLink>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="section-wrap footer-top">
        <div className="footer-brand">
          <BrandLogo tone="light" className="footer-official-logo" />
        </div>
        <p>{promiseText}</p>
        <div className="footer-links">
          <InstantLink href="/about">{t.about}</InstantLink>
          <InstantLink href="/brand">{t.brand}</InstantLink>
          <InstantLink href="/apps">{t.apps}</InstantLink>
          <InstantLink href="/privacy">{t.privacy}</InstantLink>
          <InstantLink href="/terms">{t.terms}</InstantLink>
          <InstantLink href="/security">{t.security}</InstantLink>
          <a href="/api/auth/admin-entry">{t.admin}</a>
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>© 2026 {rightsText}</span>
        <span>{t.place}</span>
      </div>
    </footer>
  );
}
