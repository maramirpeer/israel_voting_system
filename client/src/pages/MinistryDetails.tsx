import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, ThumbsUp, ThumbsDown, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

export default function MinistryDetails({ params }: { params: { id: string } }) {
  const ministryId = parseInt(params.id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: string }>({});

  // Queries
  const detailsQuery = trpc.governance.ministryDetails.getDetails.useQuery({ ministryId });
  const approvedQuery = trpc.governance.ministryDetails.getApprovedDecisions.useQuery({ ministryId });
  const pendingQuery = trpc.governance.ministryDetails.getPendingDecisions.useQuery({ ministryId });

  const details = detailsQuery.data;
  const approved = approvedQuery.data || [];
  const pending = pendingQuery.data || [];

  // Calculate time remaining for pending decisions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: number]: string } = {};
      pending.forEach((decision) => {
        if (decision.publicVotingEndsAt) {
          const now = new Date();
          const end = new Date(decision.publicVotingEndsAt);
          const diff = end.getTime() - now.getTime();

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            newTimeRemaining[decision.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeRemaining[decision.id] = "הצבעה הסתיימה";
          }
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [pending]);

  if (detailsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container py-4">
            <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2 justify-end">
              חזרה לממשל
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <main className="container py-8">
          <div className="text-center">
            <p className="text-slate-600">טוען...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container py-4">
            <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2 justify-end">
              חזרה לממשל
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <main className="container py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">משרד לא נמצא</h2>
            <p className="text-slate-600">לא הצלחנו למצוא את המשרד המבוקש</p>
          </Card>
        </main>
      </div>
    );
  }

  const stats = details.stats;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <div>
            <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2 justify-end">
              חזרה לממשל
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {details.ministry.icon} {details.ministry.name}
          </h1>
          <div></div>
        </div>
      </header>

      <main className="container py-8">
        {/* Ministry Header */}
        <div className="mb-8">
          <p className="text-slate-600 text-lg mb-2">{details.ministry.description}</p>
        </div>

        {/* Key Statistics */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-sm text-blue-600 font-medium">סה"כ החלטות</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalDecisions}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-sm text-green-600 font-medium">מאושרות</p>
                <p className="text-3xl font-bold text-green-900">{stats.approvedDecisions}</p>
                <p className="text-xs text-green-700 mt-1">{stats.approvalRate.toFixed(1)}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-sm text-red-600 font-medium">נדחות</p>
                <p className="text-3xl font-bold text-red-900">{stats.rejectedDecisions}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-sm text-yellow-600 font-medium">בהצבעה</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pendingDecisions}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-right">
            <div className="flex items-center justify-between flex-row-reverse">
              <div>
                <p className="text-sm text-purple-600 font-medium">קולות ציבור</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalPublicVotes}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pending">
              החלטות בהמתנה ({stats.pendingDecisions})
            </TabsTrigger>
            <TabsTrigger value="approved">
              החלטות מאושרות ({stats.approvedDecisions})
            </TabsTrigger>
          </TabsList>

          {/* Pending Decisions Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">אין החלטות בהצבעה כרגע</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pending.map((decision) => {
                  const votesFor = decision.publicVotesFor || 0;
                  const votesAgainst = decision.publicVotesAgainst || 0;
                  const totalVotes = votesFor + votesAgainst;
                  const percentageFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
                  const percentageAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

                  return (
                    <Card key={decision.id} className="p-6 border-l-4 border-yellow-500 text-right">
                      <div className="flex items-start justify-between flex-row-reverse mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">{decision.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{decision.description}</p>
                          <div className="flex gap-2 mt-3 flex-row-reverse">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              🕐 {timeRemaining[decision.id] || "טוען..."}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {decision.category === "major" ? "🔴 גדולה" : decision.category === "medium" ? "🟡 בינונית" : "🔵 שגרתית"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Vote Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm flex-row-reverse">
                          <span className="text-slate-600">קולות בעד</span>
                          <span className="font-bold text-green-600">{votesFor} ({percentageFor.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentageFor} className="h-2" />

                        <div className="flex items-center justify-between text-sm flex-row-reverse">
                          <span className="text-slate-600">קולות נגד</span>
                          <span className="font-bold text-red-600">{votesAgainst} ({percentageAgainst.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentageAgainst} className="h-2" />
                      </div>

                      <div className="text-xs text-slate-500 text-right">
                        סה"כ קולות: {totalVotes}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Approved Decisions Tab */}
          <TabsContent value="approved" className="space-y-4">
            {approved.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">אין החלטות מאושרות עדיין</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approved.map((decision) => {
                  const votesFor = decision.votesFor || 0;
                  const votesAgainst = decision.votesAgainst || 0;
                  const totalVotes = votesFor + votesAgainst;
                  const percentageFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
                  const percentageAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

                  return (
                    <Card key={decision.id} className="p-6 border-l-4 border-green-500 text-right">
                      <div className="flex items-start justify-between flex-row-reverse mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                            <h3 className="text-lg font-bold text-slate-900">{decision.title}</h3>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              ✓ מאושרת
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{decision.description}</p>
                          <div className="flex gap-2 mt-3 flex-row-reverse">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {decision.category === "major" ? "🔴 גדולה" : decision.category === "medium" ? "🟡 בינונית" : "🔵 שגרתית"}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                              {new Date(decision.updatedAt).toLocaleDateString("he-IL")}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Vote Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm flex-row-reverse">
                          <span className="text-slate-600">קולות בעד</span>
                          <span className="font-bold text-green-600">{votesFor} ({percentageFor.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentageFor} className="h-2" />

                        <div className="flex items-center justify-between text-sm flex-row-reverse">
                          <span className="text-slate-600">קולות נגד</span>
                          <span className="font-bold text-red-600">{votesAgainst} ({percentageAgainst.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentageAgainst} className="h-2" />
                      </div>

                      <div className="text-xs text-slate-500 text-right">
                        סה"כ קולות: {totalVotes}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
