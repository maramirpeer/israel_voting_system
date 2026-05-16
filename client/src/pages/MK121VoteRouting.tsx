import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, HelpCircle, Scale } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

type MK121Assignment = { type: "direct" | "expert" | "citizen"; name?: string };
type MK121QuestionAssignment = { ministryId: number; ministryName?: string; delegateId: number; delegateName?: string };

const MK121_ASSIGNMENT_KEY = "mk121-vote-assignment";
const MK121_BILL_DIRECT_OVERRIDES_KEY = "mk121-bill-direct-overrides";
const MK121_QUESTION_ASSIGNMENTS_KEY = "mk121-question-assignments";

const demoBills = [
  { id: 201, title: "חובת פרסום יומן פגישות של רגולטורים" },
  { id: 202, title: "החזר אוטומטי על איחור חמור בתחבורה ציבורית" },
  { id: 204, title: "הגבלת כהונת ראש ממשלה ל-8 שנים" },
  { id: 205, title: "חובת הצבעה של כל חברי הכנסת בהצבעות מליאה" },
  { id: 206, title: "זירת מידע ממוקדת: שאלה בשנה לכל חבר כנסת" },
];

const ministries = [
  { id: 8, name: "משרד האוצר" },
  { id: 11, name: "משרד הפנים, החברה והרווחה" },
  { id: 6, name: "משרד הביטחון" },
  { id: 9, name: "משרד המשפטים" },
  { id: 4, name: "משרד החדשנות ואיכות הסביבה" },
  { id: 7, name: "משרד החוץ וההסברה העולמית" },
  { id: 3, name: "משרד החינוך" },
  { id: 1, name: "משרד הבריאות" },
  { id: 17, name: "משרד התרבות" },
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
  const billDirectOverrides = readJson<Record<string, boolean>>(MK121_BILL_DIRECT_OVERRIDES_KEY, {});
  const questionAssignments = readJson<Record<string, MK121QuestionAssignment>>(MK121_QUESTION_ASSIGNMENTS_KEY, {});

  const directBillOverrides = useMemo(
    () => demoBills.filter((bill) => billDirectOverrides[String(bill.id)]),
    [billDirectOverrides]
  );

  const delegatedQuestions = ministries.filter((ministry) => questionAssignments[String(ministry.id)]?.delegateName);
  const directQuestionCount = ministries.length - delegatedQuestions.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4 flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/mk121")} className="flex items-center gap-2 justify-end">
            חזרה לח"כ 121
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">איך הקול שלי מנותב</h1>
          <span className="text-sm text-slate-600">ח"כ 121</span>
        </div>
      </header>

      <main className="container max-w-5xl space-y-6 py-8">
        <Card className="border-purple-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">סיכום מהיר</h2>
              <p className="mt-1 text-sm text-slate-600">זה המקום שבו רואים האם הקול נשאר אצלך או עובר למומחה.</p>
            </div>
            <Scale className="h-8 w-8 text-purple-700" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">הצעות חוק</p>
              <p className="mt-1 font-bold text-slate-900">
                {billAssignment.type === "direct" ? "בחירה ישירה" : `מואצל אל ${billAssignment.name}`}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">הצעות חוק שהוחזרו אליך</p>
              <p className="mt-1 font-bold text-slate-900">{directBillOverrides.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">שאילתות בבחירה ישירה</p>
              <p className="mt-1 font-bold text-slate-900">{directQuestionCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-6 w-6 text-purple-700" />
            <h2 className="text-xl font-bold text-slate-900">הצעות חוק</h2>
          </div>
          <p className="mb-4 text-slate-700">
            {billAssignment.type === "direct"
              ? "כל הצעות החוק נמצאות בבחירה ישירה שלך."
              : `ברירת המחדל להצעות חוק מואצלת אל ${billAssignment.name}. שינוי להצבעה ישירה משפיע רק על ההצעה הספציפית.`}
          </p>
          <div className="space-y-3">
            {demoBills.map((bill) => {
              const isDirect = billAssignment.type === "direct" || billDirectOverrides[String(bill.id)];
              return (
                <div key={bill.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold text-slate-900">{bill.title}</span>
                  <span className={isDirect ? "text-green-700" : "text-purple-700"}>
                    {isDirect ? "בחירה ישירה" : `מואצל אל ${billAssignment.name}`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-purple-700" />
            <h2 className="text-xl font-bold text-slate-900">שאילתות משרדיות</h2>
          </div>
          <div className="space-y-3">
            {ministries.map((ministry) => {
              const assignment = questionAssignments[String(ministry.id)];
              return (
                <div key={ministry.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold text-slate-900">{ministry.name}</span>
                  <span className={assignment?.delegateName ? "text-purple-700" : "text-green-700"}>
                    {assignment?.delegateName ? `מואצל אל ${assignment.delegateName}` : "בחירה ישירה"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Button onClick={() => setLocation("/delegate-selection?channel=mk121")} className="w-full bg-purple-700 hover:bg-purple-800">
          עדכן ניתוב קול
        </Button>
      </main>
    </div>
  );
}
