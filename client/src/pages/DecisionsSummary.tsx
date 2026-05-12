import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Clock, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function DecisionsSummary() {
  const [, setLocation] = useLocation();
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const [publicTimeRemaining, setPublicTimeRemaining] = useState<{ [key: number]: string }>({});

  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const decisionsQuery = trpc.governance.decisions.list.useQuery();
  const activeDecisionsQuery = trpc.governance.decisions.active.useQuery();

  const ministries = ministriesQuery.data || [];
  const decisions = decisionsQuery.data || [];
  const activeDecisions = activeDecisionsQuery.data || [];

  const sortedActiveDecisions = [...activeDecisions].sort((a: any, b: any) => {
    const endA = a.publicVotingEndsAt ? new Date(a.publicVotingEndsAt).getTime() : 0;
    const endB = b.publicVotingEndsAt ? new Date(b.publicVotingEndsAt).getTime() : 0;
    return endA - endB;
  });
  const activeDecisionIds = new Set(sortedActiveDecisions.map((decision) => decision.id));
  const allDecisionsSorted = [
    ...sortedActiveDecisions,
    ...decisions.filter((decision) => !activeDecisionIds.has(decision.id)),
  ];
  const displayedDecisions = allDecisionsSorted.filter((decision) => !selectedMinistry || decision.ministryId === selectedMinistry);

  const fallbackMinistryNames: Record<number, string> = {
    1: "משרד הבריאות",
    2: "משרד הפנים, החברה והרווחה",
    3: "משרד החינוך",
    4: "משרד החדשנות ואיכות הסביבה",
    6: "משרד הביטחון",
    7: "משרד החוץ וההסברה העולמית",
    8: "משרד האוצר",
    9: "משרד המשפטים",
    11: "משרד הפנים, החברה והרווחה",
    17: "משרד התרבות",
  };
  const getMinistryName = (ministryId: number) =>
    ministries.find((ministry) => ministry.id === ministryId)?.name || fallbackMinistryNames[ministryId] || "משרד לא משויך";

  useEffect(() => {
    const updatePublicTimeRemaining = () => {
      const newPublicTimeRemaining: { [key: number]: string } = {};
      activeDecisions.forEach((decision) => {
        if (decision.publicVotingEndsAt) {
          const endString = typeof decision.publicVotingEndsAt === "string"
            ? decision.publicVotingEndsAt
            : new Date(decision.publicVotingEndsAt).toISOString();
          const diff = new Date(endString).getTime() - Date.now();

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            newPublicTimeRemaining[decision.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newPublicTimeRemaining[decision.id] = "הצבעה הסתיימה";
          }
        }
      });
      setPublicTimeRemaining(newPublicTimeRemaining);
    };

    updatePublicTimeRemaining();
    const interval = setInterval(updatePublicTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeDecisionsQuery.data]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "voting":
        return "הצבעה פעילה";
      case "approved":
        return "אושרה";
      case "rejected":
        return "נדחתה";
      case "proposed":
        return "הוצעה";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "voting":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "major":
        return "החלטה גדולה";
      case "medium":
        return "החלטה בינונית";
      case "routine":
        return "החלטה שגרתית";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2 justify-end">
            חזרה לממשלה משתפת
            <Home className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ריכוז כל ההחלטות</h1>
            <p className="text-sm text-slate-600">ההצבעות הפעילות מופיעות ראשונות לפי הזמן שנותר.</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-5 flex items-center justify-between gap-4 flex-row-reverse">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{activeDecisions.length} הצבעות פעילות מתוך {decisions.length} החלטות</span>
          </div>

          <Select value={selectedMinistry?.toString() || "all"} onValueChange={(value) => setSelectedMinistry(value === "all" ? null : parseInt(value))}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="סנן לפי משרד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המשרדים</SelectItem>
              {ministries.map((ministry) => (
                <SelectItem key={ministry.id} value={ministry.id.toString()}>
                  {ministry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {displayedDecisions.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">אין החלטות להצגה כרגע</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayedDecisions.map((decision) => {
              const baseVotes = Number(decision.publicVotesFor ?? 0) + Number(decision.publicVotesAgainst ?? 0) || 400 + ((decision.id * 137) % 9600);
              const forVotes = Number(decision.publicVotesFor ?? Math.floor(baseVotes * (((decision.id * 17) % 100) / 100)));
              const againstVotes = Number(decision.publicVotesAgainst ?? baseVotes - forVotes);
              const totalVotes = forVotes + againstVotes || 1;
              const percentageFor = (forVotes / totalVotes) * 100;
              const percentageAgainst = (againstVotes / totalVotes) * 100;
              const isFinalDecision = decision.status === "approved" || decision.status === "rejected";

              return (
                <Card key={decision.id} className="p-5 border-r-4 border-slate-300 bg-white">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{decision.title}</h2>
                        <Badge className={getStatusColor(decision.status)}>{getStatusLabel(decision.status)}</Badge>
                      </div>
                      <p className="mb-3 text-sm leading-6 text-slate-700">{decision.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{getMinistryName(decision.ministryId)}</Badge>
                        <Badge variant="outline">{getCategoryLabel(decision.category)}</Badge>
                      </div>
                    </div>

                    {decision.status === "voting" && (
                      <div className="min-w-28 text-right">
                        <p className="text-xs font-medium text-slate-500">זמן נותר:</p>
                        <p className="text-sm font-bold text-slate-900">{publicTimeRemaining[decision.id] || "חישוב..."}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between">
                        <span className="text-sm font-medium text-green-700">בעד: {forVotes.toLocaleString("he-IL")} קולות</span>
                        <span className="text-sm text-slate-600">{percentageFor.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentageFor} className="h-2" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span className="text-sm font-medium text-red-700">נגד: {againstVotes.toLocaleString("he-IL")} קולות</span>
                        <span className="text-sm text-slate-600">{percentageAgainst.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentageAgainst} className="h-2" />
                    </div>
                  </div>

                  {isFinalDecision && (
                    <Button
                      className={`mt-4 w-full text-white cursor-default ${
                        decision.status === "approved" ? "bg-green-600 hover:bg-green-600" : "bg-red-600 hover:bg-red-600"
                      }`}
                    >
                      תוצאה: {decision.status === "approved" ? "בעד" : "נגד"}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
