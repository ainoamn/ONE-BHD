"use client";

import { hopOrigins, hopUrls } from "../lib/bhd/apps";
import { DEFAULT_IDENTITY_ISSUER } from "../lib/identity/issuer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const sameOriginRoutes = [
  "/",
  "/company",
  "/products",
  "/products/wazen",
  "/products/hisab",
  "/products/nasab",
  "/products/bhd-r",
  "/products/bhd-store",
  "/products/bhd-hr",
  "/technology",
  "/brand",
  "/about",
  "/security",
  "/privacy",
  "/terms",
  "/contact",
  "/apps",
  "/account",
];

function addLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const key = `${rel}:${href}`;
  if (document.head.querySelector(`[data-bhd-warm="${key}"]`)) return;
  const node = document.createElement("link");
  node.rel = rel;
  node.href = href;
  node.setAttribute("data-bhd-warm", key);
  Object.entries(extra).forEach(([name, value]) => node.setAttribute(name, value));
  document.head.appendChild(node);
}

function addSpeculation(pageOrigin: string) {
  if (document.getElementById("bhd-speculation")) return;
  const same = sameOriginRoutes.map((path) => new URL(path, pageOrigin).toString());
  const cross = hopUrls(pageOrigin).filter((url) => {
    try {
      return new URL(url, pageOrigin).origin !== pageOrigin;
    } catch {
      return false;
    }
  });
  const script = document.createElement("script");
  script.id = "bhd-speculation";
  script.type = "speculationrules";
  script.textContent = JSON.stringify({
    prerender: [{ source: "list", urls: same, eagerness: "immediate" }],
    prefetch: [
      { source: "list", urls: same, eagerness: "immediate" },
      { source: "list", urls: cross, eagerness: "immediate" },
    ],
  });
  document.head.appendChild(script);
}

/** يسخّن صفحات البوابة والهوية ومواقع المجموعة فور فتح أي صفحة. */
export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/oauth") || path.startsWith("/api/")) return;

    const run = () => {
      const origin = window.location.origin.replace(/\/$/, "");
      sameOriginRoutes.forEach((route) => router.prefetch(route));
      hopOrigins().forEach((item) => {
        addLink("dns-prefetch", item);
        addLink("preconnect", item);
      });
      addLink("preconnect", "https://accounts.google.com");
      addLink("preconnect", "https://www.facebook.com");
      hopUrls(origin).forEach((url) => {
        if (url.startsWith("/")) return;
        addLink("prefetch", url, { as: "document" });
      });
      if (origin !== DEFAULT_IDENTITY_ISSUER) {
        addLink("prefetch", `${DEFAULT_IDENTITY_ISSUER}/account`, { as: "document" });
      }
      addSpeculation(origin);
    };

    const idle = window.requestIdleCallback?.(run, { timeout: 400 });
    if (idle == null) {
      const timer = window.setTimeout(run, 0);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [router]);

  return null;
}
