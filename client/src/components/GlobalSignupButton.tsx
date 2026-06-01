import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

function getCurrentReferralCode() {
  return new URLSearchParams(window.location.search).get("ref") || "";
}

export function GlobalSignupButton() {
  const [isOpen, setOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "",
  });

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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

      setForm({ fullName: "", phone: "", email: "", note: "" });
      setMessage(
        data.isAlreadyConfirmed
          ? "ההרשמה שלך כבר מאושרת."
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
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-30 gap-2 bg-[#1d4f91] px-4 shadow-lg hover:bg-[#173f74]"
      >
        <UserPlus className="h-4 w-4" />
        הצטרפות
      </Button>

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
