import type { MetadataRoute } from "next";
import { products } from "./lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bhd-om.com";
  const staticPages = ["", "/products", "/about", "/technology", "/contact", "/privacy", "/terms", "/security", "/apps"];
  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date("2026-08-16"),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date("2026-08-16"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
