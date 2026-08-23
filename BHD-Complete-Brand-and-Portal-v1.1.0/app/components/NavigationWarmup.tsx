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
  "/apps",
  "/login",
  "/account",
];

export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      priorityRoutes.forEach((route) => router.prefetch(route));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
