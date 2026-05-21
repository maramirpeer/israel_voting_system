import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Eye, Lock, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Signup = {
  id: string | number;
  fullName: string;
  email: string;
  phone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

const tokenStorageKey = "sharedemocracy-admin-signups-token";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("he-IL");
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function AdminSignups() {
  const [token, setToken] = useState(() => window.localStorage.getItem(tokenStorageKey) || "");
  const [tokenInput, setTokenInput] = useState(token);
  const [submissions, setSubmissions] = useState<Signup[]>([]);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return left - right;
    });
  }, [submissions]);

  const loadSubmissions = async (activeToken = token) => {
    if (!activeToken) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/member-signups", {
        headers: { "x-admin-token": activeToken },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "מפתח הגישה לא אושר או שהנתונים אינם זמינים כרגע.");
      }

      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      setSource(typeof data.source === "string" ? data.source : "");
      setMessage("הנתונים נטענו בהצלחה.");
    } catch (error) {
      setSubmissions([]);
      setSource("");
      setMessage(error instanceof Error ? error.message : "טעינת הנתונים נכשלה.");
    } finally {
      setLoading(false);
    }
  };

  const saveToken = () => {
    const cleanToken = tokenInput.trim();
    setToken(cleanToken);
    if (cleanToken) {
      window.localStorage.setItem(tokenStorageKey, cleanToken);
      void loadSubmissions(cleanToken);
    } else {
      window.localStorage.removeItem(tokenStorageKey);
      setSubmissions([]);
      setMessage("מפתח הגישה נמחק מהדפדפן.");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["מספר", "שם מלא", "אימייל", "טלפון", "הערה", "נוצר", "עודכן"],
      ...sortedSubmissions.map((signup, index) => [
        index + 1,
        signup.fullName,
        signup.email,
        signup.phone || "",
        signup.note || "",
        formatDate(signup.createdAt),
        formatDate(signup.updatedAt),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sharedemocracy-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (token) {
      void loadSubmissions(token);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf7ed] px-4 py-8 text-[#17324d]" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2 text-right">
          <p className="text-sm font-bold text-[#4f6f52]">אזור ניהול פרטי</p>
          <h1 className="text-3xl font-bold">טפסי ההצטרפות המלאים</h1>
          <p className="max-w-3xl leading-7 text-[#5a4b38]">
            הנתונים בעמוד הזה רגישים. הוא אינו מקושר מהאתר הציבורי ונפתח רק עם מפתח גישה שמוגדר בשרת.
          </p>
        </header>

        <Card className="border-[#d8c79f] bg-white/90 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="admin-token">מפתח גישה</Label>
              <Input
                id="admin-token"
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="הדבק כאן את מפתח הניהול"
              />
            </div>
            <Button onClick={saveToken} className="gap-2 bg-[#17324d] hover:bg-[#23476b]">
              <Lock className="h-4 w-4" />
              שמירה וטעינה
            </Button>
            <Button variant="outline" onClick={() => loadSubmissions()} disabled={isLoading || !token} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              רענון
            </Button>
          </div>
          {message && <p className="mt-4 rounded-md bg-[#eef6ef] p-3 text-sm font-medium">{message}</p>}
        </Card>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">סה"כ טפסים</p>
            <p className="mt-2 text-3xl font-bold">{submissions.length.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">מקור נתונים</p>
            <p className="mt-2 text-2xl font-bold">{source === "database" ? "MySQL" : source === "local" ? "קובץ מקומי" : "-"}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">ייצוא</p>
            <Button onClick={exportCsv} disabled={!submissions.length} className="mt-3 gap-2 bg-[#4f6f52] hover:bg-[#405d43]">
              <Download className="h-4 w-4" />
              הורדת CSV
            </Button>
          </Card>
        </section>

        <Card className="overflow-hidden border-[#d8c79f] bg-white/90">
          <div className="flex items-center justify-between border-b border-[#eadfca] p-4">
            <h2 className="text-xl font-bold">רשומות</h2>
            <Eye className="h-5 w-5 text-[#4f6f52]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-sm">
              <thead className="bg-[#eef6ef] text-[#17324d]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">שם מלא</th>
                  <th className="p-3">אימייל</th>
                  <th className="p-3">טלפון</th>
                  <th className="p-3">הערה</th>
                  <th className="p-3">נוצר</th>
                  <th className="p-3">עודכן</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((signup, index) => (
                  <tr key={String(signup.id)} className="border-t border-[#eadfca] align-top">
                    <td className="p-3 font-bold">{index + 1}</td>
                    <td className="p-3">{signup.fullName}</td>
                    <td className="p-3" dir="ltr">{signup.email}</td>
                    <td className="p-3" dir="ltr">{signup.phone || "-"}</td>
                    <td className="p-3">
                      <Textarea value={signup.note || ""} readOnly className="min-h-16 resize-none bg-white" />
                    </td>
                    <td className="p-3">{formatDate(signup.createdAt)}</td>
                    <td className="p-3">{formatDate(signup.updatedAt)}</td>
                  </tr>
                ))}
                {!sortedSubmissions.length && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#5a4b38]">
                      אין נתונים להצגה כרגע.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
