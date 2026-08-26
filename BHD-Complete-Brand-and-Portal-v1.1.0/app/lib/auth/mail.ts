export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function cleanEnv(value: string | undefined) {
  return (value || "")
    .replace(/^\uFEFF/, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\\r\\n/g, "")
    .replace(/\\n/g, "")
    .replace(/\r|\n/g, "")
    .trim();
}

export function resendApiKey() {
  return cleanEnv(process.env.RESEND_API_KEY);
}

export function resendFromAddress() {
  return (
    cleanEnv(process.env.RESEND_FROM_EMAIL) ||
    "BHD Identity <noreply@bhd-om.com>"
  );
}

export async function sendResendEmail(input: SendEmailInput) {
  const key = resendApiKey();
  if (!key) {
    throw new Error("RESEND_NOT_CONFIGURED");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend send failed", response.status, detail.slice(0, 400));
    const lower = detail.toLowerCase();
    if (response.status === 403 || lower.includes("domain") || lower.includes("not verified")) {
      throw new Error("EMAIL_DOMAIN_NOT_VERIFIED");
    }
    throw new Error("EMAIL_SEND_FAILED");
  }
}
