export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function resendFromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
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
    throw new Error("EMAIL_SEND_FAILED");
  }
}
