export type TranslatedName = { ar: string; en: string };

function hasArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

function hasLatin(value: string) {
  return /[A-Za-z]/.test(value);
}

async function openaiTranslate(name: string): Promise<TranslatedName | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
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
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("TRANSLATE_FAILED");
  const data = (await response.json()) as Array<Array<[string]>>;
  return (data[0] || []).map((part) => part[0]).join("").trim();
}

export async function translatePersonName(name: string): Promise<TranslatedName> {
  const source = name.trim();
  if (!source) throw new Error("INVALID_INPUT");
  const viaOpenAi = await openaiTranslate(source).catch(() => null);
  if (viaOpenAi) return viaOpenAi;

  const arabic = hasArabic(source);
  const latin = hasLatin(source);
  if (arabic && !latin) {
    return { ar: source, en: await gtxTranslate(source, "en") };
  }
  if (latin && !arabic) {
    return { ar: await gtxTranslate(source, "ar"), en: source };
  }
  return {
    ar: arabic ? source : await gtxTranslate(source, "ar"),
    en: latin ? source : await gtxTranslate(source, "en"),
  };
}
