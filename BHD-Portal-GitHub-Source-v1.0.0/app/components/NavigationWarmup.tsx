"use client";

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
    if (window.location.pathname.startsWith("/login")) return;

    const run = () => {
      priorityRoutes.forEach((route) => router.prefetch(route));
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
