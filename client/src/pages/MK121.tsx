import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ThumbsUp, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProposalSubmissionForms } from "@/components/ProposalSubmissionForms";

export default function MK121() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Queries with auto-refresh polling (every 30 seconds for live updates)
  const currentCycleQuery = trpc.mk121.getCurrentCycle.useQuery();
  const billsQuery = trpc.mk121.getBillsForCycle.useQuery(
    { cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 } // Refresh every 30 seconds
  );
  const questionsQuery = trpc.mk121.getQuestionsForCycle.useQuery(
    { cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 } // Refresh every 30 seconds
  );
  const userBillVotesQuery = trpc.mk121.getUserBillVotes.useQuery(
    { userId: user?.id || 0, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!user?.id && !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userQuestionVotesQuery = trpc.mk121.getUserQuestionVotes.useQuery(
    { userId: user?.id || 0, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!user?.id && !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userBillSupportsQuery = trpc.mk121.getUserBillSupports.useQuery(
    { userId: user?.id || 0, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!user?.id && !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userQuestionSupportsQuery = trpc.mk121.getUserQuestionSupports.useQuery(
    { userId: user?.id || 0, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!user?.id && !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );

  // Note: refetchInterval automatically stops when component unmounts

  // Mutations
  const voteBillMutation = trpc.mk121.voteBill.useMutation({
    onSuccess: () => {
      toast.success("הקול שלך נרשם!");
      userBillVotesQuery.refetch();
      billsQuery.refetch();
    },
    onError: () => {
      toast.error("אתה כבר הצבעת על הצעה זו");
    },
  });

  const voteQuestionMutation = trpc.mk121.voteQuestion.useMutation({
    onSuccess: () => {
      toast.success("הקול שלך נרשם!");
      userQuestionVotesQuery.refetch();
      questionsQuery.refetch();
    },
    onError: () => {
      toast.error("אתה כבר הצבעת על שאילתה זו");
    },
  });

  const supportBillMutation = trpc.mk121.supportBill.useMutation({
    onSuccess: () => {
      toast.success("תמיכתך נרשמה!");
      userBillSupportsQuery.refetch();
      billsQuery.refetch();
    },
    onError: () => {
      toast.error("שגיאה בתמיכה בהצעה");
    },
  });

  const removeBillSupportMutation = trpc.mk121.removeBillSupport.useMutation({
    onSuccess: () => {
      toast.success("התמיכה בוטלה");
      userBillSupportsQuery.refetch();
      billsQuery.refetch();
    },
    onError: () => {
      toast.error("שגיאה בביטול התמיכה");
    },
  });

  const supportQuestionMutation = trpc.mk121.supportQuestion.useMutation({
    onSuccess: () => {
      toast.success("תמיכתך נרשמה!");
      userQuestionSupportsQuery.refetch();
      questionsQuery.refetch();
    },
    onError: () => {
      toast.error("שגיאה בתמיכה בשאילתה");
    },
  });

  const removeQuestionSupportMutation = trpc.mk121.removeQuestionSupport.useMutation({
    onSuccess: () => {
      toast.success("התמיכה בוטלה");
      userQuestionSupportsQuery.refetch();
      questionsQuery.refetch();
    },
    onError: () => {
      toast.error("שגיאה בביטול התמיכה");
    },
  });

  const cycle = currentCycleQuery.data;
  const bills = billsQuery.data || [];
  const questions = questionsQuery.data || [];
  const userBillVotes = userBillVotesQuery.data || [];
  const userQuestionVotes = userQuestionVotesQuery.data || [];
  const userBillSupports = userBillSupportsQuery.data || [];
  const userQuestionSupports = userQuestionSupportsQuery.data || [];

  const handleVoteBill = (billId: number) => {
    if (!user?.id) return;
    voteBillMutation.mutate({ billId, userId: user.id });
  };

  const handleVoteQuestion = (questionId: number) => {
    if (!user?.id) return;
    voteQuestionMutation.mutate({ questionId, userId: user.id });
  };

  const handleSupportBill = (billId: number) => {
    if (!user?.id) return;
    if (userBillSupports.includes(billId)) {
      removeBillSupportMutation.mutate({ billId, userId: user.id });
    } else {
      supportBillMutation.mutate({ billId, userId: user.id });
    }
  };

  const handleSupportQuestion = (questionId: number) => {
    if (!user?.id) return;
    if (userQuestionSupports.includes(questionId)) {
      removeQuestionSupportMutation.mutate({ questionId, userId: user.id });
    } else {
      supportQuestionMutation.mutate({ questionId, userId: user.id });
    }
  };

  // Public access - no authentication required for demo

  const timeRemaining = cycle
    ? Math.ceil((new Date(cycle.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2 justify-end">
            חזרה לעמוד הבית
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">🗳️ ח"כ 121</h1>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-slate-600">מחזור {cycle?.seasonName}</p>
              {timeRemaining > 0 && <p className="text-sm font-bold text-blue-600">{timeRemaining} ימים נותרים</p>}
            </div>
            {isAuthenticated && cycle && (
              <Button
                onClick={() => setShowSubmissionForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הגש הצעה
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {!cycle ? (
          <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">אין מחזור פעיל כרגע</h2>
            <p className="text-slate-600">המחזור הבא של ח"כ 121 יתחיל בקרוב</p>
          </Card>
        ) : (
          <>
            {/* Info Card */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">מה זה ח"כ 121?</h2>
              <p className="text-slate-700 mb-4">
                כל 3 חודשים, אתה מצביע על הצעת החוק והשאילתה הדחופה ביותר. הצעת החוק הנבחרת מועברת לכנסת ישירות לקריאה ראשונה להצבעה ללא שום חסם או שינוי. השאילתה הנבחרת מועברת לנשאל לקבלת תשובה בצורת תשאול חי ומצולם.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-sm font-bold text-blue-600">📋 הצעות חוק</p>
                  <p className="text-lg font-bold text-slate-900">{bills.length}</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-sm font-bold text-blue-600">❓ שאילתות</p>
                  <p className="text-lg font-bold text-slate-900">{questions.length}</p>
                </div>
              </div>
            </Card>

            {/* Voting Tabs */}
            <Tabs defaultValue="bills" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="questions">❓ שאילתות ({questions.length})</TabsTrigger>
                <TabsTrigger value="bills">📋 הצעות חוק ({bills.length})</TabsTrigger>
              </TabsList>

              {/* Bills Tab */}
              <TabsContent value="bills" className="space-y-4">
                {bills.length === 0 ? (
                  <Card className="p-8 text-center bg-slate-50">
                    <p className="text-slate-600">אין הצעות חוק במחזור זה עדיין</p>
                  </Card>
                ) : (
                  bills.map((bill) => {
                    const hasVoted = userBillVotes.includes(bill.id);
                    const isWinner = bill.isWinner;

                    return (
                      <Card
                        key={bill.id}
                        className={`p-6 transition border-2 text-right ${
                          hasVoted ? "border-green-500 bg-green-50" : "border-slate-200"
                        } ${isWinner ? "ring-2 ring-yellow-400" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-3 flex-row-reverse">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900">{bill.title}</h3>
                            <div className="mt-2 flex gap-2 flex-row-reverse">
                              {bill.status && (
                                <Badge className={bill.status === 'preliminary' ? 'bg-purple-100 text-purple-700' : bill.status === 'voting' ? 'bg-blue-100 text-blue-700' : bill.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {bill.status === 'preliminary' ? '📋 דף מקדים' : bill.status === 'voting' ? '🗳️ הצבעה' : bill.status === 'approved' ? '✅ אושר' : '📁 ארכיון'}
                                </Badge>
                              )}
                              {bill.category && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {bill.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-3xl font-bold text-blue-600">{bill.votes}</div>
                            <p className="text-xs text-slate-600">קולות</p>
                            {isWinner && (
                              <Badge className="mt-2 bg-yellow-500">🏆 נבחר</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4">{bill.description}</p>

                        {/* Quorum Info */}
                        {bill.status === 'voting' && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200 text-sm text-blue-700">
                            <strong>🗳️ דרישה מינימאלית:</strong> צריך לפחות 37,500 קולות בשביל להצעה לדיון הרשמי (1/120 מהמצביעים)
                          </div>
                        )}

                        {/* Support Section (Preliminary Stage) */}
                        <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-purple-700">דף מקדים - צבירת תמיכה</span>
                            <span className="text-lg font-bold text-purple-600">{bill.supporters || 0}/100</span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(((bill.supporters || 0) / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <Button
                            onClick={() => handleSupportBill(bill.id)}
                            disabled={supportBillMutation.isPending || removeBillSupportMutation.isPending}
                            variant={userBillSupports.includes(bill.id) ? "default" : "outline"}
                            size="sm"
                            className={`w-full ${
                              userBillSupports.includes(bill.id)
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "border-purple-300 text-purple-600 hover:bg-purple-50"
                            }`}
                          >
                            {userBillSupports.includes(bill.id) ? "✓ תומך" : "+ תמוך בהצעה"}
                          </Button>
                        </div>

                        <Button
                          onClick={() => handleVoteBill(bill.id)}
                          disabled={hasVoted || voteBillMutation.isPending}
                          variant={hasVoted ? "default" : "outline"}
                          className={`w-full flex justify-center ${
                            hasVoted
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-blue-300 text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {hasVoted ? (
                            <>
                              ✓ הצבעת
                              <CheckCircle className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              הצבע בעד הצעה זו
                              <ThumbsUp className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-4">
                {questions.length === 0 ? (
                  <Card className="p-8 text-center bg-slate-50">
                    <p className="text-slate-600">אין שאילתות במחזור זה עדיין</p>
                  </Card>
                ) : (
                  questions.map((question) => {
                    const hasVoted = userQuestionVotes.includes(question.id);
                    const isWinner = question.isWinner;

                    const urgencyColor = {
                      low: "bg-blue-50 text-blue-700 border-blue-200",
                      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
                      high: "bg-red-50 text-red-700 border-red-200",
                    };

                    return (
                      <Card
                        key={question.id}
                        className={`p-6 transition border-2 text-right ${
                          hasVoted ? "border-green-500 bg-green-50" : "border-slate-200"
                        } ${isWinner ? "ring-2 ring-yellow-400" : ""}`}
                      >
                        <div className="flex items-start justify-between mb-3 flex-row-reverse">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900">{question.title}</h3>
                            <div className="mt-2 flex gap-2 flex-row-reverse">
                              {question.targetMinistry && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {question.targetMinistry}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={urgencyColor[question.urgency as keyof typeof urgencyColor]}
                              >
                                {question.urgency === "low"
                                  ? "🟢 נמוכה"
                                  : question.urgency === "medium"
                                    ? "🟡 בינונית"
                                    : "🔴 גבוהה"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-3xl font-bold text-purple-600">{question.votes}</div>
                            <p className="text-xs text-slate-600">קולות</p>
                            {isWinner && (
                              <Badge className="mt-2 bg-yellow-500">🏆 נבחר</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4">{question.description}</p>

                        {/* Support Section (Preliminary Stage) */}
                        <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-purple-700">דף מקדים - צבירת תמיכה</span>
                            <span className="text-lg font-bold text-purple-600">{question.supporters || 0}/100</span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(((question.supporters || 0) / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <Button
                            onClick={() => handleSupportQuestion(question.id)}
                            disabled={supportQuestionMutation.isPending || removeQuestionSupportMutation.isPending}
                            variant={userQuestionSupports.includes(question.id) ? "default" : "outline"}
                            size="sm"
                            className={`w-full ${
                              userQuestionSupports.includes(question.id)
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "border-purple-300 text-purple-600 hover:bg-purple-50"
                            }`}
                          >
                            {userQuestionSupports.includes(question.id) ? "✓ תומך" : "+ תמוך בשאילתה"}
                          </Button>
                        </div>

                        <Button
                          onClick={() => handleVoteQuestion(question.id)}
                          disabled={hasVoted || voteQuestionMutation.isPending}
                          variant={hasVoted ? "default" : "outline"}
                          className={`w-full flex justify-center ${
                            hasVoted
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-purple-300 text-purple-600 hover:bg-purple-50"
                          }`}
                        >
                          {hasVoted ? (
                            <>
                              ✓ הצבעת
                              <CheckCircle className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              הצבע בעד שאילתה זו
                            </>
                          )}
                        </Button>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Proposal Submission Modal */}
      {showSubmissionForm && cycle && user && (
        <ProposalSubmissionForms
          cycleId={cycle.id}
          userId={user.id}
          onSuccess={() => {
            setShowSubmissionForm(false);
            billsQuery.refetch();
            questionsQuery.refetch();
          }}
          onClose={() => setShowSubmissionForm(false)}
        />
      )}
    </div>
  );
}
