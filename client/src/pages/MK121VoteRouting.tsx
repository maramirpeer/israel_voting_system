import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

type MK121Assignment = { type: "direct" | "expert" | "citizen"; name?: string };

const MK121_ASSIGNMENT_KEY = "mk121-vote-assignment";
const MK121_BILL_DIRECT_OVERRIDES_KEY = "mk121-bill-direct-overrides";

const demoBills = [
  { id: 204, title: "הגבלת זמן ראש הממשלה" },
  { id: 205, title: "כל ח״כ חייב להצביע" },
  { id: 206, title: "זירת מידע חיה של שאלות ותשובות בין ח״כ" },
  { id: 203, title: "שקיפות" },
  { id: 201, title: "חובת פרסום יומן פגישות של רגולטורים" },
  { id: 202, title: "החזר אוטומטי על איחור חמור בתחבורה ציבורית" },
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
  const [, setLocation] = useLocation();
  const billAssignment = readJson<MK121Assignment>(MK121_ASSIGNMENT_KEY, { type: "direct" });
  const [billDirectOverrides, setBillDirectOverrides] = useState<Record<string, boolean>>(() =>
    readJson<Record<string, boolean>>(MK121_BILL_DIRECT_OVERRIDES_KEY, {})
  );

  const hasDelegate = billAssignment.type !== "direct" && Boolean(billAssignment.name);

  const saveBillDirectOverrides = (next: Record<string, boolean>) => {
    setBillDirectOverrides(next);
    window.localStorage.setItem(MK121_BILL_DIRECT_OVERRIDES_KEY, JSON.stringify(next));
  };

  const setBillDirect = (billId: number) => {
    saveBillDirectOverrides({ ...billDirectOverrides, [String(billId)]: true });
  };

  const setBillDelegated = (billId: number) => {
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
            {demoBills.map((bill) => {
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
                    <Button variant="outline" onClick={() => setLocation("/delegate-selection?channel=mk121")} className="md:w-44">
                      בחר מואצל
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Button onClick={() => setLocation("/delegate-selection?channel=mk121")} className="w-full bg-purple-700 hover:bg-purple-800">
          עדכן ניתוב קול להצעות חוק
        </Button>
      </main>
    </div>
  );
}
