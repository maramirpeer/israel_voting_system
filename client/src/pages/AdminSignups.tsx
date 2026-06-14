import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, CheckCircle2, Download, Eye, Lock, MailCheck, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Signup = {
  id: string | number;
  fullName: string;
  email: string;
  phone: string | null;
  note: string | null;
  emailConfirmedAt: string | null;
  confirmationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type EmailStatus = {
  configured: boolean;
  hasApiKey: boolean;
  hasFrom: boolean;
  hasPublicSiteUrl: boolean;
};

type PreliminaryProposal = {
  id: number;
  title: string;
  description: string;
  supporters: number | null;
  createdAt: string;
};

type CandidateEnlistment = {
  id: string | number;
  fullName: string;
  nationalId: string;
  email: string;
  includedAt: string | null;
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

function getSignupStatus(signup: Signup) {
  return signup.emailConfirmedAt ? "מאושר" : "ממתין לאישור";
}

export default function AdminSignups() {
  const [token, setToken] = useState(() => window.localStorage.getItem(tokenStorageKey) || "");
  const [tokenInput, setTokenInput] = useState(token);
  const [submissions, setSubmissions] = useState<Signup[]>([]);
  const [source, setSource] = useState("");
  const [message, setMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isSendingConfirmations, setSendingConfirmations] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [preliminaryBills, setPreliminaryBills] = useState<PreliminaryProposal[]>([]);
  const [preliminaryQuestions, setPreliminaryQuestions] = useState<PreliminaryProposal[]>([]);
  const [candidateEnlistments, setCandidateEnlistments] = useState<CandidateEnlistment[]>([]);
  const [approvingProposal, setApprovingProposal] = useState<string | null>(null);
  const [includingCandidateId, setIncludingCandidateId] = useState<string | number | null>(null);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | number | null>(null);

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return left - right;
    });
  }, [submissions]);
  const confirmedCount = submissions.filter((signup) => signup.emailConfirmedAt).length;
  const pendingCount = submissions.length - confirmedCount;
  const sortedCandidateEnlistments = useMemo(() => {
    return [...candidateEnlistments].sort((a, b) => {
      const left = new Date(a.createdAt).getTime();
      const right = new Date(b.createdAt).getTime();
      return left - right;
    });
  }, [candidateEnlistments]);

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
      setEmailStatus(data.emailStatus && typeof data.emailStatus === "object" ? data.emailStatus : null);
      void loadPreliminaryProposals(activeToken);
      void loadCandidateEnlistments(activeToken);
      setMessage("הנתונים נטענו בהצלחה.");
    } catch (error) {
      setSubmissions([]);
      setSource("");
      setEmailStatus(null);
      setCandidateEnlistments([]);
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
      setCandidateEnlistments([]);
      setMessage("מפתח הגישה נמחק מהדפדפן.");
    }
  };

  const loadPreliminaryProposals = async (activeToken = token) => {
    if (!activeToken) {
      return;
    }

    try {
      const response = await fetch("/api/admin/mk121/preliminary-proposals", {
        headers: { "x-admin-token": activeToken },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "טעינת הדפים המקדימים נכשלה.");
      }

      setPreliminaryBills(Array.isArray(data.bills) ? data.bills : []);
      setPreliminaryQuestions(Array.isArray(data.questions) ? data.questions : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "טעינת הדפים המקדימים נכשלה.");
    }
  };

  const loadCandidateEnlistments = async (activeToken = token) => {
    if (!activeToken) {
      return;
    }

    try {
      const response = await fetch("/api/admin/candidate-enlistments", {
        headers: { "x-admin-token": activeToken },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "טעינת המועמדים המתגייסים נכשלה.");
      }

      setCandidateEnlistments(Array.isArray(data.enlistments) ? data.enlistments : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "טעינת המועמדים המתגייסים נכשלה.");
    }
  };

  const includeCandidateOnSite = async (candidate: CandidateEnlistment) => {
    if (!token) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    setIncludingCandidateId(candidate.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/candidate-enlistments/${encodeURIComponent(String(candidate.id))}/include`, {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "הצגת המועמד באתר נכשלה.");
      }

      setMessage(`${candidate.fullName} נוסף/ה לרשימת המועמדים המתגייסים באתר.`);
      await loadCandidateEnlistments(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "הצגת המועמד באתר נכשלה.");
    } finally {
      setIncludingCandidateId(null);
    }
  };

  const deleteCandidateEnlistment = async (candidate: CandidateEnlistment) => {
    if (!token) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    const approved = window.confirm(`למחוק את המועמד/ת ${candidate.fullName} (${candidate.email})?`);

    if (!approved) {
      return;
    }

    setDeletingCandidateId(candidate.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/candidate-enlistments/${encodeURIComponent(String(candidate.id))}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "מחיקת המועמד נכשלה.");
      }

      setCandidateEnlistments((current) => current.filter((currentCandidate) => currentCandidate.id !== candidate.id));
      setMessage("המועמד/ת נמחק/ה בהצלחה.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "מחיקת המועמד נכשלה.");
    } finally {
      setDeletingCandidateId(null);
    }
  };

  const approvePreliminaryProposal = async (type: "bill" | "question", id: number) => {
    if (!token) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    setApprovingProposal(`${type}-${id}`);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/mk121/preliminary-proposals/${type}/${id}/approve`, {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "אישור הדף המקדים נכשל.");
      }

      setMessage("הדף המקדים אושר: נקבעו 1000 תומכים והוא עבר לשלב ההצבעה.");
      await loadPreliminaryProposals(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "אישור הדף המקדים נכשל.");
    } finally {
      setApprovingProposal(null);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["מספר", "שם מלא", "אימייל", "טלפון", "סטטוס", "אושר בתאריך", "נשלח אישור בתאריך", "הערה", "נוצר", "עודכן"],
      ...sortedSubmissions.map((signup, index) => [
        index + 1,
        signup.fullName,
        signup.email,
        signup.phone || "",
        getSignupStatus(signup),
        signup.emailConfirmedAt ? formatDate(signup.emailConfirmedAt) : "",
        signup.confirmationSentAt ? formatDate(signup.confirmationSentAt) : "",
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

  const sendPendingConfirmations = async () => {
    if (!token) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    setSendingConfirmations(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/member-signups/send-confirmations", {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "שליחת מיילי האישור נכשלה.");
      }

      const sent = Number(data.sent || 0);
      const pending = Number(data.pending || 0);
      const failed = Number(data.failed || 0);
      const failedText = failed > 0 ? ` ${failed.toLocaleString("he-IL")} שליחות נכשלו.` : "";
      setMessage(`נשלחו ${sent.toLocaleString("he-IL")} מיילי אישור מתוך ${pending.toLocaleString("he-IL")} ממתינים.${failedText}`);
      void loadSubmissions(token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "שליחת מיילי האישור נכשלה.");
    } finally {
      setSendingConfirmations(false);
    }
  };

  const deleteSignup = async (signup: Signup) => {
    if (!token) {
      setMessage("יש להזין מפתח גישה.");
      return;
    }

    const approved = window.confirm(`למחוק את ההרשמה של ${signup.fullName} (${signup.email})?`);

    if (!approved) {
      return;
    }

    setDeletingId(signup.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/member-signups/${encodeURIComponent(String(signup.id))}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "מחיקת ההרשמה נכשלה.");
      }

      setSubmissions((current) => current.filter((currentSignup) => currentSignup.id !== signup.id));
      setMessage("ההרשמה נמחקה בהצלחה.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "מחיקת ההרשמה נכשלה.");
    } finally {
      setDeletingId(null);
    }
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

        <section className="grid gap-4 md:grid-cols-4">
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">סה"כ טפסים</p>
            <p className="mt-2 text-3xl font-bold">{submissions.length.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">מאושרים במייל</p>
            <p className="mt-2 text-3xl font-bold">{confirmedCount.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">ממתינים לאישור</p>
            <p className="mt-2 text-3xl font-bold">{pendingCount.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">מקור נתונים</p>
            <p className="mt-2 text-2xl font-bold">{source === "database" ? "MySQL" : source === "local" ? "קובץ מקומי" : "-"}</p>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">סטטוס מייל</p>
            <p className={`mt-2 text-lg font-bold ${emailStatus?.configured ? "text-[#2f5d35]" : "text-[#7a5b00]"}`}>
              {emailStatus?.configured ? "מחובר" : "לא מחובר"}
            </p>
            {emailStatus && (
              <p className="mt-2 text-xs leading-5 text-[#5a4b38]">
                Resend: {emailStatus.hasApiKey ? "קיים" : "חסר"} · שולח: {emailStatus.hasFrom ? "קיים" : "חסר"} · כתובת אתר: {emailStatus.hasPublicSiteUrl ? "קיימת" : "חסרה"}
              </p>
            )}
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">ייצוא</p>
            <Button onClick={exportCsv} disabled={!submissions.length} className="mt-3 gap-2 bg-[#4f6f52] hover:bg-[#405d43]">
              <Download className="h-4 w-4" />
              הורדת CSV
            </Button>
          </Card>
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <p className="text-sm text-[#5a4b38]">אישורי מייל</p>
            <Button
              onClick={sendPendingConfirmations}
              disabled={!pendingCount || !token || isSendingConfirmations}
              className="mt-3 gap-2 bg-[#17324d] hover:bg-[#23476b]"
            >
              <MailCheck className="h-4 w-4" />
              {isSendingConfirmations ? "שולח..." : "שליחה לממתינים"}
            </Button>
          </Card>
        </section>

        <Card className="overflow-hidden border-[#d8c79f] bg-white/90">
          <div className="flex items-center justify-between border-b border-[#eadfca] p-4">
            <div>
              <h2 className="text-xl font-bold">מועמדים מתגייסים</h2>
              <p className="mt-1 text-sm text-[#5a4b38]">
                מועמדים שביקשו להיכלל כתומכים בקול משותף.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#eef6ef] px-3 py-1 text-sm font-bold text-[#2f5d35]">
                {candidateEnlistments.length.toLocaleString("he-IL")}
              </span>
              <Button variant="outline" size="sm" onClick={() => loadCandidateEnlistments()} disabled={!token}>
                רענון
              </Button>
              <BadgeCheck className="h-5 w-5 text-[#2f7d5c]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-sm">
              <thead className="bg-[#eef6ef] text-[#17324d]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">שם מלא</th>
                  <th className="p-3">מייל</th>
                  <th className="p-3">ת.ז</th>
                  <th className="p-3">סטטוס</th>
                  <th className="p-3">נוצר</th>
                  <th className="p-3">עודכן</th>
                  <th className="p-3">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {sortedCandidateEnlistments.map((candidate, index) => (
                  <tr key={String(candidate.id)} className="border-t border-[#eadfca] align-top">
                    <td className="p-3 font-bold">{index + 1}</td>
                    <td className="p-3">{candidate.fullName}</td>
                    <td className="p-3" dir="ltr">{candidate.email}</td>
                    <td className="p-3" dir="ltr">{candidate.nationalId}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-1 text-xs font-bold ${candidate.includedAt ? "bg-[#eef6ef] text-[#2f5d35]" : "bg-[#fff3cd] text-[#7a5b00]"}`}>
                        {candidate.includedAt ? "מוצג באתר" : "ממתין להחלטת אדמין"}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(candidate.createdAt)}</td>
                    <td className="p-3">{formatDate(candidate.updatedAt)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => includeCandidateOnSite(candidate)}
                          disabled={Boolean(candidate.includedAt) || includingCandidateId === candidate.id}
                          className="gap-2 bg-[#2f7d5c] hover:bg-[#286a4f]"
                        >
                          <BadgeCheck className="h-4 w-4" />
                          {candidate.includedAt ? "כבר באתר" : includingCandidateId === candidate.id ? "מציג..." : "הצג באתר"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCandidateEnlistment(candidate)}
                          disabled={deletingCandidateId === candidate.id}
                          className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingCandidateId === candidate.id ? "מוחק..." : "מחיקה"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!sortedCandidateEnlistments.length && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#5a4b38]">
                      עדיין אין מועמדים מתגייסים.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">דפים מקדימים - הצעות חוק</h2>
                <p className="mt-1 text-xs text-[#5a4b38]">אישור מדמה הגעה ל-1,000 חברים ומפרסם את ההצעה באתר. ההצבעה היא שלב נפרד.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadPreliminaryProposals()} disabled={!token}>
                רענון
              </Button>
            </div>
            <div className="space-y-3">
              {preliminaryBills.map((proposal) => (
                <div key={proposal.id} className="rounded-md border border-[#eadfca] bg-[#fbf7ed]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{proposal.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5a4b38]">{proposal.description}</p>
                      <p className="mt-2 text-xs font-bold text-[#7a5b00]">{(proposal.supporters || 0).toLocaleString("he-IL")}/1000 תומכים</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approvePreliminaryProposal("bill", proposal.id)}
                      disabled={approvingProposal === `bill-${proposal.id}`}
                      className="gap-2 bg-[#2f7d5c] hover:bg-[#286a4f]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      אישור והעלאה
                    </Button>
                  </div>
                </div>
              ))}
              {!preliminaryBills.length && <p className="text-sm text-[#5a4b38]">אין הצעות חוק בדף המקדים כרגע.</p>}
            </div>
          </Card>

          <Card className="border-[#d8c79f] bg-white/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">דפים מקדימים - שאילתות</h2>
                <p className="mt-1 text-xs text-[#5a4b38]">אישור מדמה הגעה ל-1,000 חברים ומפרסם את השאילתא באתר. ההצבעה היא שלב נפרד.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadPreliminaryProposals()} disabled={!token}>
                רענון
              </Button>
            </div>
            <div className="space-y-3">
              {preliminaryQuestions.map((proposal) => (
                <div key={proposal.id} className="rounded-md border border-[#eadfca] bg-[#fbf7ed]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{proposal.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5a4b38]">{proposal.description}</p>
                      <p className="mt-2 text-xs font-bold text-[#7a5b00]">{(proposal.supporters || 0).toLocaleString("he-IL")}/1000 תומכים</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approvePreliminaryProposal("question", proposal.id)}
                      disabled={approvingProposal === `question-${proposal.id}`}
                      className="gap-2 bg-[#2f7d5c] hover:bg-[#286a4f]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      אישור והעלאה
                    </Button>
                  </div>
                </div>
              ))}
              {!preliminaryQuestions.length && <p className="text-sm text-[#5a4b38]">אין שאילתות בדף המקדים כרגע.</p>}
            </div>
          </Card>
        </section>

        <Card className="overflow-hidden border-[#d8c79f] bg-white/90">
          <div className="flex items-center justify-between border-b border-[#eadfca] p-4">
            <h2 className="text-xl font-bold">רשומות</h2>
            <Eye className="h-5 w-5 text-[#4f6f52]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1220px] text-right text-sm">
              <thead className="bg-[#eef6ef] text-[#17324d]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">שם מלא</th>
                  <th className="p-3">אימייל</th>
                  <th className="p-3">טלפון</th>
                  <th className="p-3">סטטוס</th>
                  <th className="p-3">הערה</th>
                  <th className="p-3">נוצר</th>
                  <th className="p-3">עודכן</th>
                  <th className="p-3">פעולות</th>
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
                      <span className={`rounded px-2 py-1 text-xs font-bold ${signup.emailConfirmedAt ? "bg-[#eef6ef] text-[#2f5d35]" : "bg-[#fff3cd] text-[#7a5b00]"}`}>
                        {getSignupStatus(signup)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Textarea value={signup.note || ""} readOnly className="min-h-16 resize-none bg-white" />
                    </td>
                    <td className="p-3">{formatDate(signup.createdAt)}</td>
                    <td className="p-3">{formatDate(signup.updatedAt)}</td>
                    <td className="p-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSignup(signup)}
                        disabled={deletingId === signup.id}
                        className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === signup.id ? "מוחק..." : "מחיקה"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!sortedSubmissions.length && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#5a4b38]">
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
