import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/login", "/callback", "/admin", "/oauth", "/account"] }],
    sitemap: "https://bhd-om.com/sitemap.xml",
  };
}
