"use client";

import { useEffect, useState } from "react";
import { BHD_APPS, type BhdApp } from "./apps";
import { DEFAULT_IDENTITY_ISSUER } from "../identity/issuer";

export function catalogUrl() {
  if (typeof window === "undefined") return `${DEFAULT_IDENTITY_ISSUER}/api/bhd/catalog`;
  const here = window.location.origin.replace(/\/$/, "");
  if (here === DEFAULT_IDENTITY_ISSUER || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(here)) {
    return "/api/bhd/catalog";
  }
  return `${DEFAULT_IDENTITY_ISSUER}/api/bhd/catalog`;
}

export function useLiveCatalog() {
  const [apps, setApps] = useState<BhdApp[]>(BHD_APPS);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch(catalogUrl(), { cache: "no-store" })
        .then((response) => response.json())
        .then((data: { apps?: BhdApp[] }) => {
          if (!cancelled && Array.isArray(data.apps) && data.apps.length) setApps(data.apps);
        })
        .catch(() => undefined);
    }
    load();
    const timer = window.setInterval(load, 20_000);
    const onCatalog = (event: Event) => {
      const detail = (event as CustomEvent<BhdApp[]>).detail;
      if (Array.isArray(detail) && detail.length) setApps(detail);
    };
    window.addEventListener("bhd-catalog", onCatalog);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("bhd-catalog", onCatalog);
    };
  }, []);

  return apps;
}
