import { useAuth } from "@/_core/hooks/useAuth";
import { toDate } from "@/lib/dateUtils";

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
  const demoUser = user || { id: 1, name: "ישראל ישראלי", email: "demo@example.local" };
  const [, setLocation] = useLocation();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [localBillVotes, setLocalBillVotes] = useState<number[]>([]);
  const [localQuestionVotes, setLocalQuestionVotes] = useState<number[]>([]);
  const [localBillVoteIncrements, setLocalBillVoteIncrements] = useState<Record<number, number>>({});
  const [localQuestionVoteIncrements, setLocalQuestionVoteIncrements] = useState<Record<number, number>>({});

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
    { userId: demoUser.id, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userQuestionVotesQuery = trpc.mk121.getUserQuestionVotes.useQuery(
    { userId: demoUser.id, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userBillSupportsQuery = trpc.mk121.getUserBillSupports.useQuery(
    { userId: demoUser.id, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 }
  );
  const userQuestionSupportsQuery = trpc.mk121.getUserQuestionSupports.useQuery(
    { userId: demoUser.id, cycleId: currentCycleQuery.data?.id || 0 },
    { enabled: !!currentCycleQuery.data?.id, refetchInterval: 30000 }
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
      toast.error("אתה כבר הצבעת על שאילתא זו");
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
      toast.error("שגיאה בתמיכה בשאילתא");
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

  // Debug: Log query state
  useEffect(() => {
    console.log('[MK121] Query state:', {
      cycleData: currentCycleQuery.data,
      cycleLoading: currentCycleQuery.isLoading,
      cycleError: currentCycleQuery.error,
    });
  }, [currentCycleQuery.data, currentCycleQuery.isLoading, currentCycleQuery.error]);
  const userBillVotes = Array.from(new Set([...(userBillVotesQuery.data || []), ...localBillVotes]));
  const userQuestionVotes = Array.from(new Set([...(userQuestionVotesQuery.data || []), ...localQuestionVotes]));
  const userBillSupports = userBillSupportsQuery.data || [];
  const userQuestionSupports = userQuestionSupportsQuery.data || [];
  const demoExpertNames = ["יעל בן דוד", "דניאל מזרחי", "הילה שפירא", "רועי אלון", "נעמה כץ", "אורי גבאי"];
  const legalExperts = [
    {
      name: "עו\"ד תמר לוי",
      role: "חקיקה וממשל",
      expertise: ["ניסוח חקיקה", "משפט ציבורי", "איזונים חוקתיים"],
      endorsements: 1280,
    },
    {
      name: "פרופ' אמיר כהן",
      role: "משפט חוקתי",
      expertise: ["ביקורת חוקתית", "סמכויות הכנסת", "זכויות ציבור"],
      endorsements: 970,
    },
    {
      name: "ד\"ר מיכל ברק",
      role: "מדיניות ציבורית",
      expertise: ["השפעות רגולציה", "יישום חוק", "פיקוח פרלמנטרי"],
      endorsements: 845,
    },
  ];

  const getQuestionExperts = (ministryId: number | null | undefined, ministryName: string | null | undefined) => {
    const cleanMinistryName = (ministryName || "המשרד הרלוונטי").replace("משרד ", "");
    const base = ministryId || 1;
    return [0, 1, 2].map((index) => ({
      name: demoExpertNames[(base + index) % demoExpertNames.length],
      role: `מומחה/ית ${cleanMinistryName}`,
      expertise: [`מדיניות ${cleanMinistryName}`, "ניתוח החלטות", "שיתוף ציבור"],
      endorsements: 620 + ((base + index) * 137) % 1400,
    }));
  };

  const handleVoteBill = (billId: number) => {
    if (userBillVotes.includes(billId)) {
      setLocalBillVotes((current) => current.filter((id) => id !== billId));
      setLocalBillVoteIncrements((current) => ({
        ...current,
        [billId]: Math.max((current[billId] || 0) - 1, -1),
      }));
      toast.success("ההצבעה בוטלה");
      return;
    }
    setLocalBillVotes((current) => [...current, billId]);
    setLocalBillVoteIncrements((current) => ({
      ...current,
      [billId]: (current[billId] || 0) + 1,
    }));
    voteBillMutation.mutate({ billId, userId: demoUser.id });
  };

  const handleVoteQuestion = (questionId: number) => {
    if (userQuestionVotes.includes(questionId)) {
      setLocalQuestionVotes((current) => current.filter((id) => id !== questionId));
      setLocalQuestionVoteIncrements((current) => ({
        ...current,
        [questionId]: Math.max((current[questionId] || 0) - 1, -1),
      }));
      toast.success("ההצבעה בוטלה");
      return;
    }
    setLocalQuestionVotes((current) => [...current, questionId]);
    setLocalQuestionVoteIncrements((current) => ({
      ...current,
      [questionId]: (current[questionId] || 0) + 1,
    }));
    voteQuestionMutation.mutate({ questionId, userId: demoUser.id });
  };

  const handleSupportBill = (billId: number) => {
    if (userBillSupports.includes(billId)) {
      removeBillSupportMutation.mutate({ billId, userId: demoUser.id });
    } else {
      supportBillMutation.mutate({ billId, userId: demoUser.id });
    }
  };

  const handleSupportQuestion = (questionId: number) => {
    if (userQuestionSupports.includes(questionId)) {
      removeQuestionSupportMutation.mutate({ questionId, userId: demoUser.id });
    } else {
      supportQuestionMutation.mutate({ questionId, userId: demoUser.id });
    }
  };

  // Public access - no authentication required for demo

  // Show loading state
  if (currentCycleQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container py-4">
            <h1 className="text-3xl font-bold text-slate-900">🗳️ ח"כ 121</h1>
          </div>
        </header>
        <main className="container py-8">
          <Card className="p-8 text-center">
            <p className="text-slate-600">טוען נתונים...</p>
          </Card>
        </main>
      </div>
    );
  }

  const endDate = cycle?.endDate ? toDate(cycle.endDate) || new Date() : new Date();
  const timeRemaining = cycle && endDate
    ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
              {cycle?.startDate && (
                <p className="text-xs text-slate-500">
                  {(toDate(cycle.startDate) || new Date()).toLocaleDateString('he-IL')} - {(toDate(cycle.endDate) || new Date()).toLocaleDateString('he-IL')}
                </p>
              )}
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
            <div className="mb-8">
              <Button
                onClick={() => setLocation("/delegate-selection?channel=mk121")}
                className="w-full min-h-16 bg-purple-700 text-lg font-bold text-white hover:bg-purple-800"
              >
                🗳️ הכוון קולך
              </Button>
            </div>

            {/* Info Card */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">מה זה ח"כ 121?</h2>
              <p className="text-slate-700 mb-4">
                כל 3 חודשים ינסה ח"כ 121 ליצור את הקול העונתי, במידה ויצביעו מינימום של 37,500 אזרחים לכל הפחות. הצעת החוק שקיבלה את מירב הקולות תעלה להצבעה במליאה הישר לקריאה ראשונה. בנוסף, האזרחים יצביעו על השאילתא הנבחרת שתישלח למשרד מסוים או לראש הממשלה לטובת קבלת תשובה מהשר הנשאל, בצורת תשאול ישיר ומצולם.
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
            <Tabs defaultValue="bills" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-2 mb-8 mt-8">
                <TabsTrigger value="questions">❓ שאילתות ({questions.length})</TabsTrigger>
                <TabsTrigger value="bills">📋 הצעות חוק ({bills.length})</TabsTrigger>
              </TabsList>

              {/* Bills Tab */}
              <TabsContent value="bills" className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-700 text-right">
                  <strong>🗳️ דרישה מינימאלית:</strong> כל הצעת חוק צריכה לפחות 37,500 קולות כדי לעבור לדיון הרשמי (1/120 מהמצביעים)
                </div>
                {bills.length === 0 ? (
                  <Card className="p-8 text-center bg-slate-50">
                    <p className="text-slate-600">אין הצעות חוק במחזור זה עדיין</p>
                  </Card>
                ) : (
                  bills.map((bill) => {
                    const hasVoted = userBillVotes.includes(bill.id);
                    const isWinner = bill.isWinner;
                    const displayedVotes = (bill.votes || 0) + (localBillVoteIncrements[bill.id] || 0);

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
                            <div className="text-3xl font-bold text-blue-600">{displayedVotes}</div>
                            <p className="text-xs text-slate-600">קולות</p>
                            {isWinner && (
                              <Badge className="mt-2 bg-yellow-500">🏆 נבחר</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4">{bill.description}</p>

                        <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-800">רשימת מומחים משפטית</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">חקיקה</Badge>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            {legalExperts.map((expert) => (
                              <div key={expert.name} className="rounded-md border border-slate-200 bg-white p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-900">{expert.name}</p>
                                    <p className="text-xs text-slate-600">{expert.role}</p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-purple-700">{expert.endorsements}</p>
                                    <p className="text-[11px] text-slate-500">מאצילים</p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {expert.expertise.map((item) => (
                                    <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[11px]">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Support Section (Preliminary Stage) - Only show for preliminary proposals */}
                        {bill.status === 'preliminary' && (
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
                        )}

                        <Button
                          onClick={() => handleVoteBill(bill.id)}
                          disabled={voteBillMutation.isPending}
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
                    const displayedVotes = (question.votes || 0) + (localQuestionVoteIncrements[question.id] || 0);
                    const questionExperts = getQuestionExperts(question.ministryId, question.targetMinistry);

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
                                  📢 קול הציבור: {question.targetMinistry}
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
                            <div className="text-3xl font-bold text-purple-600">{displayedVotes}</div>
                            <p className="text-xs text-slate-600">קולות</p>
                            {isWinner && (
                              <Badge className="mt-2 bg-yellow-500">🏆 נבחר</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4">{question.description}</p>

                        <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-800">רשימת מומחים משרדית</span>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {question.targetMinistry || "משרד"}
                            </Badge>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            {questionExperts.map((expert) => (
                              <div key={`${question.id}-${expert.name}`} className="rounded-md border border-slate-200 bg-white p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-900">{expert.name}</p>
                                    <p className="text-xs text-slate-600">{expert.role}</p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-purple-700">{expert.endorsements}</p>
                                    <p className="text-[11px] text-slate-500">מאצילים</p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {expert.expertise.map((item) => (
                                    <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[11px]">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Support Section (Preliminary Stage) - Only show for preliminary proposals */}
                        {question.status === 'preliminary' && (
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
                              {userQuestionSupports.includes(question.id) ? "✓ תומך" : "+ תמוך בשאילתא"}
                            </Button>
                          </div>
                        )}

                        <Button
                          onClick={() => handleVoteQuestion(question.id)}
                          disabled={voteQuestionMutation.isPending}
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
                              הצבע בעד שאילתא זו
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
