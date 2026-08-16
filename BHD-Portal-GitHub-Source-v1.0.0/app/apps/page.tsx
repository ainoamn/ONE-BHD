import type { Metadata } from "next";
import { InnerPageShell } from "../components/InnerPageShell";
import { products } from "../lib/products";

export const metadata: Metadata = { title: "تطبيقات BHD" };

export default function AppsPage() {
  return (
    <InnerPageShell
      eyebrow="مشغّل تطبيقات BHD"
      title="كل منتجات BHD في مكان واحد."
      lead="اختر التطبيق الذي تريد فتحه. المنتجات التجريبية والمشاريع قيد التطوير موضحة بحالتها الحالية."
    >
      <section className="apps-directory">
        {products.map((product) => (
          <a
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            key={product.slug}
            style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
          >
            <span>{product.mark}</span>
            <div><h2>{product.nameAr}</h2><small>{product.nameAr} · {product.statusAr}</small></div>
            <b aria-hidden="true">←</b>
          </a>
        ))}
      </section>
    </InnerPageShell>
  );
}
