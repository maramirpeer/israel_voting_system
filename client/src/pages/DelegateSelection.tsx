import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Users, Target, Search } from "lucide-react";
import { toast } from "sonner";

type MK121Assignment = { type: "direct" | "expert" | "citizen"; name?: string };
const MK121_ASSIGNMENT_KEY = "mk121-vote-assignment";
type MK121QuestionAssignment = { ministryId: number; ministryName?: string; delegateId: number; delegateName?: string };
const MK121_QUESTION_ASSIGNMENTS_KEY = "mk121-question-assignments";

const demoMinistries = [
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

const demoDelegateNames = ["יעל בן דוד", "דניאל מזרחי", "הילה שפירא", "רועי אלון", "נעמה כץ", "אורי גבאי"];
const getDemoMinistryDelegates = (ministryId: number, ministryName?: string) => {
  const cleanName = (ministryName || "המשרד").replace("משרד ", "");
  return [0, 1, 2].map((index) => ({
    id: ministryId * 100 + index,
    name: demoDelegateNames[(ministryId + index) % demoDelegateNames.length],
    bio: `מומחה/ית ${cleanName} עם ניסיון בניתוח מדיניות, עבודת מטה ושיתוף ציבור.`,
    endorsements: 740 + ((ministryId + index) * 173) % 1200,
    expertise: [`מדיניות ${cleanName}`, "ניתוח החלטות", "שיתוף ציבור"],
    values: ["שקיפות", "אחריות ציבורית"],
  }));
};

export default function DelegateSelection() {
  const { user, isAuthenticated } = useAuth();
  const demoUser = user || { id: 1, name: "ישראל ישראלי", email: "demo@example.local" };
  const [, setLocation] = useLocation();
  const [, routeParams] = useRoute<{ ministryId: string }>("/delegate-selection/:ministryId");
  const isMK121Mode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("channel") === "mk121";
  const routeMinistryId = routeParams?.ministryId ? Number(routeParams.ministryId) : null;
  const isMinistryPage = Boolean(routeMinistryId);
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);
  const [selectedDelegateId, setSelectedDelegateId] = useState<number | null>(null);
  const [votingMethod, setVotingMethod] = useState<"direct" | "delegate" | "citizen">("direct");
  const [mk121VotingMethod, setMK121VotingMethod] = useState<"direct" | "delegate">("direct");
  const [citizenSearchId, setCitizenSearchId] = useState<string>("");
  const [selectedCitizen, setSelectedCitizen] = useState<{ id: number; name: string; email: string } | null>(null);
  const [localAssignments, setLocalAssignments] = useState<Record<number, any>>({});
  const [mk121Assignment, setMk121Assignment] = useState<MK121Assignment>(() => {
    if (typeof window === "undefined") return { type: "direct" };
    const saved = window.localStorage.getItem(MK121_ASSIGNMENT_KEY);
    return saved ? JSON.parse(saved) : { type: "direct" };
  });
  const [mk121QuestionAssignments, setMK121QuestionAssignments] = useState<Record<number, MK121QuestionAssignment>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem(MK121_QUESTION_ASSIGNMENTS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const ministryId = selectedMinistryId && Number.isFinite(selectedMinistryId) ? selectedMinistryId : 1;
  const delegatesQuery = trpc.delegates.listByMinistry.useQuery(
    { ministryId },
    { enabled: true }
  );
  const assignmentsQuery = trpc.delegates.getCitizenAssignments.useQuery(
    { userId: demoUser.id },
    { enabled: true }
  );

  // Mutations
  const assignDelegateMutation = trpc.delegates.assign.useMutation({
    onSuccess: () => {
      toast.success("נציג השתנה בהצלחה!");
      assignmentsQuery.refetch();
      setSelectedCitizen(null);
      setCitizenSearchId("");
    },
    onError: () => {
      toast.error("שגיאה בשינוי הנציג");
    },
  });

  const ministries = ministriesQuery.data && ministriesQuery.data.length > 0 ? ministriesQuery.data : demoMinistries;
  const selectedMinistryForDelegates = ministries.find((m) => m.id === ministryId);
  const delegates = delegatesQuery.data && delegatesQuery.data.length > 0
    ? delegatesQuery.data
    : getDemoMinistryDelegates(ministryId, selectedMinistryForDelegates?.name);
  const assignments = assignmentsQuery.data || [];

  const getAssignmentForMinistry = (ministryId: number) =>
    localAssignments[ministryId] || assignments.find((a) => a.ministryId === ministryId) || null;

  const getAssignmentLabel = (assignment: any) => {
    if (!assignment) return "בחירה ישירה";
    if (assignment.votingMethod === "direct") return "בחירה ישירה";
    if (assignment.delegateName) return `מואצל למומחה: ${assignment.delegateName}`;
    if (assignment.citizenName) return `מואצל לאזרח: ${assignment.citizenName}`;
    return "מואצל";
  };

  const demoCitizenNames = ["תמר אברהמי", "יונתן כהן", "מאיה לוי", "איתן ביטון", "שירה מזרחי", "נועם פרידמן"];
  const legalExperts = [
    {
      id: 9001,
      name: "עו\"ד תמר לוי",
      bio: "מומחית בניסוח חקיקה, משפט ציבורי ופיקוח פרלמנטרי.",
      endorsements: 1280,
      expertise: ["ניסוח חקיקה", "משפט ציבורי", "כנסת"],
    },
    {
      id: 9002,
      name: "פרופ' אמיר כהן",
      bio: "חוקר משפט חוקתי וסמכויות הכנסת, עם התמחות באיזונים שלטוניים.",
      endorsements: 970,
      expertise: ["משפט חוקתי", "סמכויות הכנסת", "זכויות ציבור"],
    },
    {
      id: 9003,
      name: "ד\"ר מיכל ברק",
      bio: "מומחית מדיניות ציבורית ויישום חוקים במערכות ממשל.",
      endorsements: 845,
      expertise: ["מדיניות ציבורית", "יישום חוק", "רגולציה"],
    },
  ];

  // Initialize first ministry on load
  useEffect(() => {
    if (isMK121Mode) {
      if (!selectedMinistryId && ministries.length > 0) {
        setSelectedMinistryId(ministries[0].id);
      }
      return;
    }
    if (routeMinistryId && Number.isFinite(routeMinistryId)) {
      setSelectedMinistryId(routeMinistryId);
      setVotingMethod("delegate");
      return;
    }
    if (!selectedMinistryId && ministries.length > 0) {
      setSelectedMinistryId(ministries[0].id);
    }
  }, [ministries, routeMinistryId, selectedMinistryId, isMK121Mode]);

  const currentAssignment = selectedMinistryId
    ? getAssignmentForMinistry(selectedMinistryId)
    : null;
  const selectedMinistry = ministries.find((m) => m.id === selectedMinistryId);
  const voteRoutingSummary = ministries.map((ministry) => {
    const assignment = getAssignmentForMinistry(ministry.id);
    const isDelegated = assignment?.votingMethod === "delegate";
    const routedTo = assignment?.delegateName || assignment?.citizenName || "הצבעה אישית";
    return {
      ministry,
      assignment,
      isDelegated,
      routedTo,
      label: getAssignmentLabel(assignment),
    };
  });
  const directVotesCount = voteRoutingSummary.filter((item) => !item.isDelegated).length;
  const delegatedVotesCount = voteRoutingSummary.filter((item) => item.isDelegated).length;

  const updateMK121Assignment = (assignment: MK121Assignment) => {
    setMk121Assignment(assignment);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MK121_ASSIGNMENT_KEY, JSON.stringify(assignment));
    }
    toast.success("סטטוס הקול עודכן");
  };

  const resetMK121AllDelegations = () => {
    const directAssignment: MK121Assignment = { type: "direct" };
    setMk121Assignment(directAssignment);
    setMK121QuestionAssignments({});
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MK121_ASSIGNMENT_KEY, JSON.stringify(directAssignment));
      window.localStorage.removeItem(MK121_QUESTION_ASSIGNMENTS_KEY);
    }
    toast.success("כל ההאצלות בח\"כ 121 אופסו לבחירה ישירה");
  };

  const updateMK121QuestionAssignment = (delegateId: number) => {
    if (!selectedMinistryId) return;
    const delegate = delegates.find((item) => item.id === delegateId);
    const assignment: MK121QuestionAssignment = {
      ministryId: selectedMinistryId,
      ministryName: selectedMinistry?.name,
      delegateId,
      delegateName: delegate?.name,
    };
    const next = {
      ...mk121QuestionAssignments,
      [selectedMinistryId]: assignment,
    };
    setMK121QuestionAssignments(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MK121_QUESTION_ASSIGNMENTS_KEY, JSON.stringify(next));
    }
    toast.success("מומחה השאילתות עודכן");
  };

  const handleAssignDelegate = (delegateId: number) => {
    if (!demoUser.id || !selectedMinistryId) return;
    const delegate = delegates.find((item) => item.id === delegateId);

    setLocalAssignments((current) => ({
      ...current,
      [selectedMinistryId]: {
        userId: demoUser.id,
        ministryId: selectedMinistryId,
        delegateId,
        delegateUserId: null,
        votingMethod: "delegate",
        delegateName: delegate?.name,
      },
    }));

    assignDelegateMutation.mutate({
      userId: demoUser.id,
      ministryId: selectedMinistryId,
      delegateId,
      delegateUserId: null,
    });
  };

  const handleVoteDirect = () => {
    if (!demoUser.id || !selectedMinistryId) return;
    setLocalAssignments((current) => ({
      ...current,
      [selectedMinistryId]: {
        userId: demoUser.id,
        ministryId: selectedMinistryId,
        delegateId: null,
        delegateUserId: null,
        votingMethod: "direct",
      },
    }));

    assignDelegateMutation.mutate({
      userId: demoUser.id,
      ministryId: selectedMinistryId,
      delegateId: null,
      delegateUserId: null,
    });
  };

  const handleSearchCitizen = async () => {
    const citizenId = parseInt(citizenSearchId) || Math.floor(100000000 + Math.random() * 899999999);
    if (!demoUser.id) return;
    const name = demoCitizenNames[citizenId % demoCitizenNames.length];
    const citizen = {
      id: citizenId,
      name,
      email: `citizen-${citizenId}@example.local`,
    };
    setSelectedCitizen(citizen);
    toast.success(`נמצא אזרח: ${name}`);
  };

  const handleRandomCitizen = () => {
    const randomId = Math.floor(100000000 + Math.random() * 899999999);
    const name = demoCitizenNames[randomId % demoCitizenNames.length];
    setCitizenSearchId(String(randomId));
    setSelectedCitizen({
      id: randomId,
      name,
      email: `citizen-${randomId}@example.local`,
    });
    toast.success(`נבחר אזרח: ${name}`);
  };

  const handleAssignCitizen = () => {
    if (!demoUser.id || !selectedMinistryId || !selectedCitizen) return;

    setLocalAssignments((current) => ({
      ...current,
      [selectedMinistryId]: {
        userId: demoUser.id,
        ministryId: selectedMinistryId,
        delegateId: null,
        delegateUserId: selectedCitizen.id,
        votingMethod: "delegate",
        citizenName: selectedCitizen.name,
      },
    }));

    assignDelegateMutation.mutate({
      userId: demoUser.id,
      ministryId: selectedMinistryId,
      delegateId: null,
      delegateUserId: selectedCitizen.id,
    });
  };

  if (isMK121Mode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container py-4 flex items-center justify-between flex-row-reverse">
            <Button variant="ghost" onClick={() => setLocation("/mk121")} className="flex items-center gap-2 justify-end">
              חזרה לח"כ 121
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">🗳️ הכוון קולך - ח"כ 121</h1>
            <p className="text-sm text-slate-600">{demoUser.name}</p>
          </div>
        </header>

        <main className="container py-8">
          <Card className="p-6 mb-6 bg-white border-slate-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">מצב הקול בח"כ 121</h2>
                <p className="text-sm text-slate-600">
                  בחירה ישירה מאפסת את כל ההאצלות. מומחה משפטי משפיע רק על הצעות חוק, והאצלה לפי משרד משפיעה רק על שאילתות.
                </p>
              </div>
              <Badge className={mk121Assignment.type === "direct" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-purple-100 text-purple-700 hover:bg-purple-100"}>
                {mk121Assignment.type === "direct" ? "בחירה ישירה בכל ח״כ 121" : `הצעות חוק: מואצל אל ${mk121Assignment.name}`}
              </Badge>
            </div>
          </Card>

          <Tabs value={mk121VotingMethod} onValueChange={(v) => setMK121VotingMethod(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="direct">בחירה ישירה</TabsTrigger>
              <TabsTrigger value="delegate">מומחה משפטי</TabsTrigger>
            </TabsList>

            <TabsContent value="direct">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-start gap-4">
                  <Target className="w-8 h-8 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">בחירה ישירה</h3>
                <p className="text-slate-700 mb-4">
                  הקול שלך נשאר אצלך גם בהצעות חוק וגם בשאילתות. לחיצה כאן מאפסת את כל ההאצלות הקיימות ומחזירה את ח"כ 121 לבחירה ישירה.
                </p>
                    <Button onClick={resetMK121AllDelegations} className="bg-green-600 hover:bg-green-700">
                      אשר בחירה ישירה ואפס את כל ההאצלות
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="delegate" className="space-y-4">
              {legalExperts.map((expert) => (
                <Card key={expert.id} className={`p-4 border-2 ${mk121Assignment.name === expert.name ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{expert.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{expert.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {expert.expertise.map((item) => (
                          <Badge key={item} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-purple-700">{expert.endorsements}</p>
                      <p className="text-xs text-slate-600">מאצילים</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => updateMK121Assignment({ type: "expert", name: expert.name })}
                    className="w-full mt-4"
                    variant={mk121Assignment.name === expert.name ? "default" : "outline"}
                  >
                    {mk121Assignment.name === expert.name ? "✓ מומחה משפטי נבחר להצעות חוק" : "האצל הצעות חוק למומחה משפטי"}
                  </Button>
                </Card>
              ))}
            </TabsContent>

          </Tabs>

          <Card className="mt-8 p-6 bg-white border-purple-200">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">האצלת קול לשאילתות</h2>
                <p className="text-sm text-slate-600">
                  האזור הזה שייך לשאילתות בלבד: הקול מנותב לפי המשרד שאליו השאילתא מופנית ומתבסס על רשימת המומחים המשרדית הקיימת.
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                {selectedMinistry ? selectedMinistry.name : "בחר משרד"}
              </Badge>
            </div>

            <div className="space-y-3 rounded-lg bg-slate-100 p-2">
              {ministries.map((ministry) => {
                const assignment = mk121QuestionAssignments[ministry.id];
                const isActive = selectedMinistryId === ministry.id;
                return (
                  <div
                    key={ministry.id}
                    className={`rounded-md border transition ${
                      isActive ? "border-purple-500 bg-white shadow-sm" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMinistryId(isActive ? null : ministry.id)}
                      className={`min-h-16 w-full px-3 py-2 text-right transition ${
                        isActive ? "bg-purple-50" : "hover:bg-purple-50"
                      }`}
                    >
                      <span className="flex w-full items-start justify-between gap-3">
                        <span>
                          <span className="block text-sm font-bold text-slate-900">{ministry.name}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-600">
                            {assignment?.delegateName ? `מואצל אל: ${assignment.delegateName}` : "בחירה ישירה"}
                          </span>
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${assignment ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                          {isActive ? "פתוח" : assignment ? "מואצל" : "ישיר"}
                        </span>
                      </span>
                    </button>

                    {isActive && (
                      <div className="space-y-3 border-t border-purple-100 bg-white p-3">
                        {delegates.length === 0 ? (
                          <p className="py-4 text-center text-slate-600">אין מומחים זמינים למשרד הזה עדיין</p>
                        ) : (
                          delegates.map((delegate) => {
                            const isSelected = mk121QuestionAssignments[ministry.id]?.delegateId === delegate.id;
                            return (
                              <Card key={`mk121-question-${delegate.id}`} className={`p-4 border-2 ${isSelected ? "border-purple-500 bg-purple-50" : "border-slate-200"}`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="text-lg font-bold text-slate-900">{delegate.name}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{delegate.bio}</p>
                                    {delegate.expertise && delegate.expertise.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {delegate.expertise.map((item, index) => (
                                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {item}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-2xl font-bold text-purple-700">{delegate.endorsements}</p>
                                    <p className="text-xs text-slate-600">מאצילים</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => updateMK121QuestionAssignment(delegate.id)}
                                  className="mt-4 w-full"
                                  variant={isSelected ? "default" : "outline"}
                                >
                                  {isSelected ? "✓ מומחה שאילתות נבחר" : "האצל שאילתות למומחה זה"}
                                </Button>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation(isMK121Mode ? "/mk121" : isMinistryPage ? "/delegate-selection" : "/governance")} className="flex items-center gap-2 justify-end">
            {isMK121Mode ? "חזרה לח\"כ 121" : isMinistryPage ? "כל המשרדים" : "חזרה לממשל"}
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">🗳️ הכוון קולך</h1>
          <p className="text-sm text-slate-600">{demoUser.name}</p>
        </div>
      </header>

      <main className="container py-8">
        {!isMinistryPage && (
          <Card className="p-5 mb-6 bg-white border-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">לאן הקול שלי מנותב עכשיו?</h2>
                <p className="text-sm text-slate-600">סקירה עדכנית של מצב הקול שלך בכל משרד.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md bg-green-50 px-4 py-2">
                  <p className="text-2xl font-bold text-green-700">{directVotesCount}</p>
                  <p className="text-xs text-green-700">קול ישיר</p>
                </div>
                <div className="rounded-md bg-purple-50 px-4 py-2">
                  <p className="text-2xl font-bold text-purple-700">{delegatedVotesCount}</p>
                  <p className="text-xs text-purple-700">קול מואצל</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {voteRoutingSummary.map(({ ministry, isDelegated, routedTo, label }) => (
                <button
                  key={ministry.id}
                  type="button"
                  onClick={() => setLocation(`/delegate-selection/${ministry.id}`)}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3 text-right transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="text-sm font-bold leading-5 text-slate-900">{ministry.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                        isDelegated
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isDelegated ? "מואצל" : "ישיר"}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">{label}</p>
                  <p className="mt-1 text-xs font-medium text-slate-800">מנותב אל: {routedTo}</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {!isMinistryPage && (
        <Card className="p-4 mb-6 bg-white border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-3">בחר משרד</h2>
          <Tabs
            value={ministryId.toString()}
            onValueChange={(value) => {
              const id = Number(value);
              if (Number.isFinite(id)) {
                setSelectedMinistryId(id);
                setVotingMethod("delegate");
                setLocation(`/delegate-selection/${id}`);
              }
            }}
          >
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-auto min-w-full w-max justify-start grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-100 p-2">
                {ministries.map((ministry) => (
                  <TabsTrigger
                    key={ministry.id}
                    value={ministry.id.toString()}
                    className="h-auto min-h-20 justify-between rounded-md border bg-white px-4 py-3 text-right data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50"
                    onClick={() => setLocation(`/delegate-selection/${ministry.id}`)}
                  >
                    <span className="flex w-full items-start justify-between gap-3">
                      <span>
                        <span className="block font-bold text-slate-900">{ministry.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-600">
                          {getAssignmentLabel(getAssignmentForMinistry(ministry.id))}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 rounded-full px-2 py-1 text-xs font-medium ${
                          getAssignmentForMinistry(ministry.id)?.votingMethod === "delegate"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getAssignmentForMinistry(ministry.id)?.votingMethod === "delegate" ? "מואצל" : "ישיר"}
                      </span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </Card>
        )}

        {isMinistryPage && selectedMinistry && (
          <Card className="p-6 mb-6 bg-white border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedMinistry.name}</h2>
                <p className="mt-2 text-slate-600">{selectedMinistry.description}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {getAssignmentLabel(currentAssignment)}
              </Badge>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-bold text-slate-900">סטטוס הקול במשרד הנבחר: {getAssignmentLabel(currentAssignment)}</p>
              <p className="text-sm text-slate-600">
                {selectedMinistry?.name}
              </p>
            </div>
          </div>
        </Card>

        {/* Voting Method Selection */}
        <Tabs value={votingMethod} onValueChange={(v) => setVotingMethod(v as any)} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">קול ישיר</TabsTrigger>
            <TabsTrigger value="delegate">מומחה מהרשימה</TabsTrigger>
            <TabsTrigger value="citizen">אזרח לפי ת.ז</TabsTrigger>
          </TabsList>

          {/* Direct Voting Tab */}
          <TabsContent value="direct" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start gap-4">
                <Target className="w-8 h-8 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">קול ישיר</h3>
                  <p className="text-slate-700 mb-4">
                    בחר שהקול שלך במשרד הזה יישאר אצלך. תוכל להצביע בעצמך בכל הצבעה פעילה.
                  </p>
                  <Button
                    onClick={handleVoteDirect}
                    disabled={assignDelegateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {assignDelegateMutation.isPending ? "שומר..." : "אשר קול ישיר"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Delegate Voting Tab */}
          <TabsContent value="delegate" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-4 mb-6">
                <Users className="w-8 h-8 text-purple-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">מומחה מהרשימה</h3>
                  <p className="text-slate-700">
                    בחר מומחה ייעודי למשרד הזה. המומחה יקבל את הקול שלך להצבעות בתחום, ותוכל לשנות את הבחירה בכל עת.
                  </p>
                </div>
              </div>

              {/* Delegates List */}
              <div className="space-y-4">
                {delegates.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">אין נציגים זמינים למשרד זה עדיין</p>
                ) : (
                  delegates.map((delegate) => (
                    <Card
                      key={delegate.id}
                      className={`p-4 cursor-pointer transition border-2 ${
                        currentAssignment?.delegateId === delegate.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                      onClick={() => handleAssignDelegate(delegate.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg">{delegate.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{delegate.bio}</p>

                          {/* Values */}
                          {delegate.values && delegate.values.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {delegate.values.map((value, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Expertise */}
                          {delegate.expertise && delegate.expertise.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {delegate.expertise.map((exp, idx) => (
                                <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  📚 {exp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-purple-600">{delegate.endorsements}</div>
                          <p className="text-xs text-slate-600">מאצילים</p>
                          {currentAssignment?.delegateId === delegate.id && (
                            <Badge className="mt-2 bg-purple-600">✓ בחור</Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignDelegate(delegate.id);
                        }}
                        disabled={assignDelegateMutation.isPending}
                        variant={currentAssignment?.delegateId === delegate.id ? "default" : "outline"}
                        className="w-full mt-4"
                      >
                        {assignDelegateMutation.isPending
                          ? "שומר..."
                          : currentAssignment?.delegateId === delegate.id
                            ? "✓ מואצל נבחר"
                            : "אשר האצלה למומחה"}
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Citizen Delegation Tab */}
          <TabsContent value="citizen" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-start gap-4 mb-6">
                <Users className="w-8 h-8 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">אזרח לפי ת.ז</h3>
                  <p className="text-slate-700">
                    הזן ת.ז כדי לדמות איתור אזרח אחר. המערכת תנפיק שם מלא ותאפשר לך לאשר אליו האצלה במשרד הנבחר.
                  </p>
                </div>
              </div>

              {/* Citizen Search */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="הכנס ת.ז של האזרח"
                    value={citizenSearchId}
                    onChange={(e) => setCitizenSearchId(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearchCitizen}
                    disabled={!citizenSearchId}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    חפש אזרח
                  </Button>
                </div>

                {/* Selected Citizen */}
                {selectedCitizen && (
                  <Card className="p-4 border-2 border-orange-500 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedCitizen.name}</h4>
                        <p className="text-sm text-slate-600">{selectedCitizen.email}</p>
                      </div>
                      <Badge className="bg-orange-600">✓ נבחר</Badge>
                    </div>

                    <Button
                      onClick={handleAssignCitizen}
                      disabled={assignDelegateMutation.isPending}
                      className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                    >
                      {assignDelegateMutation.isPending ? "שומר..." : "אשר האצלה לאזרח"}
                    </Button>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
