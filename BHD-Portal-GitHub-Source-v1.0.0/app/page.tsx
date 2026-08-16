"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BhdAdvisor } from "./components/BhdAdvisor";
import { BrandLogo } from "./components/BrandLogo";
import { InstantLink } from "./components/InstantLink";
import { products } from "./lib/products";

type Language = "ar" | "en";

const copy = {
  ar: {
    nav: ["الرئيسية", "المنتجات", "الفلسفة", "رؤيتنا", "الشركة"],
    eyebrow: "BIN HAMOOD DEVELOPMENT · BUILD HIGHER DREAMS",
    titleTop: "من عُمان، نبني",
    titleBottom: "المستقبل الرقمي للأفراد والأعمال.",
    lead:
      "في بن حمود للتطوير لا نكتفي ببناء المنتجات؛ نبني التقنية والأعمال والتجارب التي تساعد الأفراد والشركات على رفع سقف طموحاتهم وتحويلها إلى واقع.",
    primaryCta: "اكتشف فلسفتنا",
    secondaryCta: "استكشف منتجاتنا",
    trust: "نبني بوضوح",
    trust2: "نطمح إلى مستوى أعلى",
    trust3: "نحوّل الحلم إلى واقع",
    ecosystem: "منظومة BHD",
    oneAccount: "حساب واحد",
    everyProduct: "لكل منتجات BHD",
    connected: "متصلة عبر هوية BHD",
    statProducts: "BUILD · نبني",
    statIdentity: "HIGHER · نرتقي",
    statDirection: "DREAMS · نحقق",
    productsEyebrow: "منتجاتنا الرقمية",
    productsTitle: "كل منتج يبدأ بحلم يستحق البناء.",
    productsLead:
      "من المال والأعمال إلى العائلة والعقار والتجارة؛ نحول الطموحات اليومية إلى منتجات مستقلة تحمل وعد BHD: Build Higher Dreams.",
    open: "فتح المنتج",
    explore: "استكشف المشروع",
    bhdProduct: "A BHD Product",
    architectureEyebrow: "BHD Ecosystem",
    architectureTitle: "منفصلة هندسيًا، موحّدة في التجربة.",
    architectureLead:
      "كل تطبيق يملك مستودعه ونشره وبياناته، بينما تجمعها هوية BHD ومشغّل تطبيقات واحد. هذا يمنح كل منتج حرية التطور دون أن يفقد المستخدم إحساس المنظومة.",
    appLayer: "طبقة التطبيقات",
    identityLayer: "هوية BHD",
    accountLayer: "حساب BHD",
    portalLayer: "بوابة BHD",
    architectureNote: "تنقّل موحّد · دخول آمن · بيانات كل تطبيق تبقى مستقلة",
    accountEyebrow: "قريبًا · BHD Account",
    accountTitle: "حساب واحد يرافقك بين كل المنتجات.",
    accountLead:
      "سجّل الدخول مرة واحدة، ثم افتح وازن أو حسابي أو نَسَب دون تكرار خطوات الدخول — مع جلسة آمنة ومستقلة داخل كل تطبيق.",
    accountPoints: [
      "هوية مركزية بمعيار OpenID Connect",
      "لا مشاركة لقواعد البيانات بين التطبيقات",
      "الصلاحيات التشغيلية تبقى داخل كل منتج",
    ],
    visionEyebrow: "هويتنا",
    visionTitle: "جذور عُمانية. طموح يتجاوز الحدود.",
    visionLead:
      "نستوحي هدوء التصميم ودقته من عُمان، ونبني بمعايير تجعل منتجاتنا جاهزة للخليج والعالم.",
    visionCards: [
      ["عربي أولًا", "واجهات واضحة تراعي اللغة والاتجاه والسياق المحلي من أول سطر."],
      ["الأمان من البداية", "نفصل الهوية والبيانات والصلاحيات كي تنمو المنظومة بثقة."],
      ["نبني للنمو", "كل منتج مستقل، قابل للتوسع، وقادر على التطور في مساره الخاص."],
    ],
    companyEyebrow: "ONE NAME · ONE PROMISE",
    companyTitle: "Bin Hamood Development هو الاسم. Build Higher Dreams هو الوعد.",
    companyLead:
      "ابنِ أحلامًا أكبر مع بن حمود للتطوير؛ علامة عُمانية تحوّل الأفكار إلى منتجات وأعمال وتجارب قادرة على النمو.",
    companyCta: "تعرّف على مشاريعنا",
    footerLine: "BUILD HIGHER DREAMS · ابنِ أحلامًا أكبر.",
    rights: "شركة بن حمود للتطوير. جميع الحقوق محفوظة.",
    apps: "تطبيقات BHD",
    menu: "القائمة",
    close: "إغلاق",
  },
  en: {
    nav: ["Home", "Products", "Philosophy", "Vision", "Company"],
    eyebrow: "BIN HAMOOD DEVELOPMENT · AN OMANI BRAND",
    titleTop: "From Oman, we build",
    titleBottom: "digital products for life and business.",
    lead:
      "At Bin Hamood Development, we build technology, businesses and experiences that help people and companies aim higher — then turn ambition into reality.",
    primaryCta: "Discover our philosophy",
    secondaryCta: "Explore our products",
    trust: "Build with purpose",
    trust2: "Aim higher",
    trust3: "Turn dreams into reality",
    ecosystem: "BHD Ecosystem",
    oneAccount: "One account",
    everyProduct: "for every BHD product",
    connected: "Connected by BHD Identity",
    statProducts: "BUILD · Create",
    statIdentity: "HIGHER · Elevate",
    statDirection: "DREAMS · Realize",
    productsEyebrow: "Our digital products",
    productsTitle: "Every product starts with a dream worth building.",
    productsLead:
      "From money and business to family, property and commerce, every independent product carries one BHD promise: Build Higher Dreams.",
    open: "Open product",
    explore: "Explore project",
    bhdProduct: "A BHD Product",
    architectureEyebrow: "BHD Ecosystem",
    architectureTitle: "Independent by design. Unified by experience.",
    architectureLead:
      "Every app owns its code, deployment and data, while BHD Identity and a shared app launcher bring them together without limiting how each product grows.",
    appLayer: "Application layer",
    identityLayer: "BHD Identity",
    accountLayer: "BHD Account",
    portalLayer: "BHD Portal",
    architectureNote: "Unified navigation · Secure sign-in · Independent product data",
    accountEyebrow: "Coming soon · BHD Account",
    accountTitle: "One account that moves with you.",
    accountLead:
      "Sign in once, then move between WAZEN, HISAB and NASAB without repeating the journey — with a secure local session inside every product.",
    accountPoints: [
      "Central identity built on OpenID Connect",
      "No shared operational databases",
      "Product roles remain within each app",
    ],
    visionEyebrow: "Our character",
    visionTitle: "Omani roots. Ambition beyond borders.",
    visionLead:
      "We draw calm and precision from Oman, then build to standards that prepare our products for the Gulf and the world.",
    visionCards: [
      ["Arabic first", "Clear interfaces shaped around language, direction and local context from day one."],
      ["Secure by design", "Identity, data and permissions are separated so the ecosystem can grow with confidence."],
      ["Built to grow", "Every product is independent, scalable and free to evolve on its own path."],
    ],
    companyEyebrow: "ONE NAME · ONE PROMISE",
    companyTitle: "Bin Hamood Development is the name. Build Higher Dreams is the promise.",
    companyLead:
      "Build higher dreams with Bin Hamood Development — an Omani brand turning ideas into products, businesses and experiences designed to grow.",
    companyCta: "Meet our projects",
    footerLine: "BUILD HIGHER DREAMS · Our promise to every ambition.",
    rights: "Bin Hamood Development. All rights reserved.",
    apps: "BHD Apps",
    menu: "Menu",
    close: "Close",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const t = copy[language];
  const isArabic = language === "ar";

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        launcherRef.current &&
        !launcherRef.current.contains(event.target as Node)
      ) {
        setLauncherOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const sectionLinks = ["/", "/products", "/#philosophy", "/#vision", "/about"];

  return (
    <main id="main-content" className="site-shell" lang={language} dir={isArabic ? "rtl" : "ltr"} tabIndex={-1}>
      <div className="flag-line" aria-hidden="true" />

      <header className="site-header">
        <InstantLink className="brand" href="/" aria-label="BHD home">
          <BrandLogo className="header-official-logo" />
        </InstantLink>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {t.nav.map((item, index) => (
            <InstantLink key={item} href={sectionLinks[index]}>
              {item}
            </InstantLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="language-button"
            onClick={() => setLanguage(isArabic ? "en" : "ar")}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "EN" : "عربي"}
          </button>

          <div className="app-launcher-wrap" ref={launcherRef}>
            <button
              className="launcher-button"
              onClick={() => setLauncherOpen((open) => !open)}
              aria-expanded={launcherOpen}
              aria-haspopup="menu"
            >
              <span className="grid-icon" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, index) => (
                  <i key={index} />
                ))}
              </span>
              <span>{t.apps}</span>
            </button>

            {launcherOpen && (
              <div className="launcher-panel" role="menu">
                <div className="launcher-heading">
                  <span>{t.apps}</span>
                  <small>BHD ECOSYSTEM</small>
                </div>
                <div className="launcher-grid">
                  {products.slice(0, 5).map((product) => (
                    <a
                      key={product.name}
                      href={product.href}
                      role="menuitem"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span
                        className="launcher-mark"
                        style={{ background: product.soft, color: product.accent }}
                      >
                        {product.mark}
                      </span>
                      <span>{isArabic ? product.nameAr : product.name}</span>
                    </a>
                  ))}
                </div>
                <InstantLink className="launcher-all" href="/products" onClick={() => setLauncherOpen(false)}>
                  {isArabic ? "عرض جميع المنتجات" : "View all products"}
                  <span aria-hidden="true">←</span>
                </InstantLink>
              </div>
            )}
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.close : t.menu}
          >
            <span />
            <span />
          </button>
        </div>

        {mobileOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {t.nav.map((item, index) => (
              <InstantLink key={item} href={sectionLinks[index]} onClick={() => setMobileOpen(false)}>
                {item}
              </InstantLink>
            ))}
          </nav>
        )}
      </header>

      <section className="hero" id="home">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-inner section-wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span />{t.eyebrow}</p>
            <h1 className="brand-promise" aria-label="Build Higher Dreams">
              <span><b>B</b>UILD.</span>
              <span><b>H</b>IGHER.</span>
              <span><b>D</b>REAMS.</span>
            </h1>
            <p className="promise-translation">
              {isArabic ? "ابنِ أحلامًا أكبر مع بن حمود للتطوير." : "Bin Hamood Development · One name, one promise."}
            </p>
            <p className="hero-lead">{t.lead}</p>
            <div className="hero-actions">
              <InstantLink className="primary-button" href="/#philosophy">
                {t.primaryCta}
                <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
              </InstantLink>
              <InstantLink className="text-button" href="/products">
                {t.secondaryCta}
              </InstantLink>
            </div>
            <div className="trust-row" aria-label="BHD qualities">
              {[t.trust, t.trust2, t.trust3].map((item) => (
                <span key={item}><i />{item}</span>
              ))}
            </div>
          </div>

          <div className="hero-brand-stage" aria-label="هوية شركة بن حمود للتطوير">
            <div className="hero-brand-halo" aria-hidden="true" />
            <figure className="hero-brand-image">
              <Image
                src="/images/bhd-philosophy-hero.webp"
                alt="هوية شركة بن حمود للتطوير المستوحاة من العمارة العُمانية"
                width={1200}
                height={630}
                sizes="(max-width: 820px) 92vw, 520px"
                priority
              />
              <span className="hero-official-seal" aria-hidden="true">
                <BrandLogo kind="mark" tone="light" />
              </span>
            </figure>
            <div className="brand-float brand-float-products">
              <strong>06</strong>
              <small>{t.statProducts}</small>
            </div>
            <div className="brand-float brand-float-location">
              <i aria-hidden="true" />
              <span>MUSCAT · OMAN</span>
            </div>
            <div className="brand-stage-caption">
              <BrandLogo kind="mark" tone="ink" />
              <p>{t.ecosystem}<small>ONE FAMILY · ONE STANDARD</small></p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band" aria-label="BHD at a glance">
        <div className="section-wrap stats-grid">
          <div><strong>B</strong><span>{t.statProducts}</span></div>
          <div><strong>H</strong><span>{t.statIdentity}</span></div>
          <div><strong>D</strong><span>{t.statDirection}</span></div>
        </div>
      </section>

      <section className="brand-philosophy" id="philosophy">
        <div className="section-wrap philosophy-grid">
          <div className="philosophy-manifesto">
            <p className="section-kicker light">BHD BRAND PHILOSOPHY</p>
            <h2>{isArabic ? "علامة واحدة. معنيان يصنعان قصة واحدة." : "One brand. Two meanings. One story."}</h2>
            <p>
              {isArabic
                ? "BHD هو اسمنا المؤسسي ووعدنا الإنساني في الوقت نفسه. بن حمود للتطوير هي الجهة التي تبني، وBuild Higher Dreams هو السبب الذي نبني من أجله."
                : "BHD is both our corporate name and our human promise. Bin Hamood Development is who builds; Build Higher Dreams is why we build."}
            </p>
            <div className="dual-meaning" dir="ltr">
              <span><b>BHD</b><small>BIN HAMOOD DEVELOPMENT</small></span>
              <i aria-hidden="true">=</i>
              <span><b>BHD</b><small>BUILD HIGHER DREAMS</small></span>
            </div>
            <blockquote>
              {isArabic ? "«لا نكتفي بتحقيق الحلم؛ نرفع سقف الحلم نفسه.»" : "“We do not only realize dreams. We raise the horizon of what can be dreamed.”"}
            </blockquote>
          </div>

          <div className="philosophy-principles">
            <article>
              <span>B</span>
              <div><small>BUILD · نبني</small><h3>{isArabic ? "نحوّل الفكرة إلى شيء حقيقي." : "Turn ideas into something real."}</h3><p>{isArabic ? "نبني المنتجات والأعمال والفرص بتصميم واضح وهندسة قابلة للنمو." : "We build products, businesses and opportunities with clear design and scalable engineering."}</p></div>
            </article>
            <article>
              <span>H</span>
              <div><small>HIGHER · نرتقي</small><h3>{isArabic ? "نرفع المعيار في كل مرة." : "Raise the standard every time."}</h3><p>{isArabic ? "نطمح إلى تقنية أفضل، وخدمة أرقى، وتجربة أوضح، ونتائج أبعد." : "We aim for better technology, finer service, clearer experiences and greater outcomes."}</p></div>
            </article>
            <article>
              <span>D</span>
              <div><small>DREAMS · الأحلام</small><h3>{isArabic ? "نمنح الطموح طريقًا إلى الواقع." : "Give ambition a path to reality."}</h3><p>{isArabic ? "للأفراد والعائلات والشركات والمجتمع؛ كل حلم جاد يستحق فرصة أن يُبنى." : "For people, families, businesses and society — every serious dream deserves the chance to be built."}</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="products-section section-wrap" id="products">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
          </div>
          <p>{t.productsLead}</p>
        </div>

        <div className="products-grid">
          {products.map((product, index) => {
            const isLive = product.statusEn !== "In development" && product.statusEn !== "Internal system";
            return (
              <article
                key={product.name}
                className={`product-card ${product.featured ? "product-featured" : ""}`}
                style={{
                  "--accent": product.accent,
                  "--soft": product.soft,
                } as React.CSSProperties}
              >
                <div className="product-card-head">
                  <span className="product-mark">{product.mark}</span>
                  <span className="product-status"><i />{isArabic ? product.statusAr : product.statusEn}</span>
                </div>
                <div className="product-number">0{index + 1}</div>
                <p className="product-category">{isArabic ? product.categoryAr : product.categoryEn}</p>
                <h3>
                  {isArabic ? product.nameAr : product.name}
                  <small>{isArabic ? product.name : product.nameAr}</small>
                </h3>
                <p className="product-description">
                  {isArabic ? product.descriptionAr : product.descriptionEn}
                </p>
                <div className="product-card-footer">
                  <a href={product.href} target="_blank" rel="noopener noreferrer">
                    {isLive ? t.open : t.explore}
                    <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
                  </a>
                  <small>{t.bhdProduct}</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="architecture-section" id="ecosystem">
        <div className="section-wrap architecture-grid">
          <div className="architecture-copy">
            <p className="section-kicker light">{t.architectureEyebrow}</p>
            <h2>{t.architectureTitle}</h2>
            <p>{t.architectureLead}</p>
            <div className="architecture-note">
              <span className="note-lock">B</span>
              <span>{t.architectureNote}</span>
            </div>
          </div>

          <div className="architecture-map" aria-label="BHD ecosystem architecture">
            <div className="map-apps">
              <small>{t.appLayer}</small>
              <div>
                {products.slice(0, 5).map((product) => (
                  <span key={product.name} style={{ "--app-color": product.accent } as React.CSSProperties}>
                    {product.mark}
                  </span>
                ))}
              </div>
            </div>
            <i className="map-line" />
            <div className="map-middle">
              <div><span>ID</span><strong>{t.identityLayer}</strong><small>OIDC · SSO</small></div>
              <div><span>AC</span><strong>{t.accountLayer}</strong><small>PROFILE · SECURITY</small></div>
            </div>
            <i className="map-line short" />
            <div className="map-portal"><span>B</span><div><strong>{t.portalLayer}</strong><small>BHD-OM.COM</small></div></div>
          </div>
        </div>
      </section>

      <section className="account-section section-wrap">
        <div className="account-visual" aria-hidden="true">
          <div className="account-phone">
            <div className="phone-top"><span>B</span><small>BHD ACCOUNT</small></div>
            <div className="profile-ring">BH</div>
            <strong>Abdul Hamid</strong>
            <small>Personal BHD Account</small>
            <div className="phone-apps">
              {products.slice(0, 4).map((product) => (
                <span key={product.name} style={{ background: product.soft, color: product.accent }}>{product.mark}</span>
              ))}
            </div>
            <div className="phone-secure"><i /> Secure session</div>
          </div>
          <div className="account-glow" />
        </div>

        <div className="account-copy">
          <p className="section-kicker">{t.accountEyebrow}</p>
          <h2>{t.accountTitle}</h2>
          <p>{t.accountLead}</p>
          <ul>
            {t.accountPoints.map((point) => (
              <li key={point}><span>✓</span>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vision-section" id="vision">
        <div className="vision-image" aria-hidden="true" />
        <div className="vision-overlay" aria-hidden="true" />
        <div className="section-wrap vision-inner">
          <div className="vision-heading">
            <p className="section-kicker light">{t.visionEyebrow}</p>
            <h2>{t.visionTitle}</h2>
            <p>{t.visionLead}</p>
          </div>
          <div className="vision-cards">
            {t.visionCards.map(([title, description], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="company-section section-wrap" id="company">
        <div className="company-monogram" aria-hidden="true">
          <BrandLogo kind="mark" tone="ink" className="company-official-mark" />
        </div>
        <div className="company-copy">
          <p className="section-kicker">{t.companyEyebrow}</p>
          <h2>{t.companyTitle}</h2>
          <p>{t.companyLead}</p>
          <InstantLink href="/products" className="outline-button">
            {t.companyCta}
            <span aria-hidden="true">{isArabic ? "←" : "→"}</span>
          </InstantLink>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-wrap footer-top">
          <div className="footer-brand">
            <BrandLogo tone="light" className="footer-official-logo" />
          </div>
          <p>{t.footerLine}</p>
          <div className="footer-links">
            <InstantLink href="/products">{t.nav[1]}</InstantLink>
            <InstantLink href="/#vision">{t.nav[3]}</InstantLink>
            <InstantLink href="/security">{isArabic ? "الأمان" : "Security"}</InstantLink>
            <a href="https://github.com/ainoamn" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        <div className="section-wrap footer-bottom">
          <span>© 2026 {t.rights}</span>
          <span>Muscat · Sultanate of Oman</span>
        </div>
      </footer>
      <BhdAdvisor />
    </main>
  );
}
