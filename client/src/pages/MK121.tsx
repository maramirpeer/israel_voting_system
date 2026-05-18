import { useAuth } from "@/_core/hooks/useAuth";
import { toDate } from "@/lib/dateUtils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ThumbsDown, ThumbsUp, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProposalSubmissionForms } from "@/components/ProposalSubmissionForms";

type MK121Assignment = { type: "direct" | "expert" | "citizen"; name?: string };
const MK121_ASSIGNMENT_KEY = "mk121-vote-assignment";
const MK121_BILL_DIRECT_OVERRIDES_KEY = "mk121-bill-direct-overrides";
type MK121QuestionAssignment = { ministryId: number; ministryName?: string; delegateId: number; delegateName?: string };
const MK121_QUESTION_ASSIGNMENTS_KEY = "mk121-question-assignments";

const demoCycle = {
  id: 1,
  seasonName: "אביב 2026",
  startDate: new Date("2026-04-01").toISOString(),
  endDate: new Date("2026-06-30").toISOString(),
};

const demoBills = [
  {
    id: 201,
    title: "הגבלת כהונת ראש ממשלה ל-8 שנים",
    description: "הצעת חוק לקביעת מגבלת כהונה מצטברת של עד 8 שנים לראש ממשלה, כדי לחזק רענון שלטוני, אחריות ציבורית ותחרות פוליטית.",
    category: "ממשל",
    status: "voting",
    votes: 21980,
    supporters: 100,
    isWinner: true,
  },
  {
    id: 202,
    title: "חובת הצבעה של כל חברי הכנסת בהצבעות מליאה",
    description: "סוף עידן החוקים שעוברים ללא נוכחות מלאה. ניתן יהיה להצביע באופן דיגיטלי מאובטח, כולל אימות כפול למניעת זיופים.",
    category: "כנסת",
    status: "voting",
    votes: 17640,
    supporters: 100,
    isWinner: false,
  },
  {
    id: 203,
    title: "שקיפות מלאה בדיוני ועדות הכנסת",
    description: "חיוב פרסום סיכומים, חומרי רקע והצבעות ועדה בפורמט פתוח ונגיש לציבור.",
    category: "שקיפות",
    status: "voting",
    votes: 14320,
    supporters: 100,
    isWinner: false,
  },
  {
    id: 204,
    title: "זירת מידע ממוקדת: שאלה שנתית בין חברי הכנסת",
    description: "הצעת חוק שתאפשר לכל חבר כנסת לשאול פעם בשנה חבר כנסת אחר שאלה אחת. הח\"כ הנשאל יצלם את עצמו בתשובה; אם התשובה תיערך, גם העריכה וגם התשובה המוקלטת יפורסמו בשקיפות מלאה לציבור.",
    category: "פיקוח פרלמנטרי",
    status: "voting",
    votes: 9870,
    supporters: 100,
    isWinner: false,
  },
];

