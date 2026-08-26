"use client";

import { BrandLogo } from "./BrandLogo";
import { InstantLink } from "./InstantLink";
import { BhdAppIcon } from "./bhd/BhdAppIcon";
import { isExternalProductHref, products } from "../lib/products";

type SiteFooterProps = {
  promise?: string;
  rights?: string;
  /** إخفاء شبكة برامجنا — للبوابة الرئيسية حتى لا تتكرر أيقونات التطبيقات. */
  hidePrograms?: boolean;
};

export function SiteFooter({
  promise = "ابنِ أحلامًا أكبر.",
  rights = "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
  hidePrograms = false,
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      {!hidePrograms ? (
      <div className="section-wrap footer-programs">
        <div className="footer-programs-head">
          <p>برامجنا</p>
          <InstantLink href="/apps">كل التطبيقات وشرحها</InstantLink>
        </div>
        <div className="footer-programs-grid">
          {products.map((product) =>
            isExternalProductHref(product.href) ? (
              <a
                key={product.slug}
                href={product.href}
                className="footer-program"
                title={product.nameAr}
              >
                <BhdAppIcon id={product.appId} title={product.nameAr} />
                <span>{product.nameAr}</span>
              </a>
            ) : (
              <InstantLink
                key={product.slug}
                href={product.href}
                className="footer-program"
                title={product.nameAr}
              >
                <BhdAppIcon id={product.appId} title={product.nameAr} />
                <span>{product.nameAr}</span>
              </InstantLink>
            ),
          )}
        </div>
      </div>
      ) : null}
      <div className="section-wrap footer-top">
        <div className="footer-brand">
          <BrandLogo tone="light" className="footer-official-logo" />
        </div>
        <p>{promise}</p>
        <div className="footer-links">
          <InstantLink href="/about">عن الشركة</InstantLink>
          <InstantLink href="/brand">هوية الشركة</InstantLink>
          <InstantLink href="/apps">برامجنا</InstantLink>
          <InstantLink href="/privacy">الخصوصية</InstantLink>
          <InstantLink href="/terms">الشروط</InstantLink>
          <InstantLink href="/security">الأمان</InstantLink>
          <a href="/api/auth/admin-entry">دخول الإدارة</a>
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>© 2026 {rights}</span>
        <span>مسقط · سلطنة عُمان</span>
      </div>
    </footer>
  );
}
