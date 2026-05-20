import type { Express, Request, Response } from "express";
import { getContactEmailTo, sendEmail } from "./email";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function registerContactRoutes(app: Express) {
  app.post("/api/contact", async (req: Request, res: Response) => {
    const name = normalize(req.body.name);
    const email = normalize(req.body.email).toLowerCase();
    const subject = normalize(req.body.subject);
    const message = normalize(req.body.message);
    const to = getContactEmailTo();

    if (!subject) {
      res.status(400).json({ error: "יש למלא נושא" });
      return;
    }

    if (!message) {
      res.status(400).json({ error: "יש למלא הודעה" });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ error: "כתובת האימייל אינה תקינה" });
      return;
    }

    if (!to) {
      res.status(503).json({ error: "כתובת קבלת הפניות עדיין לא הוגדרה" });
      return;
    }

    const safeName = escapeHtml(name || "לא נמסר");
    const safeEmail = escapeHtml(email || "לא נמסר");
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const sent = await sendEmail({
      to,
      replyTo: email || undefined,
      subject: `פנייה מהאתר: ${subject}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
          <h1 style="color:#17324d">פנייה חדשה מקול משותף</h1>
          <p><strong>שם:</strong> ${safeName}</p>
          <p><strong>אימייל לחזרה:</strong> ${safeEmail}</p>
          <p><strong>נושא:</strong> ${safeSubject}</p>
          <div style="margin-top:20px;padding:16px;border-right:4px solid #2f7d5c;background:#f8fafc">
            ${safeMessage}
          </div>
        </div>
      `,
      text: `פנייה חדשה מקול משותף\n\nשם: ${name || "לא נמסר"}\nאימייל לחזרה: ${email || "לא נמסר"}\nנושא: ${subject}\n\n${message}`,
    }).catch((error) => {
      console.warn("[Contact] Email send error:", error);
      return false;
    });

    if (!sent) {
      res.status(502).json({ error: "שליחת הפנייה נכשלה כרגע" });
      return;
    }

    res.json({ ok: true });
  });
}