const demoQuestions = [
  {
    id: 301,
    title: "כיצד הממשלה נערכת להורדת יוקר המחיה במוצרי יסוד?",
    description: "שאילתא למשרד הכלכלה לגבי צעדים מדידים להפחתת מחירי המזון, מוצרי יסוד ושירותים בסיסיים למשקי בית.",
    targetMinistry: "משרד הכלכלה והתעשייה",
    ministryId: 2,
    urgency: "high",
    status: "voting",
    votes: 28440,
    supporters: 100,
    isWinner: true,
  },
  {
    id: 302,
    title: "מהו לוח הזמנים לצמצום זמני המתנה במערכת הבריאות?",
    description: "שאילתא למשרד הבריאות לגבי יעדים מדידים לקיצור זמני המתנה לרופאים מומחים, בדיקות וניתוחים בפריפריה ובמרכז.",
    targetMinistry: "משרד הבריאות",
    ministryId: 1,
    urgency: "high",
    status: "voting",
    votes: 24680,
    supporters: 100,
    isWinner: false,
  },
  {
    id: 303,
    title: "איזה מענה קבוע מקבלים מילואימניקים ומשפחותיהם?",
    description: "שאילתא למשרד הביטחון ולמשרד האוצר לגבי תמיכה כלכלית, תעסוקתית, משפחתית ונפשית במילואימניקים ובבני משפחותיהם.",
    targetMinistry: "משרד הביטחון",
    ministryId: 6,
    urgency: "high",
    status: "voting",
    votes: 22190,
    supporters: 100,
    isWinner: false,
  },
  {
    id: 304,
    title: "כיצד תוגבר השקיפות התקציבית לציבור?",
    description: "שאילתא למשרד האוצר לגבי פרסום ברור, נגיש ומתעדכן של תקציבים, העברות, חריגות וביצוע בפועל של כספי ציבור.",
    targetMinistry: "משרד האוצר",
    ministryId: 7,
    urgency: "medium",
    status: "voting",
    votes: 19870,
    supporters: 100,
    isWinner: false,
  },
  {
    id: 305,
    title: "מתי יוקם ערוץ אזרחי קבוע מול הכנסת?",
    description: "שאילתא ליו״ר הכנסת ולוועדת הכנסת לגבי הקמת ערוץ קבוע שבו הציבור יוכל לבחור שאלות, הצעות חוק ונושאי פיקוח פרלמנטרי.",
    targetMinistry: "הכנסת",
    ministryId: null,
    urgency: "medium",
    status: "voting",
    votes: 17630,
    supporters: 100,
    isWinner: false,
  },
];


