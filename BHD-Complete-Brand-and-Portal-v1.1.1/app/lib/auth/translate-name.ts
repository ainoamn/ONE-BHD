import { aiTranslateNamePair } from "./ai-name";
import { machineTranslate } from "./machine-translate";
import { hasArabic, hasLatin } from "./name-transliterate";

export type TranslatedName = { ar: string; en: string };

export async function translatePersonName(
  name: string,
  oidcToken?: string | null,
): Promise<TranslatedName> {
  const source = name.trim();
  if (!source) throw new Error("INVALID_INPUT");

  const viaAi = await aiTranslateNamePair(source, oidcToken).catch(() => null);
  if (viaAi?.ar && viaAi.en) return viaAi;

  const arabic = hasArabic(source);
  const latin = hasLatin(source);
  if (arabic && !latin) {
    const en = await machineTranslate(source, "en");
    if (en) return { ar: source, en };
  } else if (latin && !arabic) {
    const ar = await machineTranslate(source, "ar");
    if (ar) return { ar, en: source };
  } else {
    const [ar, en] = await Promise.all([
      arabic ? Promise.resolve(source) : machineTranslate(source, "ar"),
      latin ? Promise.resolve(source) : machineTranslate(source, "en"),
    ]);
    if (ar && en) return { ar, en };
  }

  throw new Error("TRANSLATE_FAILED");
}
