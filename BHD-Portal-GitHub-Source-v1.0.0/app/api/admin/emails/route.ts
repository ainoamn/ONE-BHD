import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "../../../lib/auth/platform-admin";
import { getMailTemplate, listMailTemplates, saveMailTemplate } from "../../../lib/auth/email-template-store";
import { renderBrandedMailHtml, type MailTemplateKind } from "../../../lib/auth/email-templates";
import { identityIssuer } from "../../../lib/identity/issuer";

export const runtime = "nodejs";

function gateJson(gate: { ok: false; status: 401 | 403 }) {
  return NextResponse.json(
    { message: gate.status === 401 ? "يلزم تسجيل الدخول." : "ليست لديك صلاحية الإدارة." },
    { status: gate.status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const url = new URL(request.url);
  const preview = url.searchParams.get("preview") as MailTemplateKind | null;
  const templates = await listMailTemplates();

  if (preview === "password_reset" || preview === "email_verify") {
    const content = await getMailTemplate(preview);
    const sampleUrl =
      preview === "password_reset"
        ? `${identityIssuer(request)}/reset-password?token=preview-token`
        : `${identityIssuer(request)}/api/auth/verify-email?token=preview-token`;
    const html = renderBrandedMailHtml({
      kind: preview,
      actionUrl: sampleUrl,
      content,
      issuer: identityIssuer(request),
    });
    return NextResponse.json({ templates, previewHtml: html }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ templates }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const gate = await requirePlatformAdmin();
  if (!gate.ok) return gateJson(gate);

  const body = (await request.json().catch(() => null)) as {
    kind?: MailTemplateKind;
    subject?: string;
    headline?: string;
    body?: string;
    cta?: string;
    footnote?: string;
  } | null;

  if (body?.kind !== "password_reset" && body?.kind !== "email_verify") {
    return NextResponse.json({ message: "نوع القالب غير صالح." }, { status: 400 });
  }

  try {
    const saved = await saveMailTemplate(body.kind, {
      subject: body.subject || "",
      headline: body.headline || "",
      body: body.body || "",
      cta: body.cta || "",
      footnote: body.footnote || "",
    });
    return NextResponse.json({ template: { kind: body.kind, ...saved } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "تعذّر حفظ القالب. أكمل كل الحقول." }, { status: 400 });
  }
}
