import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, ensureIdentitySchema } from "../../../db";
import { emailTemplates } from "../../../db/schema";
import {
  defaultMailTemplate,
  renderBrandedMailHtml,
  renderBrandedMailText,
  type MailTemplateContent,
  type MailTemplateKind,
} from "./email-templates";

const KINDS: MailTemplateKind[] = ["password_reset", "email_verify"];

export async function getMailTemplate(kind: MailTemplateKind): Promise<MailTemplateContent> {
  const fallback = defaultMailTemplate(kind);
  if (!isDatabaseConfigured()) return fallback;
  try {
    await ensureIdentitySchema();
    const db = getDb();
    const [row] = await db.select().from(emailTemplates).where(eq(emailTemplates.kind, kind)).limit(1);
    if (!row) return fallback;
    return {
      subject: row.subject,
      headline: row.headline,
      body: row.body,
      cta: row.cta,
      footnote: row.footnote,
    };
  } catch {
    return fallback;
  }
}

export async function listMailTemplates() {
  const items = [];
  for (const kind of KINDS) {
    items.push({ kind, ...(await getMailTemplate(kind)) });
  }
  return items;
}

export async function saveMailTemplate(kind: MailTemplateKind, content: MailTemplateContent) {
  if (!KINDS.includes(kind)) throw new Error("INVALID_KIND");
  await ensureIdentitySchema();
  const db = getDb();
  const payload = {
    kind,
    subject: content.subject.trim().slice(0, 180),
    headline: content.headline.trim().slice(0, 120),
    body: content.body.trim().slice(0, 2000),
    cta: content.cta.trim().slice(0, 80),
    footnote: content.footnote.trim().slice(0, 400),
    updatedAt: new Date(),
  };
  if (!payload.subject || !payload.headline || !payload.body || !payload.cta) {
    throw new Error("INVALID_CONTENT");
  }
  await db
    .insert(emailTemplates)
    .values(payload)
    .onConflictDoUpdate({
      target: emailTemplates.kind,
      set: {
        subject: payload.subject,
        headline: payload.headline,
        body: payload.body,
        cta: payload.cta,
        footnote: payload.footnote,
        updatedAt: payload.updatedAt,
      },
    });
  return getMailTemplate(kind);
}

export async function buildTransactionalMail(
  kind: MailTemplateKind,
  actionUrl: string,
  issuer?: string,
) {
  const content = await getMailTemplate(kind);
  return {
    subject: content.subject,
    html: renderBrandedMailHtml({ kind, actionUrl, content, issuer }),
    text: renderBrandedMailText({ content, actionUrl }),
  };
}
