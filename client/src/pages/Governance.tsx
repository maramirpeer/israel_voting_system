import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, AlertCircle, ThumbsUp, ThumbsDown, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { PendingDecisionsGrid } from "@/components/PendingDecisionsGrid";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const localDemoMinistries = [
  { id: 8, name: "משרד האוצר", description: "ניהול תקציב המדינה, מדיניות כלכלית, מיסוי והשקעות." },
  { id: 11, name: "משרד הפנים, החברה והרווחה", description: "רשויות מקומיות, פיתוח כפרי, רווחה חברתית ושירותים לאזרח." },
  { id: 6, name: "משרד הביטחון", description: "ביטחון המדינה, פיקוח על צה\"ל ומדיניות אסטרטגית." },
  { id: 9, name: "משרד המשפטים", description: "ייעוץ משפטי, מערכת המשפט, חקיקה ואכיפה." },
  { id: 4, name: "משרד החדשנות ואיכות הסביבה", description: "טכנולוגיה, אנרגיה ירוקה, מדיניות סביבתית וחדשנות." },
  { id: 7, name: "משרד החוץ וההסברה העולמית", description: "יחסים בינלאומיים, דיפלומטיה, תדמית המדינה והסברה." },
  { id: 3, name: "משרד החינוך", description: "מערכת החינוך, תוכניות לימוד ורווחת תלמידים." },
  { id: 1, name: "משרד הבריאות", description: "מערכת הבריאות, קידום בריאות ורפואה ציבורית." },
  { id: 17, name: "משרד התרבות", description: "תרבות, אמנות, ספורט וזהות תרבותית." },
];

const localDemoDecisions = [
  {
    id: 101,
    ministryId: 1,
    title: "קיצור תורים לרפואה מומחית",
    description: "הקצאת תקציב ייעודי לפתיחת מרפאות ערב וקיצור זמני המתנה בפריפריה.",
    category: "major",
    status: "voting",
    createdAt: daysAgo(2),
    publicVotingEndsAt: hoursFromNow(9),
  },
  {
    id: 102,
    ministryId: 4,
    title: "האצת התקנת אנרגיה סולארית במבני ציבור",
    description: "תוכנית רב-שנתית להתקנת מערכות סולאריות בבתי ספר, מתנ\"סים ומבני ממשלה.",
    category: "medium",
    status: "voting",
    createdAt: daysAgo(1),
    publicVotingEndsAt: hoursFromNow(18),
  },
  {
    id: 105,
    ministryId: 3,
    title: "תוכנית העשרה דיגיטלית בבתי ספר",
    description: "הרחבת לימודי מיומנויות דיגיטליות, חשיבה ביקורתית ואוריינות מידע.",
    category: "medium",
    status: "voting",
    createdAt: daysAgo(3),
    publicVotingEndsAt: hoursFromNow(28),
  },
  {
    id: 106,
    ministryId: 8,
    title: "פרסום תקציב פתוח לציבור",
    description: "הנגשת סעיפי התקציב לציבור בפורמט פשוט, פתוח ובר השוואה.",
    category: "routine",
    status: "voting",
    createdAt: daysAgo(4),
    publicVotingEndsAt: hoursFromNow(41),
  },
  {
    id: 201,
    ministryId: 11,
    title: "מוקד שירות אחוד לרשויות מקומיות",
    description: "איחוד פניות אזרחים לרשויות המקומיות במערכת אחת עם מעקב שקוף.",
    category: "medium",
    status: "approved",
    createdAt: daysAgo(8),
    publicVotingEndsAt: hoursFromNow(-24),
  },
  {
    id: 202,
    ministryId: 17,
    title: "קרן קהילתית לתרבות וספורט",
    description: "הפניית תמיכות לפי השתתפות ציבורית ומדדי נגישות.",
    category: "routine",
    status: "approved",
    createdAt: daysAgo(12),
    publicVotingEndsAt: hoursFromNow(-72),
  },
  {
    id: 301,
    ministryId: 7,
    title: "קמפיין הסברה בינלאומי חדש",
    description: "הצעת קמפיין רחב היקף שנדחתה לאחר התנגדות ציבורית.",
    category: "major",
    status: "rejected",
    createdAt: daysAgo(16),
    publicVotingEndsAt: hoursFromNow(-120),
  },
];

