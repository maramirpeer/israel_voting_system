import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Ministry {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
}

interface PendingDecision {
  id: number;
  title: string;
  votesFor: number;
  votesAgainst: number;
  percentageFor: number;
  percentageAgainst: number;
}

interface PendingDecisionsGridProps {
  ministries: Ministry[];
  onVote: (decisionId: number, vote: "for" | "against") => void;
  isVoting: boolean;
}

export function PendingDecisionsGrid({ ministries, onVote, isVoting }: PendingDecisionsGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-right">המשרדים - הצעות פעילות</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {ministries.map((ministry) => {
          // Generate 2-4 random ministerial proposals per ministry
          const decisionCount = 2 + ((ministry.id * 13) % 3); // 2-4 decisions

          // Define ministry-specific proposals
          const ministryProposals: { [key: string]: string[] } = {
            "משרד האוצר": [
              "הגדלת תקציב להשקעות",
              "שיפור מערכת המס",
              "תמיכה בעסקים קטנים",
              "הנחות כלכליות",
            ],
            "משרד הביטחון": [
              "שדרוג מערכת ההגנה",
              "הרחבת בסיסים צבאיים",
              "השקעה בטכנולוגיה צבאית",
              "תוכנית הכשרה חדשה",
            ],
            "משרד הבריאות": [
              "הקמת מרכזי בריאות",
              "שיפור שירותי בריאות נפשית",
              "חיסון ילדים חדש",
              "תוכנית מניעת מחלות",
            ],
            "משרד החדשנות ואיכות הסביבה": [
              "קידום אנרגיה ירוקה",
              "הקמת תחנות טעינה",
              "שימור טבע",
              "מחקר סביבתי",
            ],
            "משרד החוץ וההסברה העולמית": [
              "שיפור יחסים דיפלומטיים",
              "קידום הסברה בחו\"ל",
              "שיתופי פעולה בינלאומיים",
              "תוכנית תרבות",
            ],
            "משרד החינוך": [
              "שיפור תוכניות לימוד",
              "הקמת בתי ספר חדשים",
              "השקעה בטכנולוגיה חינוכית",
              "תוכנית מלגות",
            ],
            "משרד המשפטים": [
              "שיפור מערכת המשפט",
              "הגנה על זכויות אדם",
              "חוקים חדשים",
              "תוכנית הגנה על הצרכן",
            ],
            "משרד הפנים, החברה והרווחה": [
              "תוכנית שיכון חברתי",
              "שיפור שירותים סוציאליים",
              "תמיכה בקשישים",
              "פיתוח כפרי",
            ],
            "משרד התרבות": [
              "קידום אמנות וספורט",
              "הקמת מוזיאונים",
              "תוכנית תרבות קהילתית",
              "תמיכה באמנים",
            ],
          };

          const proposals = ministryProposals[ministry.name] || [
            "הצעה 1",
            "הצעה 2",
            "הצעה 3",
            "הצעה 4",
          ];

          const pendingDecisions: PendingDecision[] = Array.from(
            { length: decisionCount },
            (_, idx) => {
              const decisionId = ministry.id * 100 + idx;
              const baseVotes = 2000 + ((decisionId * 137) % 8000);
              // Generate percentage between 30% and 70% to ensure balanced mix
              const forPercentage = 30 + ((decisionId * 23) % 41); // 30-70%
              const votesFor = Math.floor(baseVotes * (forPercentage / 100));
              const votesAgainst = baseVotes - votesFor;
              const percentageFor = (votesFor / baseVotes) * 100;
              const percentageAgainst = (votesAgainst / baseVotes) * 100;

              const title = proposals[idx % proposals.length];

              return {
                id: decisionId,
                title: title,
                votesFor,
                votesAgainst,
                percentageFor,
                percentageAgainst,
              };
            }
          );

          return (
            <Card key={ministry.id} className="p-6 border-2 border-slate-200 text-right">
              <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                <div className="text-4xl">{ministry.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900">{ministry.name}</h3>
                  <p className="text-xs text-slate-600">
                    {decisionCount} הצעות פעילות
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {pendingDecisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="bg-slate-50 p-3 rounded-lg border border-slate-200"
                  >
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {decision.title}
                    </p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="font-medium text-green-600">בעד</span>{" "}
                        <span className="font-medium text-green-600">
                          {decision.votesFor.toLocaleString("he-IL")}
                        </span> ({decision.percentageFor.toFixed(0)}%) |
                        <span className="font-medium text-red-600">נגד</span>{" "}
                        <span className="font-medium text-red-600 mr-1">
                          {decision.votesAgainst.toLocaleString("he-IL")}
                        </span> ({decision.percentageAgainst.toFixed(0)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex mb-2">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${decision.percentageFor}%` }}
                      ></div>
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${decision.percentageAgainst}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2 flex-row-reverse">
                      <Button
                        onClick={() => onVote(decision.id, "for")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 h-auto font-medium"
                        disabled={isVoting}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        בעד
                      </Button>
                      <Button
                        onClick={() => onVote(decision.id, "against")}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 h-auto font-medium"
                        disabled={isVoting}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        נגד
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
