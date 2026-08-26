export type UiLocale = "ar" | "en";

export const UI_LOCALE_KEY = "bhd-ui-locale";

export function isUiLocale(value: unknown): value is UiLocale {
  return value === "ar" || value === "en";
}

export function readStoredUiLocale(): UiLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(UI_LOCALE_KEY);
    return isUiLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredUiLocale(locale: UiLocale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UI_LOCALE_KEY, locale);
  } catch {
    /* ignore quota / private mode */
  }
}

export function applyDocumentLocale(locale: UiLocale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}
