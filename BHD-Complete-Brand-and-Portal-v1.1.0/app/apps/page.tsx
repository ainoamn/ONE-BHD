import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";
import { BhdAppIcon } from "../components/bhd/BhdAppIcon";
import { products } from "../lib/products";

export const metadata: Metadata = {
  title: "برامجنا",
  description: "كل تطبيقات بن حمود للتطوير: ماذا تفعل، فوائدها، وكيف تعمل. حساب BHD واحد يفتحها جميعاً.",
};

export default function AppsPage() {
  return (
    <InnerPageShell
      eyebrow="برامجنا"
      title="تطبيقات بن حمود للتطوير في مكان واحد."
      lead="كل برنامج مستقل ببياناته وفواتيره. حساب BHD يفتحها بنفس الهوية البصرية دون خلط المحافظ أو الطلبات."
    >
      <section className="company-brief">
        <p className="section-kicker">نبذة عن الشركة</p>
        <h2>بن حمود للتطوير هو الاسم. ابنِ أحلامًا أكبر هو الوعد.</h2>
        <p>
          من مسقط نبني منتجات عربية واضحة للأفراد والأعمال. الهوية البصرية واحدة: الأخضر العُماني، العربية أولاً، وهدوء التصميم.
          تفاصيل الشركة في <InstantLink href="/about">عن الشركة</InstantLink>
          {" "}ودليل الألوان والشعار في <InstantLink href="/brand">هوية الشركة</InstantLink>.
        </p>
      </section>

      <section className="programs-guide" aria-label="شرح برامج BHD">
        {products.map((product) => (
          <article
            key={product.slug}
            className="program-card"
            style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
          >
            <header>
              <BhdAppIcon id={product.appId} title={product.nameAr} />
              <div>
                <small>{product.categoryAr} · {product.statusAr}</small>
                <h2>{product.nameAr}</h2>
              </div>
            </header>
            <p>{product.descriptionAr}</p>
            <div>
              <p className="program-label">الفوائد</p>
              <ul>
                {product.capabilitiesAr.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="program-label">كيف يعمل</p>
              <p>{product.howAr}</p>
            </div>
            <a href={product.href}>{product.statusEn === "Internal system" ? "مستودع داخلي" : "فتح البرنامج"}</a>
          </article>
        ))}
      </section>
    </InnerPageShell>
  );
}
