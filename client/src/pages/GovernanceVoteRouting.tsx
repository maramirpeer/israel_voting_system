import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Building2, Route } from "lucide-react";
import { useLocation } from "wouter";

type GovernanceAssignment = {
  ministryId: number;
  votingMethod: "direct" | "delegate";
  delegateName?: string;
  citizenName?: string;
};

const GOVERNANCE_ASSIGNMENTS_KEY = "governance-vote-assignments";

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

const readAssignments = (): Record<string, GovernanceAssignment> => {
  if (typeof window === "undefined") return {};
  try {
    const saved = window.localStorage.getItem(GOVERNANCE_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const getAssignmentText = (assignment?: GovernanceAssignment) => {
  if (!assignment || assignment.votingMethod === "direct") return "בחירה ישירה";
  if (assignment.delegateName) return `מואצל אל מומחה: ${assignment.delegateName}`;
  if (assignment.citizenName) return `מואצל אל אזרח: ${assignment.citizenName}`;
  return "מואצל";
};

export default function GovernanceVoteRouting() {
  const [, setLocation] = useLocation();
  const assignments = readAssignments();
  const delegatedCount = ministries.filter((ministry) => assignments[String(ministry.id)]?.votingMethod === "delegate").length;
  const directCount = ministries.length - delegatedCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4 flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2 justify-end">
            חזרה לממשלה שקופה
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">איך הקול שלי מנותב</h1>
          <span className="text-sm text-slate-600">ממשלה שקופה</span>
        </div>
      </header>

      <main className="container max-w-5xl space-y-6 py-8">
        <Card className="border-purple-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">סיכום ניתוב לפי משרדים</h2>
              <p className="mt-1 text-sm text-slate-600">כל משרד יכול להישאר בבחירה ישירה או להיות מואצל למומחה/אזרח.</p>
            </div>
            <Route className="h-8 w-8 text-purple-700" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">משרדים בבחירה ישירה</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{directCount}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">משרדים מואצלים</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">{delegatedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-purple-700" />
            <h2 className="text-xl font-bold text-slate-900">פירוט לפי משרד</h2>
          </div>
          <div className="space-y-3">
            {ministries.map((ministry) => {
              const assignment = assignments[String(ministry.id)];
              const isDelegated = assignment?.votingMethod === "delegate";
              return (
                <div key={ministry.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold text-slate-900">{ministry.name}</span>
                  <span className={isDelegated ? "text-purple-700" : "text-green-700"}>{getAssignmentText(assignment)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-purple-100 bg-purple-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">אפילוג</h2>
          <p className="mt-3 leading-8 text-slate-700">
            הפרויקט הוא שירת הברבור של הדמוקרטיה הנוכחית. אנחנו הדור האחרון: דור שמבין
            שהוא עומד על סף שינוי עמוק, ולכן בוחר להפוך את שנותיו האחרונות של כוח והשפעה
            למהלך של תיקון, אחריות והורשה לדורות הבאים.
          </p>
          <p className="mt-3 leading-8 text-slate-700">
            האצלת קול אינה ויתור על הקול. היא דרך לראות את האחריות עוברת בצורה גלויה:
            מי מחזיק בקול עכשיו, בשם מה הוא מחזיק בו, ומתי אני בוחר להחזיר אותו אלי.
          </p>
        </Card>

        <Button onClick={() => setLocation("/delegate-selection")} className="w-full bg-purple-700 hover:bg-purple-800">
          עדכן ניתוב קול
        </Button>
      </main>
    </div>
  );
}
