"use client";

import { hopOrigins } from "../lib/bhd/apps";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const priorityRoutes = [
  "/",
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
  "/company",
  "/apps",
];

/** Prefetch only after the user actually uses the page — never on tab restore. */
export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/login" || path.startsWith("/login/") || path.startsWith("/oauth") || path.startsWith("/api/")) return;

    const run = () => {
      priorityRoutes.forEach((route) => router.prefetch(route));
      hopOrigins().forEach((origin) => {
        if (document.head.querySelector(`link[data-bhd-hop="${origin}"]`)) return;
        const pre = document.createElement("link");
        pre.rel = "preconnect";
        pre.href = origin;
        pre.setAttribute("data-bhd-hop", origin);
        document.head.appendChild(pre);
      });
    };

    window.addEventListener("pointerdown", run, { once: true, passive: true });
    window.addEventListener("keydown", run, { once: true });
    return () => {
      window.removeEventListener("pointerdown", run);
      window.removeEventListener("keydown", run);
    };
  }, [router]);

  return null;
}
