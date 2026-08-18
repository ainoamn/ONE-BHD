import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";
import { InstantLink } from "./InstantLink";
import { SessionMenu } from "./auth/SessionMenu";

type InnerPageShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

const navItems = [
  ["الرئيسية", "/"],
  ["المنتجات", "/products"],
  ["التقنية", "/technology"],
  ["الهوية", "/brand"],
  ["الشركة", "/about"],
  ["الأمان", "/security"],
  ["التواصل", "/contact"],
];

export function InnerPageShell({ eyebrow, title, lead, children }: InnerPageShellProps) {
  return (
    <main id="main-content" className="inner-shell" dir="rtl" tabIndex={-1}>
      <div className="flag-line" aria-hidden="true" />
      <header className="inner-header section-wrap">
        <InstantLink className="brand" href="/" aria-label="العودة إلى الرئيسية">
          <BrandLogo className="header-official-logo" />
        </InstantLink>
        <nav aria-label="التنقل الرئيسي">
          {navItems.map(([label, href]) => (
            <InstantLink key={href} href={href}>{label}</InstantLink>
          ))}
        </nav>
        <details className="inner-mobile-nav">
          <summary aria-label="فتح قائمة التنقل">
            <span aria-hidden="true"><i /><i /><i /></span>
            القائمة
          </summary>
          <div className="inner-mobile-nav-panel">
            {navItems.map(([label, href]) => (
              <InstantLink key={href} href={href}>{label}</InstantLink>
            ))}
          </div>
        </details>
        <div className="inner-header-end">
          <SessionMenu signInLabel="دخول" />
        </div>
      </header>

      <section className="inner-hero">
        <div className="inner-hero-image" aria-hidden="true" />
        <div className="inner-hero-overlay" aria-hidden="true" />
        <div className="section-wrap inner-hero-content">
          <p className="eyebrow"><span />{eyebrow}</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </section>

      <div className="inner-content section-wrap">{children}</div>

      <footer className="site-footer inner-footer">
        <div className="section-wrap footer-top">
          <div className="footer-brand">
            <BrandLogo tone="light" className="footer-official-logo" />
          </div>
          <p>ابنِ أحلامًا أكبر.</p>
          <div className="footer-links">
            <InstantLink href="/privacy">الخصوصية</InstantLink>
            <InstantLink href="/terms">الشروط</InstantLink>
            <InstantLink href="/security">الأمان</InstantLink>
            <InstantLink href="/brand">دليل الهوية</InstantLink>
          </div>
        </div>
        <div className="section-wrap footer-bottom">
          <span>© 2026 شركة بن حمود للتطوير. جميع الحقوق محفوظة.</span>
          <span>مسقط · سلطنة عُمان</span>
        </div>
      </footer>
    </main>
  );
}
