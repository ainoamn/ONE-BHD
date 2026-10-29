const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";

type AiEndpoint = { url: string; apiKey: string; model: string };

export function resolveAiEndpoint(oidcToken?: string | null): AiEndpoint | null {
  const model = process.env.AI_MODEL?.trim();
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (gatewayKey) {
    return { url: GATEWAY_URL, apiKey: gatewayKey, model: model || "openai/gpt-4.1-mini" };
  }
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    const base = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
    return { url: `${base}/chat/completions`, apiKey: openAiKey, model: model || "gpt-4.1-mini" };
  }
  const oidc = oidcToken?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim();
  if (oidc) return { url: GATEWAY_URL, apiKey: oidc, model: model || "openai/gpt-4.1-mini" };
  return null;
}

export async function aiTranslateNamePair(
  name: string,
  oidcToken?: string | null,
): Promise<{ ar: string; en: string } | null> {
  const endpoint = resolveAiEndpoint(oidcToken);
  if (!endpoint) return null;
  const response = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${endpoint.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: endpoint.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Translate a person or company name between Arabic and English. Return JSON only: {"ar":"...","en":"..."}. Keep it a proper name, not a description.',
        },
        { role: "user", content: name },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}") as { ar?: string; en?: string };
  const ar = parsed.ar?.trim() || "";
  const en = parsed.en?.trim() || "";
  if (!ar || !en) return null;
  return { ar, en };
}