export default function MK121() {
  const { user, isAuthenticated } = useAuth();
  const demoUser = user || { id: 1, name: "ישראל ישראלי", email: "demo@example.local" };
  const [, setLocation] = useLocation();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [localBillVotes, setLocalBillVotes] = useState<number[]>([]);
  const [localBillAgainstVotes, setLocalBillAgainstVotes] = useState<number[]>([]);
  const [localQuestionVotes, setLocalQuestionVotes] = useState<number[]>([]);
  const [localBillVoteIncrements, setLocalBillVoteIncrements] = useState<Record<number, number>>({});
  const [localQuestionVoteIncrements, setLocalQuestionVoteIncrements] = useState<Record<number, number>>({});
  const [mk121Assignment, setMk121Assignment] = useState<MK121Assignment>(() => {
    if (typeof window === "undefined") return { type: "direct" };
    const saved = window.localStorage.getItem(MK121_ASSIGNMENT_KEY);
    return saved ? JSON.parse(saved) : { type: "direct" };
  });
  const [billDirectOverrides, setBillDirectOverrides] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem(MK121_BILL_DIRECT_OVERRIDES_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [mk121QuestionAssignments, setMK121QuestionAssignments] = useState<Record<number, MK121QuestionAssignment>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem(MK121_QUESTION_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  // Queries with auto-refresh polling (every 30 seconds for live updates)
  const currentCycleQuery = trpc.mk121.getCurrentCycle.useQuery(undefined, {
    retry: false,
  });
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

  const useDemoData = !currentCycleQuery.data || Boolean(currentCycleQuery.error);
  const cycle = currentCycleQuery.data || demoCycle;
  const bills = useDemoData ? demoBills : billsQuery.data || [];
  const questions = [...(useDemoData ? demoQuestions : questionsQuery.data || [])].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0)
  );

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
  const assignmentLabel =
    mk121Assignment.type === "direct"
      ? "בחירה ישירה"
      : mk121Assignment.type === "expert"
        ? `מואצל למומחה: ${mk121Assignment.name}`
        : `מואצל לאזרח: ${mk121Assignment.name}`;
  const assignmentBadgeClass =
    mk121Assignment.type === "direct"
      ? "bg-green-100 text-green-700 hover:bg-green-100"
      : "bg-purple-100 text-purple-700 hover:bg-purple-100";
  const getBillAssignmentLabel = (billId: number) =>
    billDirectOverrides[billId] ? "בחירה ישירה להצעה זו" : mk121Assignment.type === "direct" ? "בחירה ישירה" : assignmentLabel;
  const getBillAssignmentBadgeClass = (billId: number) =>
    billDirectOverrides[billId] || mk121Assignment.type === "direct"
      ? "border-green-200 bg-green-50 text-green-700"
      : assignmentBadgeClass;
  const isBillDirect = (billId: number) => mk121Assignment.type === "direct" || Boolean(billDirectOverrides[billId]);
  const getQuestionAssignmentLabel = (ministryId: number | null | undefined) => {
    if (!ministryId) return "בחירה ישירה";
    const assignment = mk121QuestionAssignments[ministryId];
    return assignment?.delegateName ? `מואצל למומחה משרד: ${assignment.delegateName}` : "בחירה ישירה";
  };
  const getQuestionAssignmentBadgeClass = (ministryId: number | null | undefined) =>
    ministryId && mk121QuestionAssignments[ministryId]
      ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
      : "bg-green-100 text-green-700 hover:bg-green-100";
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

  function getQuestionExperts(ministryId: number | null | undefined, ministryName: string | null | undefined) {
    const cleanMinistryName = (ministryName || "המשרד הרלוונטי").replace("משרד ", "");
    const base = ministryId || 1;
    return [0, 1, 2].map((index) => ({
      name: demoExpertNames[(base + index) % demoExpertNames.length],
      role: `מומחה/ית ${cleanMinistryName}`,
      expertise: [`מדיניות ${cleanMinistryName}`, "ניתוח החלטות", "שיתוף ציבור"],
      endorsements: 620 + ((base + index) * 137) % 1400,
    }));
  }

  const setBillDirect = (billId: number) => {
    const next = { ...billDirectOverrides, [billId]: true };
    setBillDirectOverrides(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MK121_BILL_DIRECT_OVERRIDES_KEY, JSON.stringify(next));
    }
    toast.success("ההצעה הזו הוחזרה לבחירה ישירה");
  };

  const restoreBillDelegation = (billId: number) => {
    const next = { ...billDirectOverrides };
    delete next[billId];
    setBillDirectOverrides(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MK121_BILL_DIRECT_OVERRIDES_KEY, JSON.stringify(next));
    }
    toast.success("ההצעה הזו חזרה להאצלה למומחה");
  };

  const setQuestionDirect = (ministryId: number | null | undefined) => {
    if (!ministryId) return;
    setMK121QuestionAssignments((current) => {
      const next = { ...current };
      delete next[ministryId];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(MK121_QUESTION_ASSIGNMENTS_KEY, JSON.stringify(next));
      }
      return next;
    });
    toast.success("השאילתות במשרד הזה הוחזרו לבחירה ישירה");
  };

  useEffect(() => {
    const loadAssignment = () => {
      const saved = window.localStorage.getItem(MK121_ASSIGNMENT_KEY);
      setMk121Assignment(saved ? JSON.parse(saved) : { type: "direct" });
      const savedBillOverrides = window.localStorage.getItem(MK121_BILL_DIRECT_OVERRIDES_KEY);
      setBillDirectOverrides(savedBillOverrides ? JSON.parse(savedBillOverrides) : {});
      const savedQuestionAssignments = window.localStorage.getItem(MK121_QUESTION_ASSIGNMENTS_KEY);
      setMK121QuestionAssignments(savedQuestionAssignments ? JSON.parse(savedQuestionAssignments) : {});
    };

    loadAssignment();
    window.addEventListener("storage", loadAssignment);
    window.addEventListener("focus", loadAssignment);
    return () => {
      window.removeEventListener("storage", loadAssignment);
      window.removeEventListener("focus", loadAssignment);
    };
  }, []);

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
    setLocalBillAgainstVotes((current) => current.filter((id) => id !== billId));
    setLocalBillVotes((current) => [...current, billId]);
    setLocalBillVoteIncrements((current) => ({
      ...current,
      [billId]: (current[billId] || 0) + 1,
    }));
    if (!useDemoData) {
      voteBillMutation.mutate({ billId, userId: demoUser.id });
    } else {
      toast.success("הקול שלך נרשם!");
    }
  };

  const handleVoteBillAgainst = (billId: number) => {
    if (localBillAgainstVotes.includes(billId)) {
      setLocalBillAgainstVotes((current) => current.filter((id) => id !== billId));
      toast.success("הצבעת הנגד בוטלה");
      return;
    }
    setLocalBillVotes((current) => current.filter((id) => id !== billId));
    setLocalBillVoteIncrements((current) => ({
      ...current,
      [billId]: Math.min((current[billId] || 0) - 1, 0),
    }));
    setLocalBillAgainstVotes((current) => [...current, billId]);
    toast.success("הצבעת נגד נרשמה");
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
    if (!useDemoData) {
      voteQuestionMutation.mutate({ questionId, userId: demoUser.id });
    } else {
      toast.success("הקול שלך נרשם!");
    }
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
  if (false && currentCycleQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7ed_0%,#ffffff_42%,#eef6ef_100%)] text-right" dir="rtl">
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7ed_0%,#ffffff_42%,#eef6ef_100%)] text-right" dir="rtl">
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
            <div className="mb-8 grid gap-3 md:grid-cols-2">
              <Button
                onClick={() => setLocation("/delegate-selection?channel=mk121")}
                className="w-full min-h-16 bg-purple-700 text-lg font-bold text-white hover:bg-purple-800"
              >
                🗳️ הכוון קולך
              </Button>
              <Button
                onClick={() => setLocation("/mk121/vote-routing")}
                variant="outline"
                className="w-full min-h-16 border-purple-300 text-lg font-bold text-purple-700 hover:bg-purple-50"
              >
                איך הקול שלי מנותב
              </Button>
            </div>

            {/* Info Card */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-right">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">מה זה ח"כ 121?</h2>
              <p className="text-slate-700 mb-4">
                כל 3 חודשים ינסה ח"כ 121 ליצור את הקול העונתי, במידה ויצביעו מינימום של 37,500 אזרחים לכל הפחות{" "}
                <Button variant="link" onClick={() => setLocation("/mk121/threshold")} className="h-auto p-0 text-blue-700">(קרא עוד)</Button>.
                הצעת החוק שקיבלה את מירב הקולות תעלה להצבעה במליאה הישר לקריאה ראשונה. ערוץ זה מיועד להצעות חוק אזרחיות בלבד; שאילתות ציבוריות מנוהלות במסגרת ממשלה משתפת.
              </p>
              <div className="mb-4 rounded-lg border border-blue-200 bg-white p-4">
                <h3 className="mb-3 text-lg font-bold text-slate-900">איך הקול מנותב?</h3>
                <div className="grid gap-3">
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-base font-extrabold text-blue-800">הצעות חוק</p>
                    <p className="text-sm leading-6 text-slate-700">
                      אפשר להצביע ישירות או להאציל למומחה משפטי.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-right">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">דף מקדים - שלב צבירת תמיכה</h2>
              <p className="text-slate-700 mb-6 leading-7">
                כל הצעת חוק חדשה בח"כ 121 מתחילה כ<span className="font-bold">"דף מקדים"</span>.
                זהו השלב הראשוני שבו אזרחים מביעים תמיכה לפני שההצעה עוברת להצבעה הרשמית של המחזור.
              </p>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-lg border-2 border-purple-200 bg-white p-5">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100</div>
                  <h3 className="text-lg font-bold text-purple-900 mb-2">תומכים מינימום</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    כדי שהצעה תעבור לשלב ההצבעה הרשמי, היא צריכה לקבל תמיכה של לפחות 100 אזרחים.
                  </p>
                </div>
                <div className="rounded-lg border-2 border-blue-200 bg-white p-5">
                  <div className="text-3xl font-bold text-blue-600 mb-2">37,500</div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">קולות מינימום</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    בשלב ההצבעה, הצעה זוכה צריכה לפחות 1/120 מהמצביעים כדי להתקדם.
                  </p>
                </div>
                <div className="rounded-lg border-2 border-cyan-200 bg-white p-5">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">4 שנים</div>
                  <h3 className="text-lg font-bold text-cyan-900 mb-2">תוקף הצעה</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    אם הצעה לא עברה את הרף בתוך 4 שנים, היא תיגנז.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border-r-4 border-purple-600 bg-white p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-4">איך זה עובד?</h3>
                <ol className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">1.</span> אזרח מציע הצעה חדשה</span>
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">1</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">2.</span> ההצעה נוצרת כ"דף מקדים" בשלב צבירת התמיכה</span>
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">2</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">3.</span> אזרחים אחרים תומכים בהצעה</span>
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">3</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">4.</span> כשמגיעים ל-100 תומכים, ההצעה עולה לסדר היום הרשמי</span>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 font-bold">4</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">5.</span> בשלב ההצבעה, אזרחים מצביעים על הצעת החוק</span>
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">5</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">6.</span> אם ההצעה המנצחת עברה את הרף, היא מקודמת בכנסת</span>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 font-bold">6</div>
                  </li>
                  <li className="flex items-start gap-3 justify-end">
                    <span><span className="font-bold">7.</span> אם לא עברה את הרף, היא עוברת למחזור הבא</span>
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 text-yellow-600 font-bold">7</div>
                  </li>
                </ol>
              </div>
            </Card>

            {/* Voting Tabs */}
            <Tabs defaultValue="bills" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-1 mb-8 mt-8">
                <TabsTrigger value="bills">📋 הצעות חוק ({bills.length})</TabsTrigger>
              </TabsList>

              {/* Bills Tab */}
              <TabsContent value="bills" className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-700 text-right">
                  <strong>🗳️ דרישה מינימאלית:</strong> כל הצעת חוק צריכה לפחות 37,500 קולות{" "}
                  <Button variant="link" onClick={() => setLocation("/mk121/threshold")} className="h-auto p-0 text-blue-700">(קרא עוד)</Button>{" "}
                  כדי לעבור לדיון הרשמי (1/120 מהמצביעים)
                </div>
                {bills.length === 0 ? (
                  <Card className="p-8 text-center bg-slate-50">
                    <p className="text-slate-600">אין הצעות חוק במחזור זה עדיין</p>
                  </Card>
                ) : (
                  bills.map((bill) => {
                    const hasVoted = userBillVotes.includes(bill.id);
                    const hasVotedAgainst = localBillAgainstVotes.includes(bill.id);
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

                        <div className="mb-4 flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">סטטוס ההצבעה שלך:</span>{" "}
                            <span className={isBillDirect(bill.id) ? "text-green-700" : "text-purple-700"}>
                              {getBillAssignmentLabel(bill.id)}
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {mk121Assignment.type !== "direct" && !billDirectOverrides[bill.id] && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setBillDirect(bill.id)}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                בחירה ישירה להצעה זו
                              </Button>
                            )}
                            {mk121Assignment.type !== "direct" && billDirectOverrides[bill.id] && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => restoreBillDelegation(bill.id)}
                                className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              >
                                האצל הצעה זו למומחה
                              </Button>
                            )}
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

                        {isBillDirect(bill.id) && (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                                  ✓ הצבעת בעד
                                  <CheckCircle className="w-4 h-4 ml-2" />
                                </>
                              ) : (
                                <>
                                  הצבע בעד
                                  <ThumbsUp className="w-4 h-4 ml-2" />
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleVoteBillAgainst(bill.id)}
                              variant={hasVotedAgainst ? "default" : "outline"}
                              className={`w-full flex justify-center ${
                                hasVotedAgainst
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "border-red-300 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {hasVotedAgainst ? "✓ הצבעת נגד" : "הצבע נגד"}
                              <ThumbsDown className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        )}
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
