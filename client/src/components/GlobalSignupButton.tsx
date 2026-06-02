import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

function getCurrentReferralCode() {
  return new URLSearchParams(window.location.search).get("ref") || "";
}

export function GlobalSignupButton() {
  const [isOpen, setOpen] = useState(false);
  const [isMemberLoginOpen, setMemberLoginOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isMemberLoginSubmitting, setMemberLoginSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [memberLoginMessage, setMemberLoginMessage] = useState("");
  const [memberReferralUrl, setMemberReferralUrl] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleMemberLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMemberLoginSubmitting(true);
    setMemberLoginMessage("");
    setMemberReferralUrl("");

    try {
      const response = await fetch("/api/member-signups/recover-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "כניסת חברים נכשלה.");
      }

      setMemberReferralUrl(data.referralUrl || "");
      setMemberLoginMessage(`נמצאה הרשמה מאושרת. הקוד האישי שלך: ${data.referralCode}.`);
    } catch (error) {
      setMemberLoginMessage(error instanceof Error ? error.message : "כניסת חברים נכשלה.");
    } finally {
      setMemberLoginSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/member-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, referredByCode: getCurrentReferralCode() }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "השליחה נכשלה");
      }

      const personalReferralMessage = data.referralUrl && data.referralCode
        ? ` הקוד האישי שלך: ${data.referralCode}. עמוד השיתוף האישי שלך: ${data.referralUrl}`
        : "";

      setForm({ fullName: "", phone: "", email: "", note: "" });
      setMessage(
        data.isAlreadyConfirmed
          ? `ההרשמה שלך כבר מאושרת.${personalReferralMessage}`
          : data.confirmationEmailSent
            ? "שלחנו אליך מייל עם קישור לאישור ההצטרפות."
            : "הפרטים נשמרו, אבל מייל האישור לא נשלח כרגע.",
      );
    } catch (error) {
      const timeoutMessage =
        error instanceof DOMException && error.name === "AbortError"
          ? "ההרשמה איטית מדי כרגע. נסה שוב בעוד רגע."
          : "השליחה נכשלה";
      setMessage(error instanceof Error && error.name !== "AbortError" ? error.message : timeoutMessage);
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 z-30 flex flex-col gap-2">
        <Button
          type="button"
          onClick={() => setMemberLoginOpen(true)}
          className="gap-2 bg-[#2f7d5c] px-4 shadow-lg hover:bg-[#286a4f]"
        >
          <LogIn className="h-4 w-4" />
          כניסה לחברים
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="gap-2 bg-[#1d4f91] px-4 shadow-lg hover:bg-[#173f74]"
        >
          <UserPlus className="h-4 w-4" />
          הצטרפות
        </Button>
      </div>

      <Dialog open={isMemberLoginOpen} onOpenChange={setMemberLoginOpen}>
        <DialogContent className="text-right sm:max-w-lg" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl text-[#17324d]">כניסה לחברים רשומים</DialogTitle>
            <DialogDescription>
              הזינו את המייל שאושר בהרשמה כדי לקבל מחדש את הקוד ואת עמוד בניין הקבוצה האישי.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleMemberLogin}>
            <div className="space-y-2">
              <Label htmlFor="member-login-email">אימייל רשום</Label>
              <Input
                id="member-login-email"
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                required
              />
            </div>
            {memberLoginMessage && <p className="rounded-md bg-[#eef6ef] p-3 text-sm font-medium text-[#17324d]">{memberLoginMessage}</p>}
            {memberReferralUrl && (
              <div className="space-y-3 rounded-md border border-[#d8c79f] bg-[#fbf7ed] p-3">
                <p className="break-all text-sm font-bold text-[#17324d]" dir="ltr">{memberReferralUrl}</p>
                <Button type="button" className="w-full bg-[#2f7d5c] hover:bg-[#286a4f]" onClick={() => window.location.href = memberReferralUrl}>
                  פתיחת אזור בניין הקבוצה
                </Button>
              </div>
            )}
            <Button type="submit" className="w-full bg-[#17324d] hover:bg-[#23476b]" disabled={isMemberLoginSubmitting}>
              {isMemberLoginSubmitting ? "בודק..." : "קבלת קוד אישי"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="text-right sm:max-w-xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl text-blue-900">הצטרפות לגרעין המייסד</DialogTitle>
            <DialogDescription>
              מלאו שם ואימייל כדי לקבל קישור אישור. ההצטרפות נספרת לאחר אישור במייל.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="global-signup-full-name">שם מלא</Label>
                <Input
                  id="global-signup-full-name"
                  value={form.fullName}
                  onChange={(event) => updateForm("fullName", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="global-signup-phone">טלפון (אופציונלי)</Label>
                <Input
                  id="global-signup-phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="global-signup-email">אימייל</Label>
                <Input
                  id="global-signup-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="global-signup-note">הערה (אופציונלי)</Label>
              <Textarea
                id="global-signup-note"
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                placeholder="אפשר להשאיר ריק"
              />
            </div>
            {message && <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-900">{message}</p>}
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
              {isSubmitting ? "שולח..." : "שליחה"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
