import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, Scale } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type MK121Assignment = { type: "direct" | "expert" | "citizen"; name?: string };
type MK121Bill = {
  id: number;
  title: string;
  votes?: number | null;
};

const MK121_ASSIGNMENT_KEY = "mk121-vote-assignment";
const MK121_BILL_DIRECT_OVERRIDES_KEY = "mk121-bill-direct-overrides";

const getBillDisplayPriority = (title: string) => {
  if (title.includes("הגבלת") && title.includes("ראש")) return 0;
  if (title.includes("כל ח״כ חייב") || title.includes("חובת הצבעה")) return 1;
  if (title.includes("זירת מידע")) return 2;
  if (title.includes("שקיפות")) return 3;
  return 10;
};

const demoBills: MK121Bill[] = [
  { id: 207, title: "איסור כהונת ח״כ שהורשע בפלילים", votes: 18720 },
  { id: 208, title: "דע למי הולך כספך", votes: 16490 },
  { id: 201, title: "הגבלת זמן ראש הממשלה", votes: 21980 },
  { id: 202, title: "כל ח״כ חייב להצביע", votes: 17640 },
  { id: 205, title: "הקשחת חוקי היסוד", votes: 16890 },
  { id: 203, title: "שקיפות", votes: 14320 },
  { id: 204, title: "זירת מידע חיה של שאלות ותשובות בין ח״כ", votes: 9870 },
];

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function MK121VoteRouting() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const billAssignment = readJson<MK121Assignment>(MK121_ASSIGNMENT_KEY, { type: "direct" });
  const [billDirectOverrides, setBillDirectOverrides] = useState<Record<string, boolean>>(() =>
    readJson<Record<string, boolean>>(MK121_BILL_DIRECT_OVERRIDES_KEY, {})
  );
  const currentCycleQuery = trpc.mk121.getCurrentCycle.useQuery(undefined, {
    retry: false,
  });
  const billsQuery = trpc.mk121.getBillsForCycle.useQuery(
    { cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );

  const hasDelegate = billAssignment.type !== "direct" && Boolean(billAssignment.name);
  const useDemoData = !currentCycleQuery.data || Boolean(currentCycleQuery.error);
  const bills = [...(useDemoData ? demoBills : (billsQuery.data as MK121Bill[] | undefined) || [])].sort((a, b) => {
    const priorityDiff = getBillDisplayPriority(a.title) - getBillDisplayPriority(b.title);
    return priorityDiff || (b.votes || 0) - (a.votes || 0);
  });

  const saveBillDirectOverrides = (next: Record<string, boolean>) => {
    setBillDirectOverrides(next);
    window.localStorage.setItem(MK121_BILL_DIRECT_OVERRIDES_KEY, JSON.stringify(next));
  };

  const setBillDirect = (billId: number) => {
    if (!isAuthenticated) {
      setLocation("/?signup=1");
      return;
    }
    saveBillDirectOverrides({ ...billDirectOverrides, [String(billId)]: true });
  };

  const setBillDelegated = (billId: number) => {
    if (!isAuthenticated) {
      setLocation("/?signup=1");
      return;
    }
    const next = { ...billDirectOverrides };
    delete next[String(billId)];
    saveBillDirectOverrides(next);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7ed_0%,#ffffff_42%,#eef6ef_100%)] text-right" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4 flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/mk121")} className="flex items-center gap-2 justify-end">
            חזרה לח״כ 121
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">איך הקול שלי מנותב</h1>
          <span className="text-sm text-slate-600">ח״כ 121</span>
        </div>
      </header>

      <main className="container max-w-5xl space-y-6 py-8">
        <Card className="border-purple-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">סיכום מהיר</h2>
              <p className="mt-1 text-sm text-slate-600">
                בח״כ 121 הקול מנותב רק להצעות חוק. שאילתות ציבוריות והחלטות משרדיות שייכות לממשלה משתפת.
              </p>
            </div>
            <Scale className="h-8 w-8 text-purple-700" />
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">ברירת מחדל להצעות חוק</p>
            <p className="mt-1 font-bold text-slate-900">
              {hasDelegate ? `מואצל אל ${billAssignment.name}` : "בחירה ישירה"}
            </p>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-purple-700" />
            <h2 className="text-xl font-bold text-slate-900">הצעות חוק</h2>
          </div>
          <p className="mb-4 text-slate-700">
            כל הצעת חוק מציגה את מצב ההצבעה הנוכחי שלה, ואפשר להעביר אותה בין הצבעה ישירה לבין הצבעה מואצלת.
          </p>
          <div className="space-y-3">
            {bills.map((bill) => {
              const isDirect = !hasDelegate || Boolean(billDirectOverrides[String(bill.id)]);
              const status = isDirect ? "בחירה ישירה" : `מואצל אל ${billAssignment.name}`;

              return (
                <div
                  key={bill.id}
                  className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{bill.title}</span>
                    <p className={isDirect ? "mt-1 text-sm text-green-700" : "mt-1 text-sm text-purple-700"}>{status}</p>
                  </div>

                  {hasDelegate ? (
                    isDirect ? (
                      <Button variant="outline" onClick={() => setBillDelegated(bill.id)} className="md:w-44">
                        העבר למואצל
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setBillDirect(bill.id)} className="md:w-44">
                        העבר לישירה
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" onClick={() => setLocation(isAuthenticated ? "/delegate-selection?channel=mk121" : "/?signup=1")} className="md:w-44">
                      בחר מואצל
                    </Button>
                  )}
                </div>
              );
            })}
            {bills.length === 0 && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-600">
                אין הצעות חוק פעילות להצגה כרגע.
              </div>
            )}
          </div>
        </Card>

        <Button onClick={() => setLocation(isAuthenticated ? "/delegate-selection?channel=mk121" : "/?signup=1")} className="w-full bg-purple-700 hover:bg-purple-800">
          עדכן ניתוב קול להצעות חוק
        </Button>
      </main>
    </div>
  );
}
