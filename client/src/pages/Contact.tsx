import { ArrowRight, Mail, MessageSquare, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactEmail = "sharedemocracy.team@gmail.com";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [notice, setNotice] = useState("");

  const goHome = () => {
    setLocation("/");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `שם: ${form.name || "לא נמסר"}`,
      `אימייל לחזרה: ${form.email || "לא נמסר"}`,
      "",
      form.message,
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(form.subject || "פנייה דרך האתר")}&body=${encodeURIComponent(body)}`;
    setNotice("פתחנו עבורך הודעת מייל מוכנה. אפשר לערוך ולשלוח מתיבת הדואר שלך.");
  };

  return (
    <main className="min-h-screen bg-[#fbf7ed] text-right text-[#17324d]" dir="rtl">
      <section className="border-b border-[#c8a96a]/40 bg-[linear-gradient(135deg,rgba(238,246,255,0.95)_0%,rgba(251,247,237,0.96)_55%,rgba(238,246,239,0.95)_100%)]">
        <div className="container py-8">
          <Button
            variant="outline"
            onClick={goHome}
            className="mb-10 border-[#c8a96a] bg-white/70 text-[#17324d] hover:bg-white"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לפתיח
          </Button>

          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-bold text-[#2f7d5c]">קול משותף</p>
            <h1 className="text-4xl font-black leading-tight text-[#17324d] sm:text-6xl">צור קשר</h1>
            <p className="mt-6 max-w-3xl text-xl font-semibold leading-9 text-[#4a3722]">
              פנייה למיזם, שאלות על הצטרפות, שיתופי פעולה, תיקוני מידע או הצעות להמשך הדרך.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-[#d8c79f] bg-white/86 p-7 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-[#17324d]">שליחת פנייה</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">שם</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="אפשר גם ראשי תיבות"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">אימייל לחזרה</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-subject">נושא</Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(event) => updateForm("subject", event.target.value)}
                  placeholder="לדוגמה: שיתוף פעולה, הצטרפות, תיקון מידע"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">הודעה</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => updateForm("message", event.target.value)}
                  className="min-h-44"
                  required
                />
              </div>
              <p className="text-xs leading-5 text-slate-500">
                הפנייה נשלחת מתיבת הדואר שלך. האתר לא שומר את תוכן ההודעה.
              </p>
              {notice && (
                <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-900">{notice}</p>
              )}
              <Button type="submit" className="w-full bg-[#17324d] hover:bg-[#1d4f91]">
                <Send className="ml-2 h-4 w-4" />
                פתיחת מייל מוכן
              </Button>
            </form>
          </Card>

          <div className="space-y-5">
            <Card className="border-[#d8c79f] bg-white/82 p-6 shadow-sm">
              <Mail className="mb-4 h-9 w-9 text-[#2f7d5c]" />
              <h2 className="text-2xl font-bold text-[#17324d]">אימייל</h2>
              <a className="mt-3 block break-all text-lg font-bold text-[#1d4f91] hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </Card>
            <Card className="border-[#d8c79f] bg-white/82 p-6 shadow-sm">
              <MessageSquare className="mb-4 h-9 w-9 text-[#2f7d5c]" />
              <h2 className="text-2xl font-bold text-[#17324d]">נושאים מתאימים</h2>
              <ul className="mt-4 space-y-2 text-base leading-7 text-[#4a3722]">
                <li>שאלות על קול משותף</li>
                <li>פנייה של אזרחים וחברי קהילה</li>
                <li>שיתופי פעולה ציבוריים</li>
                <li>תיקון מידע באתר</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
