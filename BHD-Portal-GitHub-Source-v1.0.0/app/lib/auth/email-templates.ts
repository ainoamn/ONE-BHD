import { BHD_APPS } from "../bhd/apps";
import { DEFAULT_IDENTITY_ISSUER } from "../identity/issuer";

export type MailTemplateKind = "password_reset" | "email_verify";

export type MailTemplateContent = {
  subject: string;
  headline: string;
  body: string;
  cta: string;
  footnote: string;
};

const DEFAULTS: Record<MailTemplateKind, MailTemplateContent> = {
  password_reset: {
    subject: "إعادة تعيين كلمة مرور حساب BHD",
    headline: "إعادة تعيين كلمة المرور",
    body: "طلبتَ (أو طلب مسؤول النظام) رابطاً لتعيين كلمة مرور جديدة لحسابك في هوية BHD. الرابط صالح لمدة ساعة واحدة فقط.",
    cta: "تعيين كلمة مرور جديدة",
    footnote: "إن لم تطلب ذلك فتجاهل الرسالة — لن يتغيّر شيء في حسابك.",
  },
  email_verify: {
    subject: "تأكيد بريد حساب BHD",
    headline: "تأكيد البريد الإلكتروني",
    body: "مرحباً بك في منظومة بن حمود. لتفعيل حسابك في هوية BHD اضغط الزر أدناه. الرابط صالح لمدة 24 ساعة.",
    cta: "تأكيد البريد الآن",
    footnote: "إن لم تنشئ حساباً فتجاهل هذه الرسالة.",
  },
};

export function defaultMailTemplate(kind: MailTemplateKind): MailTemplateContent {
  return { ...DEFAULTS[kind] };
}

function appsGridHtml(issuer: string) {
  const apps = BHD_APPS.filter((app) => app.enabled && app.id !== "account");
  const cells = apps
    .map((app) => {
      const href = app.origin || issuer;
      return `
        <td align="center" valign="top" style="padding:6px;width:25%">
          <a href="${href}" style="text-decoration:none;display:block">
            <div style="width:48px;height:48px;margin:0 auto 6px;border-radius:14px;background:${app.soft};color:${app.accent};font-family:Tahoma,Arial,sans-serif;font-size:16px;font-weight:800;line-height:48px;text-align:center">
              ${app.mark}
            </div>
            <div style="font-family:Tahoma,Arial,sans-serif;font-size:11px;font-weight:700;color:#3f574d;line-height:1.35">${app.nameAr}</div>
          </a>
        </td>`;
    })
    .join("");

  // 4 columns per row
  const rows: string[] = [];
  const list = apps;
  for (let i = 0; i < list.length; i += 4) {
    const slice = list.slice(i, i + 4);
    const rowCells = slice
      .map((app) => {
        const href = app.origin || issuer;
        return `
        <td align="center" valign="top" style="padding:6px;width:25%">
          <a href="${href}" style="text-decoration:none;display:block">
            <div style="width:48px;height:48px;margin:0 auto 6px;border-radius:14px;background:${app.soft};color:${app.accent};font-family:Tahoma,Arial,sans-serif;font-size:16px;font-weight:800;line-height:48px;text-align:center">
              ${app.mark}
            </div>
            <div style="font-family:Tahoma,Arial,sans-serif;font-size:11px;font-weight:700;color:#3f574d;line-height:1.35">${app.nameAr}</div>
          </a>
        </td>`;
      })
      .join("");
    const pad = 4 - slice.length;
    const pads = Array.from({ length: pad }, () => `<td style="width:25%"></td>`).join("");
    rows.push(`<tr>${rowCells}${pads}</tr>`);
  }
  void cells;
  return rows.join("");
}

export function renderBrandedMailHtml(input: {
  kind: MailTemplateKind;
  actionUrl: string;
  content: MailTemplateContent;
  issuer?: string;
}) {
  const issuer = (input.issuer || DEFAULT_IDENTITY_ISSUER).replace(/\/$/, "");
  // Single baked PNG (dark site header + logo). Outlook strips CSS gradients and often
  // blocks SVG; a full-width header image is the reliable path.
  const headerUrl = `${issuer}/brand/bhd-email-header.png`;
  const c = input.content;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><meta name="color-scheme" content="light" /></head>
<body style="margin:0;padding:0;background:#eef3f0">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#eef3f0" style="background-color:#eef3f0;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d7e2dc">
        <tr>
          <td bgcolor="#0c4a3c" style="background-color:#0c4a3c;padding:0;text-align:center;line-height:0;font-size:0">
            <a href="${issuer}" style="text-decoration:none;border:0;display:block">
              <img src="${headerUrl}" alt="Bin Hamood Development — هوية BHD الموحّدة" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;font-family:Tahoma,Arial,sans-serif;color:#092d24;text-align:right;direction:rtl">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.4">${c.headline}</h1>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#3f574d">${c.body}</p>
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 18px">
              <tr>
                <td align="center" bgcolor="#0c7459" style="border-radius:999px;background-color:#0c7459">
                  <a href="${input.actionUrl}" style="display:inline-block;padding:14px 26px;font-family:Tahoma,Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none">${c.cta}</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#5d7169">${c.footnote}</p>
            <p style="margin:0 0 8px;font-size:12px;color:#7b8983;word-break:break-all;line-height:1.6">${input.actionUrl}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 24px;font-family:Tahoma,Arial,sans-serif;text-align:right;direction:rtl">
            <div style="border-top:1px solid #e6eeea;padding-top:18px">
              <p style="margin:0 0 6px;font-size:12px;font-weight:800;color:#0c4a3c">برامج مجموعة بن حمود</p>
              <p style="margin:0 0 12px;font-size:12px;color:#5d7169;line-height:1.6">حساب واحد يفتح لك هذه المنظومة الرقمية:</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${appsGridHtml(issuer)}</table>
            </div>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f4f7f5" style="background-color:#f4f7f5;padding:16px 24px;text-align:center;font-family:Tahoma,Arial,sans-serif;font-size:11px;color:#6b7d75;line-height:1.6">
            شركة بن حمود للتطوير · مسقط · سلطنة عُمان<br />
            <a href="${issuer}" style="color:#0c7459;text-decoration:none;font-weight:700">${issuer.replace(/^https:\/\//, "")}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderBrandedMailText(input: {
  content: MailTemplateContent;
  actionUrl: string;
}) {
  const apps = BHD_APPS.filter((app) => app.enabled && app.id !== "account")
    .map((app) => `- ${app.nameAr}: ${app.origin}`)
    .join("\n");
  return `${input.content.headline}\n\n${input.content.body}\n\n${input.content.cta}:\n${input.actionUrl}\n\n${input.content.footnote}\n\nبرامجنا:\n${apps}\n`;
}
