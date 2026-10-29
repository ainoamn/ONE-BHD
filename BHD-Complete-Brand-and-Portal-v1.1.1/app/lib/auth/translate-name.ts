import { hasArabic, hasLatin, localNamePair } from "./name-transliterate";

export type TranslatedName = { ar: string; en: string };

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("TRANSLATE_HTTP");
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function openaiTranslate(name: string): Promise<TranslatedName | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const payload = (await fetchJson("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_NAME_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Translate a person\'s full name between Arabic and English. Return JSON only: {"ar":"...","en":"..."}. Keep it a proper name, not a description.',
        },
        { role: "user", content: name },
      ],
    }),
  })) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = payload.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(raw) as { ar?: string; en?: string };
  const ar = parsed.ar?.trim() || "";
  const en = parsed.en?.trim() || "";
  if (!ar || !en) return null;
  return { ar, en };
}

async function gtxTranslate(text: string, target: "ar" | "en"): Promise<string> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", target);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const data = (await fetchJson(url.toString())) as Array<Array<[string]>>;
  return (data[0] || []).map((part) => part[0]).join("").trim();
}

async function memoryTranslate(text: string, pair: "en|ar" | "ar|en"): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", pair);
  const data = (await fetchJson(url.toString())) as { responseData?: { translatedText?: string } };
  const translated = data.responseData?.translatedText?.trim() || "";
  if (!translated || translated.toLowerCase() === text.toLowerCase()) throw new Error("MEMORY_EMPTY");
  return translated;
}

async function onlinePair(source: string): Promise<TranslatedName | null> {
  const arabic = hasArabic(source);
  const latin = hasLatin(source);
  try {
    if (arabic && !latin) return { ar: source, en: await gtxTranslate(source, "en") };
    if (latin && !arabic) return { ar: await gtxTranslate(source, "ar"), en: source };
    return {
      ar: arabic ? source : await gtxTranslate(source, "ar"),
      en: latin ? source : await gtxTranslate(source, "en"),
    };
  } catch {
    try {
      if (arabic && !latin) return { ar: source, en: await memoryTranslate(source, "ar|en") };
      if (latin && !arabic) return { ar: await memoryTranslate(source, "en|ar"), en: source };
    } catch {
      return null;
    }
  }
  return null;
}

export async function translatePersonName(name: string): Promise<TranslatedName> {
  const source = name.trim();
  if (!source) throw new Error("INVALID_INPUT");
  const viaOpenAi = await openaiTranslate(source).catch(() => null);
  if (viaOpenAi?.ar && viaOpenAi.en) return viaOpenAi;
  const viaOnline = await onlinePair(source).catch(() => null);
  if (viaOnline?.ar && viaOnline.en) return viaOnline;
  return localNamePair(source);
}
