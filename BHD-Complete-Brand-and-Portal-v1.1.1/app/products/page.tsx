import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";
import { InstantLink } from "../components/InstantLink";
import { products } from "../lib/products";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تعرّف على منظومة منتجات BHD الرقمية للأفراد والأعمال.",
};

export default function ProductsPage() {
  return (
    <InnerPageShell
      eyebrow="منظومة المنتجات"
      title="منتجات مستقلة تبني أحلامًا أكبر."
      lead="كل منتج يحوّل طموحًا حقيقيًا إلى أداة عملية، وجميعها تحمل وعدًا واحدًا: BHD — Build Higher Dreams."
    >
      <section className="catalog-grid" aria-label="قائمة منتجات BHD">
        {products.map((product, index) => (
          <article
            className="catalog-card"
            key={product.slug}
            style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
          >
            <div className="catalog-card-top">
              <span className="product-mark">{product.mark}</span>
              <span className="product-status"><i />{product.statusAr}</span>
            </div>
            <small>0{index + 1} · {product.categoryAr}</small>
            <h2>{product.nameAr}<span>{product.name}</span></h2>
            <p>{product.descriptionAr}</p>
            <InstantLink href={`/products/${product.slug}`}>تفاصيل المنتج <span aria-hidden="true">←</span></InstantLink>
          </article>
        ))}
      </section>
    </InnerPageShell>
  );
}
