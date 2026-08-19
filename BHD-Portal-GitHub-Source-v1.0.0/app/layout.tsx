import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { headers } from "next/headers";
import { NavigationWarmup } from "./components/NavigationWarmup";
import { GoogleOAuthRoot } from "./components/auth/GoogleOAuthRoot";
import { SessionKeepAlive } from "./components/auth/SessionKeepAlive";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const description =
  "BHD — Build Higher Dreams. ابنِ أحلامًا أكبر مع بن حمود للتطوير؛ منتجات وأعمال وتجارب رقمية من عُمان إلى المنطقة.";

async function requestBaseUrl(): Promise<URL> {
  const requestHeaders = await headers();
  const rawHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "bhd-om.com";
  const host = /^[a-z0-9.-]+(?::\d+)?$/i.test(rawHost) ? rawHost : "bhd-om.com";
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProto === "http" && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host) ? "http" : "https";
  return new URL(`${protocol}://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await requestBaseUrl();
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    applicationName: "BHD",
    title: {
      default: "BHD — Build Higher Dreams | Bin Hamood Development",
      template: "%s | BHD",
    },
    description,
    keywords: [
      "Bin Hamood Development",
      "BHD Oman",
      "شركة بن حمود للتطوير",
      "حلول رقمية",
      "Oman technology",
    ],
    openGraph: {
      title: "BHD — Build Higher Dreams",
      description: "ابنِ أحلامًا أكبر مع بن حمود للتطوير.",
      type: "website",
      locale: "ar_OM",
      alternateLocale: "en_US",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "BHD — Build Higher Dreams" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BHD — Build Higher Dreams",
      description: "ابنِ أحلامًا أكبر مع بن حمود للتطوير.",
      images: [socialImage],
    },
    alternates: { canonical: "/" },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/brand/bhd-mark.svg", type: "image/svg+xml" }],
      apple: [{ url: "/brand/bhd-mark-2048.png", type: "image/png" }],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#092d24",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const baseUrl = await requestBaseUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": new URL("/#organization", baseUrl).toString(),
        name: "Bin Hamood Development",
        alternateName: "BHD",
        slogan: "Build Higher Dreams",
        url: baseUrl.toString(),
        logo: new URL("/brand/bhd-logo-4096.png", baseUrl).toString(),
        foundingLocation: { "@type": "Place", name: "Muscat, Sultanate of Oman" },
        sameAs: ["https://github.com/ainoamn"],
      },
      {
        "@type": "WebSite",
        "@id": new URL("/#website", baseUrl).toString(),
        name: "BHD — Build Higher Dreams",
        url: baseUrl.toString(),
        inLanguage: ["ar", "en"],
        publisher: { "@id": new URL("/#organization", baseUrl).toString() },
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl" className={`${plexArabic.variable} ${inter.variable}`}>
      <head>
        <link rel="preload" href="/images/bhd-philosophy-hero.webp" as="image" type="image/webp" />
        <link rel="preload" href="/brand/bhd-logo.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={plexArabic.className}>
        <a className="skip-link" href="#main-content">انتقل إلى المحتوى الرئيسي</a>
        <NavigationWarmup />
        <SessionKeepAlive />
        <GoogleOAuthRoot>
          {children}
        </GoogleOAuthRoot>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
