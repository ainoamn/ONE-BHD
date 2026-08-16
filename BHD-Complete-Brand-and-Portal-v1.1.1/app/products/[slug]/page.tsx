import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPageShell } from "../../components/InnerPageShell";
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
    title: `${product.nameAr} — ${product.name}`,
    description: product.descriptionAr,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <InnerPageShell
      eyebrow={`${product.categoryAr} · A BHD Product`}
      title={`${product.nameAr} — ${product.name}`}
      lead={product.descriptionAr}
    >
      <section
        className="product-detail"
        style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
      >
        <div className="product-detail-brand">
          <span>{product.mark}</span>
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
              مستودع GitHub
            </a>
          </div>
        </div>
      </section>
    </InnerPageShell>
  );
}
