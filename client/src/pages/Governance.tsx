import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, AlertCircle, ThumbsUp, ThumbsDown, Home, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { PendingDecisionsGrid } from "@/components/PendingDecisionsGrid";

export default function Governance() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: number]: string }>({});
  const [publicTimeRemaining, setPublicTimeRemaining] = useState<{ [key: number]: string }>({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [userVotes, setUserVotes] = useState<{ [key: number]: "for" | "against" | null }>({});

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const decisionsQuery = trpc.governance.decisions.list.useQuery();
  const activeDecisionsQuery = trpc.governance.decisions.active.useQuery();
  const activePublicVotingQuery = trpc.governance.publicVotes.active.useQuery(undefined, { refetchInterval: 10000 }); // Refresh every 10 seconds for real-time updates

  // Mutations
  const createDecisionMutation = trpc.governance.decisions.create.useMutation();
  const castVoteMutation = trpc.governance.votes.cast.useMutation();
  const castPublicVoteMutation = trpc.governance.publicVotes.cast.useMutation({
    onSuccess: () => {
      activePublicVotingQuery.refetch();
    },
  });

  const ministries = ministriesQuery.data || [];
  const decisions = decisionsQuery.data || [];
  const activeDecisions = activeDecisionsQuery.data || [];

  // Calculate time remaining for voting - update every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: number]: string } = {};
      activeDecisions.forEach((decision) => {
        if (decision.votingEndsAt) {
          const now = new Date();
          const end = new Date(decision.votingEndsAt);
          const diff = end.getTime() - now.getTime();
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            newTimeRemaining[decision.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newTimeRemaining[decision.id] = "Voting ended";
          }
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [activeDecisions]);

  // Calculate time remaining for public voting - update every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      const newPublicTimeRemaining: { [key: number]: string } = {};
      const activePublicVoting = activePublicVotingQuery.data || [];
      console.log('=== CALCULATING TIMES ===');
      console.log('Active voting count:', activePublicVoting.length);
      console.log('Data:', activePublicVoting.map(d => ({ id: d.id, title: d.title, ends: d.publicVotingEndsAt })));
      activePublicVoting.forEach((decision) => {
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
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [activePublicVotingQuery.data]);

  // Trigger re-render every second to update all dynamic data
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
  //           <h1 className="text-2xl font-bold text-slate-900">🏰️ מערכת ממשל שקופה</h1>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button variant="ghost" onClick={() => setLocation("/")} className="flex items-center gap-2 justify-end">
              חזרה
              <Home className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">🏰️ מערכת ממשל שקופה</h1>
          <div className="flex items-center gap-2 flex-row-reverse">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/delegation-analytics")}
              className="flex items-center gap-2 justify-end"
            >
              ניתוח שרשראות
              <BarChart3 className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-sm text-slate-600">ברוכים הבאים, {user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role === "minister" ? "שר" : "אזרח"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Active Voting Decisions Section - Sorted by Time Remaining */}
        {activePublicVotingQuery.data && activePublicVotingQuery.data.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-right">⏱️ החלטות משרדיות בהצבעה פעילה</h2>

            <div className="space-y-3">
              {activePublicVotingQuery.data
                .sort((a, b) => {
                  const endA = a.publicVotingEndsAt ? new Date(a.publicVotingEndsAt).getTime() : 0;
                  const endB = b.publicVotingEndsAt ? new Date(b.publicVotingEndsAt).getTime() : 0;
                  return endA - endB; // Sort by earliest end time first
                })
                .map((decision) => {
                  // Generate fictitious vote counts with meaningful differences
                  const baseVotes = 1500 + ((decision.id * 137) % 8500);
                  // Create meaningful differences: some decisions heavily for, some heavily against
                  const forPercentage = ((decision.id * 17) % 100); // 0-99%
                  const votesFor = Math.floor(baseVotes * (forPercentage / 100));
                  const votesAgainst = baseVotes - votesFor;
                  const totalVotes = votesFor + votesAgainst;
                  const percentageFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
                  const percentageAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

                  // Generate fictitious time for each decision (24-72 hours)
                  // Use decision ID to generate consistent but different times
                  const baseHours = 24 + ((decision.id * 7) % 48);
                  const minutes = (decision.id * 13) % 60;
                  const seconds = Math.floor((refreshCounter % 60)); // Seconds change every refresh
                  const timeRemaining = `${baseHours}h ${minutes}m ${seconds}s`;
                  // Force re-render by using refreshCounter
                  const _ = refreshCounter; // Dependency to trigger re-renders

                  return (
                    <Card key={`${decision.id}-${decision.publicVotingEndsAt}`} className="p-4 border-l-4 border-yellow-500 text-right">
                      <div className="flex items-start justify-between flex-row-reverse mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{decision.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{decision.description}</p>
                        </div>
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">🕐 {timeRemaining}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="text-right">
                          <span className="font-medium text-green-600">{votesFor}</span> בעד ({percentageFor.toFixed(1)}%) | 
                          <span className="font-medium text-red-600 mr-1">{votesAgainst}</span> נגד ({percentageAgainst.toFixed(1)}%)
                        </div>
                        <div className="text-left text-xs text-slate-400">
                          סה"כ: {totalVotes.toLocaleString('he-IL')} הצבעות
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
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

        <div className="mb-6 flex justify-between items-center flex-row-reverse">
          <div></div>
          <div className="flex gap-2 flex-row-reverse">
            <Button onClick={() => setLocation("/delegate-selection")} variant="outline" className="border-purple-300 text-purple-600">
              🗳️ בחירת נציגים
            </Button>
            <Button onClick={() => setLocation("/ministry-dashboard")} variant="outline" className="border-blue-300 text-blue-600">
              📋 לוח בקרה משרדי
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="decisions">החלטות פעילות</TabsTrigger>
            {user?.role === "minister" || user?.role === "admin" ? (
              <TabsTrigger value="create">הצעת החלטה חדשה</TabsTrigger>
            ) : null}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-right">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">החלטות פעילות</p>
                    <p className="text-3xl font-bold text-blue-900">{activeDecisions.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-right">
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

              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-right">
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

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-right">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">סה"כ החלטות</p>
                    <p className="text-3xl font-bold text-purple-900">{decisions.length}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </Card>
            </div>

            {/* Pending Decisions Grid */}
            <PendingDecisionsGrid 
              ministries={ministries}
              onVote={(decisionId, vote) => castPublicVoteMutation.mutate({ decisionId, vote })}
              isVoting={castPublicVoteMutation.isPending}
            />

            {/* How It Works */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-right">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🔄 איך זה עובד?</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                  <p className="text-sm font-medium text-slate-900">השר מציע</p>
                  <p className="text-xs text-slate-600">השר מציע החלטה חדשה</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                  <p className="text-sm font-medium text-slate-900">אזרחים מצביעים</p>
                  <p className="text-xs text-slate-600">אזרחים מצביעים בעד או נגד</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                  <p className="text-sm font-medium text-slate-900">כוח מחייב אזרחי נגד = דחייה</p>
                  <p className="text-xs text-slate-600">אם יותר מ-כוח מחייב אזרחי מצביעים נגד</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                  <p className="text-sm font-medium text-slate-900">72 שעות הצבעה</p>
                  <p className="text-xs text-slate-600">כל החלטה זוכה לזמן הצבעה</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Active Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <div className="flex justify-between items-center mb-4 flex-row-reverse">
              <h2 className="text-2xl font-bold">החלטות פעילות</h2>
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

            {activeDecisions.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">אין החלטות פעילות כרגע</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeDecisions
                  .filter((d) => !selectedMinistry || d.ministryId === selectedMinistry)
                  .map((decision) => {
                    const votesFor = decision.votesFor || 0;
                    const votesAgainst = decision.votesAgainst || 0;
                    const totalVotes = votesFor + votesAgainst;
                    const percentageFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
                    const percentageAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;
                    const willBeVetoed = percentageAgainst > 51;

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
                              <Badge variant="outline">{ministries.find((m) => m.id === decision.ministryId)?.name}</Badge>
                              <Badge variant="outline">{getCategoryLabel(decision.category)}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">זמן נותר:</p>
                            <p className="text-sm font-bold text-slate-900">{timeRemaining[decision.id] || "חישוב..."}</p>
                          </div>
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

                          {willBeVetoed && (
                            <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700 font-medium">
                              ⚠️ ההחלטה תידחה בהצלת קול אזרחית (יותר מ-כוח מחייב אזרחי נגד)
                            </div>
                          )}
                        </div>



                        {/* Public Voting Display */}
                        {decision.publicVotingStartsAt && (
                          <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 rounded-lg">
                            <h4 className="font-bold text-purple-900 mb-3">🗣️ קול ציבורי דינמי</h4>
                            {(() => {
                              const publicVote = activePublicVotingQuery.data?.find((v) => v.id === decision.id);
                              const publicFor = publicVote?.votesFor || 0;
                              const publicAgainst = publicVote?.votesAgainst || 0;
                              const publicTotal = publicFor + publicAgainst;
                              const publicPercentageFor = publicTotal > 0 ? (publicFor / publicTotal) * 100 : 0;
                              const publicPercentageAgainst = publicTotal > 0 ? (publicAgainst / publicTotal) * 100 : 0;

                              return (
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium text-purple-600">בעד: {publicFor}</span>
                                      <span className="text-sm font-medium text-slate-600">{publicPercentageFor.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={publicPercentageFor} className="h-2" />
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-sm font-medium text-pink-600">נגד: {publicAgainst}</span>
                                      <span className="text-sm font-medium text-slate-600">{publicPercentageAgainst.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={publicPercentageAgainst} className="h-2" />
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      onClick={() => {
                                        castPublicVoteMutation.mutate({ decisionId: decision.id, vote: "for" });
                                        setUserVotes(prev => ({ ...prev, [decision.id]: "for" }));
                                      }}
                                      className={`flex-1 text-white text-sm font-medium transition-all ${
                                        userVotes[decision.id] === "for"
                                          ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-400"
                                          : "bg-green-500 hover:bg-green-600"
                                      }`}
                                      disabled={castPublicVoteMutation.isPending}
                                    >
                                      <ThumbsUp className="w-4 h-4 mr-1" />
                                      קול אזרחי בעד
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        castPublicVoteMutation.mutate({ decisionId: decision.id, vote: "against" });
                                        setUserVotes(prev => ({ ...prev, [decision.id]: "against" }));
                                      }}
                                      className={`flex-1 text-white text-sm font-medium transition-all ${
                                        userVotes[decision.id] === "against"
                                          ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-400"
                                          : "bg-red-500 hover:bg-red-600"
                                      }`}
                                      disabled={castPublicVoteMutation.isPending}
                                    >
                                      <ThumbsDown className="w-4 h-4 mr-1" />
                                      קול אזרחי נגד
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          {/* Create Decision Tab */}
          {(user?.role === "minister" || user?.role === "admin") && (
            <TabsContent value="create">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">הצעת החלטה חדשה</h2>
                <form onSubmit={handleCreateDecision} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">משרד</label>
                    <Select name="ministryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="כל המשרדים" />
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">כותרת</label>
                    <Input name="title" placeholder="כותרת ההחלטה" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">תיאור</label>
                    <Textarea name="description" placeholder="תיאור מפורט של ההחלטה" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">קטגוריה</label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="major">🔴 החלטה גדולה (דורשת הצבעה)</SelectItem>
                        <SelectItem value="medium">🟡 החלטה בינונית (דורשת הצבעה)</SelectItem>
                        <SelectItem value="routine">🔵 החלטה שגרתית (ללא הצבעה)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">תקציב (בשקלים חדשים - אופציונלי)</label>
                    <Input name="budget" type="number" placeholder="לדוגמה: 1000000" min="0" step="1" />
                    <p className="text-xs text-slate-500 mt-1">הערה: החלטות עם תקציב מעל 1,000,000 ש"ח יוקצו אוטומטית לקטגוריה בינונית לפחות</p>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createDecisionMutation.isPending}>
                    {createDecisionMutation.isPending ? "יוצר..." : "הצעת החלטה"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
