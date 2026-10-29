import { publicUrlForApp, type BhdApp } from "./apps";
import { products } from "../products";

/** برامج ظاهرة للعامة: بلا حساب الهوية، مرتبة من الكتالوج الحي. */
export function publicProgramApps(apps: BhdApp[], pageOrigin?: string) {
  return apps
    .filter((app) => app.enabled && app.id !== "account")
    .map((app) => {
      const marketing = products.find((product) => product.appId === app.id || product.slug === app.id);
      return {
        id: app.id,
        nameAr: app.nameAr,
        nameEn: app.nameEn,
        href: publicUrlForApp(app, pageOrigin),
        logoUrl: app.logoUrl || null,
        mark: app.mark,
        accent: app.accent,
        soft: app.soft,
        categoryAr: marketing?.categoryAr || "",
        categoryEn: marketing?.categoryEn || "",
        descriptionAr: marketing?.descriptionAr || "",
        descriptionEn: marketing?.descriptionEn || "",
        statusAr: marketing?.statusAr || (app.enabled ? "متاح الآن" : "قريباً"),
        statusEn: marketing?.statusEn || (app.enabled ? "Available now" : "Soon"),
        capabilitiesAr: marketing?.capabilitiesAr || [],
        capabilitiesEn: marketing?.capabilitiesEn || [],
        howAr: marketing?.howAr || "",
        featured: Boolean(marketing?.featured),
      };
    });
}
