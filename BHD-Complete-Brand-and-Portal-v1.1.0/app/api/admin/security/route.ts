import { NextResponse } from "next/server";
import { authSecret, googleClientId, isFacebookAuthConfigured } from "../../../lib/auth/config";
import { isResendConfigured } from "../../../lib/auth/email-verification";
import { platformAdminEmails, requirePlatformAdmin } from "../../../lib/auth/platform-admin";
import { buildAuditChecks, listSecurityFeed } from "../../../lib/auth/security";
import { resolveAiEndpoint } from "../../../lib/auth/ai-name";
import { isDatabaseConfigured } from "../../../../db";

export const runtime = "nodejs";
export const maxDuration = 30;

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const feed = await listSecurityFeed();
  const audit = buildAuditChecks({
    authSecret: Boolean(authSecret()),
    database: isDatabaseConfigured(),
    google: Boolean(googleClientId()),
    facebook: isFacebookAuthConfigured(),
    resend: isResendConfigured(),
    adminEmails: platformAdminEmails().length > 0,
    failedLastHour: feed.failedLastHour,
    activeIpBlocks: feed.blocks.filter((row) => row.active).length,
    heldAccounts: feed.heldAccounts.length,
  });
  return NextResponse.json({ ...feed, audit }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const gate = await requirePlatformAdmin(request);
  if (!gate.ok) return gateJson(gate);
  const feed = await listSecurityFeed(80);
  const audit = buildAuditChecks({
    authSecret: Boolean(authSecret()),
    database: isDatabaseConfigured(),
    google: Boolean(googleClientId()),
    facebook: isFacebookAuthConfigured(),
    resend: isResendConfigured(),
    adminEmails: platformAdminEmails().length > 0,
    failedLastHour: feed.failedLastHour,
    activeIpBlocks: feed.blocks.filter((row) => row.active).length,
    heldAccounts: feed.heldAccounts.length,
  });
  const endpoint = resolveAiEndpoint(request.headers.get("x-vercel-oidc-token"));
  let aiSummary = "";
  if (endpoint) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${endpoint.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: endpoint.model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "أنت مدقق أمن لمنصة هوية BHD. اكتب بالعربية ملخصاً قصيراً للتهديدات والإجراءات. لا تخترع ثغرات غير موجودة في المعطيات.",
            },
            {
              role: "user",
              content: JSON.stringify({
                audit,
                failedLastHour: feed.failedLastHour,
                countries: feed.countries.slice(0, 12),
                recentFails: feed.events.filter((event) => !event.ok).slice(0, 20),
                blocks: feed.blocks.filter((row) => row.active),
                held: feed.heldAccounts,
              }),
            },
          ],
        }),
      });
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      aiSummary = data.choices?.[0]?.message?.content?.trim() || "";
    } catch {
      aiSummary = "";
    }
  }
  if (!aiSummary) {
    aiSummary = [audit.threats.join(" ") || "لا توجد مؤشرات حادة في الساعة الأخيرة.", "راجع سجل العناوين والدول أدناه."].join(" ");
  }
  return NextResponse.json({ audit, aiSummary, feed }, { headers: { "Cache-Control": "no-store" } });
}
