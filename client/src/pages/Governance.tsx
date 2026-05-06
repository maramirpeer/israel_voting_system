import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Governance() {
  const { user, isAuthenticated } = useAuth();
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const decisionsQuery = trpc.governance.decisions.list.useQuery();
  const activeDecisionsQuery = trpc.governance.decisions.active.useQuery();

  // Mutations
  const createDecisionMutation = trpc.governance.decisions.create.useMutation();
  const castVoteMutation = trpc.governance.votes.cast.useMutation();

  const ministries = ministriesQuery.data || [];
  const decisions = decisionsQuery.data || [];
  const activeDecisions = activeDecisionsQuery.data || [];

  const handleCreateDecision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createDecisionMutation.mutateAsync({
        ministryId: parseInt(formData.get("ministryId") as string),
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as "major" | "medium" | "routine",
      });

      decisionsQuery.refetch();
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
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "routine":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-slate-900">🏛️ מערכת ממשל שקופה</h1>
          <p className="text-slate-600 mt-1">ממשל בשקיפות מלאה עם הצלת קול אזרחית</p>
        </div>
      </header>

      <main className="container py-8">
        {!isAuthenticated ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">נדרש התחברות</h2>
            <p className="text-slate-600 mb-4">אנא התחברו כדי להשתתף בהצבעות ולהציע החלטות</p>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
              <TabsTrigger value="decisions">החלטות</TabsTrigger>
              {user?.role === "minister" || user?.role === "admin" ? (
                <TabsTrigger value="create">יצירת החלטה</TabsTrigger>
              ) : null}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">החלטות פעילות</p>
                      <p className="text-3xl font-bold text-blue-900">{activeDecisions.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </Card>

                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">החלטות מאושרות</p>
                      <p className="text-3xl font-bold text-green-900">
                        {decisions.filter((d) => d.status === "approved").length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </Card>

                <Card className="p-6 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">החלטות שנדחו</p>
                      <p className="text-3xl font-bold text-red-900">
                        {decisions.filter((d) => d.status === "rejected").length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                </Card>
              </div>

              {/* Ministries */}
              <div>
                <h2 className="text-2xl font-bold mb-4">המשרדים</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {ministries.map((ministry) => (
                    <Card key={ministry.id} className="p-4 hover:shadow-lg transition cursor-pointer">
                      <div className="text-3xl mb-2">{ministry.icon}</div>
                      <h3 className="font-bold text-slate-900">{ministry.name}</h3>
                      <p className="text-sm text-slate-600 mt-2">{ministry.description}</p>
                      <div className="mt-3 text-xs font-medium text-slate-500">
                        {decisions.filter((d) => d.ministryId === ministry.id).length} החלטות
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Decisions Tab */}
            <TabsContent value="decisions" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">כל ההחלטות</h2>
                <Select value={selectedMinistry?.toString() || ""} onValueChange={(v) => setSelectedMinistry(v ? parseInt(v) : null)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="סנן לפי משרד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל המשרדים</SelectItem>
                    {ministries.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {decisions
                  .filter((d) => !selectedMinistry || d.ministryId === selectedMinistry)
                  .map((decision) => (
                    <Card key={decision.id} className={`p-6 border-l-4 ${getCategoryColor(decision.category)}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{decision.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{decision.description}</p>
                        </div>
                        <Badge className={getStatusColor(decision.status)}>{decision.status}</Badge>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline">{ministries.find((m) => m.id === decision.ministryId)?.name}</Badge>
                        <Badge variant="outline">{decision.category}</Badge>
                      </div>

                      {decision.status === "voting" && (
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-slate-600">בעד</p>
                              <p className="text-2xl font-bold text-green-600">{decision.votesFor}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">נגד</p>
                              <p className="text-2xl font-bold text-red-600">{decision.votesAgainst}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleVote(decision.id, "for")}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={castVoteMutation.isPending}
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              הצביעו בעד
                            </Button>
                            <Button
                              onClick={() => handleVote(decision.id, "against")}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              disabled={castVoteMutation.isPending}
                            >
                              <ThumbsDown className="w-4 h-4 mr-2" />
                              הצביעו נגד
                            </Button>
                          </div>
                        </div>
                      )}

                      {decision.status === "approved" && (
                        <div className="bg-green-50 p-3 rounded text-sm text-green-700 font-medium">
                          ✓ החלטה אושרה
                        </div>
                      )}

                      {decision.status === "rejected" && (
                        <div className="bg-red-50 p-3 rounded text-sm text-red-700 font-medium">
                          ✗ החלטה נדחתה - הצלת קול אזרחית
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
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
                          <SelectValue placeholder="בחרו משרד" />
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
                          <SelectItem value="major">החלטה גדולה</SelectItem>
                          <SelectItem value="medium">החלטה בינונית</SelectItem>
                          <SelectItem value="routine">החלטה שגרתית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createDecisionMutation.isPending}>
                      {createDecisionMutation.isPending ? "יוצר..." : "הצעת החלטה"}
                    </Button>
                  </form>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
}
