import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InnerPageShell } from "../../components/InnerPageShell";
import { BhdAppIcon } from "../../components/bhd/BhdAppIcon";
import { getProduct, products } from "../../lib/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.nameAr,
    description: product.descriptionAr,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (slug === "ain-oman") redirect("/products/baitak");
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <InnerPageShell
      eyebrow={`${product.categoryAr} · منتج من منظومة BHD`}
      title={product.nameAr}
      lead={product.descriptionAr}
    >
      <section
        className="product-detail"
        style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
      >
        <div className="product-detail-brand">
          <BhdAppIcon id={product.appId} title={product.nameAr} className="product-detail-logo" />
          <div><small>حالة المنتج</small><strong>{product.statusAr}</strong></div>
        </div>
        <div className="product-detail-copy">
          <p className="section-kicker">ما الذي يقدمه؟</p>
          <h2>منتج عملي لمشكلة حقيقية.</h2>
          <ul>
            {product.capabilitiesAr.map((capability) => (
              <li key={capability}><span>✓</span>{capability}</li>
            ))}
          </ul>
          <div className="detail-actions">
            <a className="primary-button" href={product.href} target="_blank" rel="noopener noreferrer">
              فتح المنتج <span aria-hidden="true">←</span>
            </a>
            <a className="text-button" href={product.repository} target="_blank" rel="noopener noreferrer">
              مستودع المشروع
            </a>
          </div>
        </div>
      </section>
    </InnerPageShell>
  );
}
