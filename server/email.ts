type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function getContactEmailTo() {
  return process.env.CONTACT_EMAIL_TO || process.env.ADMIN_NOTIFICATION_EMAIL || "";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && (process.env.EMAIL_FROM || process.env.MEMBER_SIGNUP_EMAIL_FROM));
}

export async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.MEMBER_SIGNUP_EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[Email] Provider is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const body: Record<string, unknown> = {
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };

  if (payload.text) {
    body.text = payload.text;
  }

  if (payload.replyTo) {
    body.reply_to = payload.replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.warn(`[Email] Send failed (${response.status}): ${detail}`);
    return false;
  }

  return true;
}