export default function Governance() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const [publicTimeRemaining, setPublicTimeRemaining] = useState<{ [key: number]: string }>({});
  const [userVotes, setUserVotes] = useState<{ [key: number]: "for" | "against" | null }>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [decisionView, setDecisionView] = useState<"active" | "approved" | "rejected" | "all">("active");
  const decisionsSectionRef = useRef<HTMLDivElement | null>(null);

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const decisionsQuery = trpc.governance.decisions.list.useQuery();
  const activeDecisionsQuery = trpc.governance.decisions.active.useQuery();
  // Removed: activePublicVotingQuery - using activeDecisionsQuery instead for unified data source

  // Mutations
  const createDecisionMutation = trpc.governance.decisions.create.useMutation();
  const castVoteMutation = trpc.governance.votes.cast.useMutation();
  const castPublicVoteMutation = trpc.governance.publicVotes.cast.useMutation({
    onSuccess: () => {
      activeDecisionsQuery.refetch();
    },
  });

  const ministries = ministriesQuery.data && ministriesQuery.data.length > 0 ? ministriesQuery.data : localDemoMinistries;
  const decisions = decisionsQuery.data && decisionsQuery.data.length > 0 ? decisionsQuery.data : localDemoDecisions;
  const activeDecisions = activeDecisionsQuery.data && activeDecisionsQuery.data.length > 0
    ? activeDecisionsQuery.data
    : localDemoDecisions.filter((decision) => decision.status === "voting");
  const sortedActiveDecisions = [...activeDecisions]
    .sort((a: any, b: any) => {
      const endA = a.publicVotingEndsAt ? new Date(a.publicVotingEndsAt).getTime() : 0;
      const endB = b.publicVotingEndsAt ? new Date(b.publicVotingEndsAt).getTime() : 0;
      return endA - endB;
    });
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
  const activeDecisionIds = new Set(sortedActiveDecisions.map((decision) => decision.id));
  const allDecisionsSorted = [
    ...sortedActiveDecisions,
    ...decisions.filter((decision) => !activeDecisionIds.has(decision.id)),
  ];
  const urgentActiveDecisions = sortedActiveDecisions.slice(0, 3);
  const displayedDecisions =
    decisionView === "approved"
      ? decisions.filter((decision) => decision.status === "approved")
      : decisionView === "rejected"
        ? decisions.filter((decision) => decision.status === "rejected")
        : decisionView === "all"
          ? allDecisionsSorted
          : sortedActiveDecisions;
  const decisionStatusData = [
    { name: "הצבעות פעילות", value: activeDecisions.length, color: "#2563eb" },
    { name: "מאושרות", value: decisions.filter((decision) => decision.status === "approved").length, color: "#16a34a" },
    { name: "נדחו", value: decisions.filter((decision) => decision.status === "rejected").length, color: "#dc2626" },
  ].filter((item) => item.value > 0);
  const voteBalanceData = sortedActiveDecisions.slice(0, 5).map((decision: any) => {
    const baseVotes = 400 + ((decision.id * 137) % 9600);
    const forPercentage = ((decision.id * 17) % 100);
    const forVotes = Math.floor(baseVotes * (forPercentage / 100));
    return {
      name: decision.title.length > 22 ? `${decision.title.slice(0, 22)}...` : decision.title,
      forVotes,
      againstVotes: baseVotes - forVotes,
    };
  });
  const ministryParticipationData = sortedActiveDecisions
    .map((decision: any) => {
      const demoParticipationByDecisionId: Record<number, number> = {
        101: 18400,
        102: 7200,
        105: 31200,
        106: 12800,
      };
      const baseVotes = demoParticipationByDecisionId[decision.id] || 2500 + ((decision.id * 421) % 18000);
      const ministryName = getMinistryName(decision.ministryId);
      return {
        name: ministryName.replace("משרד ", ""),
        votes: baseVotes,
      };
    })
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);
  const decisionsTitle =
    decisionView === "approved" ? "החלטות מאושרות" : decisionView === "rejected" ? "החלטות שנדחו" : decisionView === "all" ? "סה\"כ החלטות" : "הצבעות פעילות";
  const emptyDecisionsText =
    decisionView === "approved"
      ? "אין החלטות מאושרות כרגע"
      : decisionView === "rejected"
        ? "אין החלטות שנדחו כרגע"
        : decisionView === "all"
          ? "אין החלטות להצגה כרגע"
          : "אין הצבעות פעילות כרגע";

  // Calculate time remaining for public voting - update every second for real-time display
  useEffect(() => {
    const updatePublicTimeRemaining = () => {
      const newPublicTimeRemaining: { [key: number]: string } = {};
      activeDecisions.forEach((decision) => {
        if (decision.publicVotingEndsAt) {
          const now = new Date();
          // Parse the date string properly - ensure it's treated as UTC
          const endString = typeof decision.publicVotingEndsAt === 'string' 
            ? decision.publicVotingEndsAt 
            : new Date(decision.publicVotingEndsAt).toISOString();
          const end = new Date(endString);
          const diff = end.getTime() - now.getTime();
          
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

  const handleCreateDecision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const budgetStr = formData.get("budget") as string;
      await createDecisionMutation.mutateAsync({
        ministryId: parseInt(formData.get("ministryId") as string),
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as "major" | "medium" | "routine",
        budget: budgetStr ? parseInt(budgetStr) : undefined,
      });

      decisionsQuery.refetch();
      activeDecisionsQuery.refetch();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error creating decision:", error);
    }
  };

  const handleVote = async (decisionId: number, vote: "for" | "against") => {
    if (loading) return;
    if (!isAuthenticated) {
      setLocation("/?signup=1");
      return;
    }
    setUserVotes((current) => ({
      ...current,
      [decisionId]: current[decisionId] === vote ? null : vote,
    }));

    try {
      await castVoteMutation.mutateAsync({
        decisionId,
        vote,
      });

      decisionsQuery.refetch();
      activeDecisionsQuery.refetch();
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const openDecisionView = (view: "active" | "approved" | "rejected" | "all") => {
    setDecisionView(view);
    setActiveTab("decisions");
    window.setTimeout(() => {
      decisionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const requireSignupForActivity = () => {
    if (loading) return true;
    if (isAuthenticated) return false;
    setLocation("/?signup=1");
    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-yellow-100 text-yellow-800";
      case "voting":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "major":
        return "bg-red-50 border-l-4 border-red-500";
      case "medium":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "routine":
        return "bg-blue-50 border-l-4 border-blue-500";
      default:
        return "bg-gray-50";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "major":
        return "🔴 החלטה גדולה";
      case "medium":
        return "🟡 החלטה בינונית";
      case "routine":
        return "🔵 החלטה שגרתית";
      default:
        return category;
    }
  };

  // Allow unauthenticated access for demo purposes
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
  //       <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
  //         <div className="container py-4 flex items-center justify-between flex-row-reverse">
  //           <div className="flex items-center gap-3 flex-row-reverse">
  //             <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2 justify-end">
  //               חזרה לעמוד הבית
  //               <Home className="w-4 h-4" />
  //             </Button>
  //           </div>
  //           <h1 className="text-2xl font-bold text-slate-900">🏰️ מערכת ממשל משתפת</h1>
  //         </div>
  //       </header>
  //
  //       <main className="container py-8">
  //         <Card className="p-8 text-center">
  //           <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
  //           <h2 className="text-xl font-bold mb-2">נדרש התחברות</h2>
  //           <p className="text-slate-600 mb-4">אנא התחברו כדי להשתתפו בהצבעות לממשל וליצור החלטות</p>
  //         </Card>
  //       </main>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7ed_0%,#ffffff_42%,#eef6ff_100%)] text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2 justify-end">
              חזרה
              <Home className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">🏰️ מערכת ממשל משתפת</h1>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div>
              <p className="text-sm text-slate-600">ברוכים הבאים, {user?.name || "ישראל ישראלי"}</p>
              {user?.role === "minister" && <p className="text-xs text-slate-500">שר</p>}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          <Button
            onClick={() => {
              if (requireSignupForActivity()) return;
              setLocation("/delegate-selection");
            }}
            className="w-full min-h-20 bg-purple-700 text-xl font-bold text-white hover:bg-purple-800"
          >
            🗳️ הכוון קולך
          </Button>
          <Button
            onClick={() => setLocation("/governance/vote-routing")}
            variant="outline"
            className="w-full min-h-20 border-purple-300 text-xl font-bold text-purple-700 hover:bg-purple-50"
          >
            איך הקול שלי מנותב
          </Button>
        </div>

        {/* Active Voting Decisions Section - Sorted by Time Remaining */}
        {activeDecisions && activeDecisions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-right">⏱️ החלטות משרדיות בהצבעה פעילה</h2>

            <div className="grid gap-3 md:grid-cols-3">
              {urgentActiveDecisions.map((decision: any) => {
                  // Generate fictitious vote counts between 400-10000 with meaningful differences
                  const baseVotes = 400 + ((decision.id * 137) % 9600); // 400-10000
                  // Create meaningful differences: some decisions heavily for, some heavily against
                  const forPercentage = ((decision.id * 17) % 100); // 0-99%
                  const votesFor = Math.floor(baseVotes * (forPercentage / 100));
                  const votesAgainst = baseVotes - votesFor;
                  const totalVotes = votesFor + votesAgainst;
                  const percentageFor = (votesFor / totalVotes) * 100;
                  const percentageAgainst = (votesAgainst / totalVotes) * 100;


                  const remainingTime = publicTimeRemaining[decision.id] || "חישוב...";

                  return (
                    <Card key={`${decision.id}-${decision.publicVotingEndsAt}`} className="p-2.5 border-r-4 border-yellow-500 text-right">
                      <Badge className="mb-1.5 px-2 py-0 text-[11px] bg-yellow-100 text-yellow-800 border-yellow-200">🕐 {remainingTime}</Badge>
                      <h3 className="line-clamp-2 text-xs font-bold leading-5 text-slate-900">{decision.title}</h3>
                      <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-slate-600">{decision.description}</p>
                      <div className="mt-2 text-[11px] text-slate-600">
                        <span className="font-medium text-green-600">{votesFor}</span> בעד | 
                        <span className="font-medium text-red-600 mr-1">{votesAgainst}</span> נגד
                      </div>
                      <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden flex">
                        <div 
                          className="bg-green-500 h-full transition-all duration-300" 
                          style={{ width: `${percentageFor}%` }}
                          title={`בעד: ${percentageFor.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-red-500 h-full transition-all duration-300" 
                          style={{ width: `${percentageAgainst}%` }}
                          title={`נגד: ${percentageAgainst.toFixed(1)}%`}
                        ></div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="decisions" onClick={() => setDecisionView("active")}>הצבעות פעילות</TabsTrigger>

          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-right cursor-pointer transition hover:border-blue-400"
                onClick={() => {
                  openDecisionView("active");
                }}
              >
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">הצבעות פעילות</p>
                    <p className="text-3xl font-bold text-blue-900">{activeDecisions.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-right cursor-pointer transition hover:border-green-400"
                onClick={() => {
                  openDecisionView("approved");
                }}
              >
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-green-600 font-medium">החלטות מאושרות</p>
                    <p className="text-3xl font-bold text-green-900">
                      {decisions.filter((d) => d.status === "approved").length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-right cursor-pointer transition hover:border-red-400"
                onClick={() => {
                  openDecisionView("rejected");
                }}
              >
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-red-600 font-medium">החלטות שנדחו</p>
                    <p className="text-3xl font-bold text-red-900">
                      {decisions.filter((d) => d.status === "rejected").length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </Card>

              <Card
                className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-right cursor-pointer transition hover:border-purple-400"
                onClick={() => {
                  setLocation("/governance/decisions-summary");
                }}
              >
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">סה"כ החלטות</p>
                    <p className="text-3xl font-bold text-purple-900">{decisions.length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-400" />
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-white border-slate-200 text-right">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">ניתוח מהיר</h3>
                <p className="text-sm text-slate-600">הצבעות פעילות מרוכזות תמיד לפי הזמן שנותר, מהדחופה ביותר והלאה.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">סטטוס החלטות</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={decisionStatusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={46}
                          outerRadius={78}
                          paddingAngle={3}
                        >
                          {decisionStatusData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
                    {decisionStatusData.map((entry) => (
                      <span key={entry.name} className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}: {entry.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">בעד מול נגד בהצבעות הדחופות</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={voteBalanceData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="forVotes" name="בעד" fill="#16a34a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="againstVotes" name="נגד" fill="#dc2626" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-800">השתתפות לפי משרד</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ministryParticipationData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="votes" name="קולות" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>

            {/* How It Works */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-right">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🔄 איך זה עובד?</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                  <p className="text-sm font-medium text-slate-900">השר מציע הצעה</p>
                  <p className="text-xs text-slate-600">הצעות השר עולות להצבעה לפי רמת חשיבות ההחלטה, כשהאחריות להצגת ההחלטה והנימוקים נשארת מול השר עצמו</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                  <p className="text-sm font-medium text-slate-900">שינוי מהותי עולה לציבור</p>
                  <p className="text-xs text-slate-600">כל שינוי מהותי במדיניות יעלה להצבעת הציבור למשך 72 שעות, עם רוב של לפחות 40 אלף מצביעים כדי להכריע</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                  <p className="text-sm font-medium text-slate-900">נימוק ושכנוע</p>
                  <p className="text-xs text-slate-600">אם הציבור שלל את ההצעה, לשר יש 72 שעות לנמק ולשכנע לקראת הצבעה נוספת של 72 שעות</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                  <p className="text-sm font-medium text-slate-900">הצבעה אחרונה</p>
                  <p className="text-xs text-slate-600">אם הציבור שלל שוב, השר מזמן הצבעה אחרונה שבה נדרש רוב מעל 50% כדי לגנוז את ההחלטה</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => document.getElementById("process-problems")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  קרא עוד
                </Button>
              </div>
            </Card>

            <Card id="process-problems" className="p-6 bg-white border-blue-100 text-right scroll-mt-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">תהליך ובעיות שהמנגנון פותר</h3>
              <div className="grid md:grid-cols-2 gap-5 text-sm leading-7 text-slate-700">
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">איך נקבעת חשיבות ההחלטה?</h4>
                  <p>
                    רמת החשיבות נבחנת לפי היקף ההשפעה על הציבור, שינוי במדיניות קיימת, תקציב, דחיפות ומספר האזרחים שיושפעו מההחלטה. האחריות לסיווג ההצעה, להצגתה ולנימוקיה נשארת מול השר עצמו, ושינוי מדיניות מהותי לא נסגר בתוך המשרד בלבד.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">מה קורה כשהציבור מתנגד?</h4>
                  <p>
                    הצבעה ראשונה נפתחת ל-72 שעות לאחר פרסום הצעת ההחלטה. אם הציבור מסרב, השר מגיב ומנמק את עמדתו, ולאחר 72 שעות נפתחת הצבעה נוספת. אם גם בהצבעה השנייה הציבור מסרב, נפתחת הצבעה שלישית. אם בהצבעה השלישית יש סירוב ברוב מוחלט, ההחלטה תיגנז.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">איזו בעיה זה פותר?</h4>
                  <p>
                    המנגנון מצמצם החלטות חד-צדדיות, מחייב שקיפות לפני שינויי מדיניות משמעותיים, ונותן לציבור דרך ברורה להשפיע בלי לשתק את עבודת הממשלה.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">מה נשאר בידי השר?</h4>
                  <p>
                    השר עדיין מוביל מדיניות ומציע החלטות, אבל כאשר ההחלטה מהותית הוא נדרש להציג אותה לציבור, לשמוע התנגדויות, ולנמק לפני שמתקדמים.
                  </p>
                </div>
              </div>
            </Card>

          </TabsContent>

          {/* Active Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4 scroll-mt-24" ref={decisionsSectionRef}>
            <div className="flex justify-between items-center mb-4 flex-row-reverse">
              <h2 className="text-2xl font-bold">{decisionsTitle}</h2>
              <div>
                <Select value={selectedMinistry?.toString() || "all"} onValueChange={(value) => setSelectedMinistry(value === "all" ? null : parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="סנן לפי משרד" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {displayedDecisions.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{emptyDecisionsText}</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayedDecisions
                  .filter((d) => !selectedMinistry || d.ministryId === selectedMinistry)
                  .map((decision) => {
                    // Use same formula as overview tab for consistent vote numbers
                    const baseVotes = 400 + ((decision.id * 137) % 9600); // 400-10000
                    const forPercentage = ((decision.id * 17) % 100); // 0-99%
                    const userVote = userVotes[decision.id];
                    const votesFor = Math.floor(baseVotes * (forPercentage / 100)) + (userVote === "for" ? 1 : 0);
                    const votesAgainst = baseVotes - Math.floor(baseVotes * (forPercentage / 100)) + (userVote === "against" ? 1 : 0);
                    const totalVotes = votesFor + votesAgainst;
                    const percentageFor = (votesFor / totalVotes) * 100;
                    const percentageAgainst = (votesAgainst / totalVotes) * 100;
                    const isFinalDecision = decision.status === "approved" || decision.status === "rejected";
                    return (
                      <Card key={decision.id} className={`p-6 ${getCategoryColor(decision.category)}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-slate-900">{decision.title}</h3>
                              <Badge className={getStatusColor(decision.status)}>{decision.status}</Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{decision.description}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">{getMinistryName(decision.ministryId)}</Badge>
                              <Badge variant="outline">{getCategoryLabel(decision.category)}</Badge>
                            </div>
                          </div>
                          {(decisionView === "active" || (decisionView === "all" && decision.status === "voting")) && (
                            <div className="text-right">
                              <p className="text-xs text-slate-500 font-medium">זמן נותר:</p>
                              <p className="text-sm font-bold text-slate-900">{publicTimeRemaining[decision.id] || "חישוב..."}</p>
                            </div>
                          )}
                        </div>

                        {/* Voting Stats */}
                        <div className="bg-white p-4 rounded-lg my-4 space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-600">בעד: {votesFor} קולות</span>
                              <span className="text-sm font-medium text-slate-600">{percentageFor.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentageFor} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-600">נגד: {votesAgainst} קולות</span>
                              <span className="text-sm font-medium text-slate-600">{percentageAgainst.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentageAgainst} className="h-2" />
                          </div>
                        </div>

                        {userVote && (
                          <div className={`rounded-md border p-3 text-sm font-bold ${
                            userVote === "for"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}>
                            ההצבעה שלך: {userVote === "for" ? "בעד" : "נגד"}
                          </div>
                        )}

                        {isFinalDecision ? (
                          <div className="mt-4">
                            <Button
                              className={`w-full text-white cursor-default ${
                                decision.status === "approved"
                                  ? "bg-green-600 hover:bg-green-600"
                                  : "bg-red-600 hover:bg-red-600"
                              }`}
                            >
                              תוצאה: {decision.status === "approved" ? "בעד" : "נגד"}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-3 mt-4 flex-row-reverse">
                            <Button 
                              onClick={() => handleVote(decision.id, 'for')}
                              className={`flex-1 text-white ${
                                userVote === "for" ? "bg-green-800 hover:bg-green-800" : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {userVote === "for" ? "✓ בעד נבחר" : "✓ בעד"}
                            </Button>
                            <Button 
                              onClick={() => handleVote(decision.id, 'against')}
                              className={`flex-1 text-white ${
                                userVote === "against" ? "bg-red-800 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"
                              }`}
                            >
                              {userVote === "against" ? "✗ נגד נבחר" : "✗ נגד"}
                            </Button>
                          </div>
                        )}
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
