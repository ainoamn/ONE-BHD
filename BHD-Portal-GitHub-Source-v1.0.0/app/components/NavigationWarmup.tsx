"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const priorityRoutes = [
  "/products",
  "/products/wazen",
  "/products/hisab",
  "/technology",
  "/about",
  "/security",
  "/apps",
];

export function NavigationWarmup() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      priorityRoutes.forEach((route) => router.prefetch(route));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
