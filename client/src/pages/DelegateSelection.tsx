import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Users, Target } from "lucide-react";
import { toast } from "sonner";

export default function DelegateSelection() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);
  const [selectedDelegateId, setSelectedDelegateId] = useState<number | null>(null);
  const [votingMethod, setVotingMethod] = useState<"direct" | "delegate">("direct");

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const delegatesQuery = trpc.delegates.listByMinistry.useQuery(
    { ministryId: selectedMinistryId || 1 },
    { enabled: !!selectedMinistryId }
  );
  const assignmentsQuery = trpc.delegates.getCitizenAssignments.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Mutations
  const assignDelegateMutation = trpc.delegates.assign.useMutation({
    onSuccess: () => {
      toast.success("נציג השתנה בהצלחה!");
      assignmentsQuery.refetch();
    },
    onError: () => {
      toast.error("שגיאה בשינוי הנציג");
    },
  });

  const ministries = ministriesQuery.data || [];
  const delegates = delegatesQuery.data || [];
  const assignments = assignmentsQuery.data || [];

  // Initialize first ministry on load
  useEffect(() => {
    if (!selectedMinistryId && ministries.length > 0) {
      setSelectedMinistryId(ministries[0].id);
    }
  }, [ministries, selectedMinistryId]);

  const currentAssignment = selectedMinistryId
    ? assignments.find((a) => a.ministryId === selectedMinistryId)
    : null;

  const handleAssignDelegate = (delegateId: number) => {
    if (!user?.id || !selectedMinistryId) return;

    assignDelegateMutation.mutate({
      userId: user.id,
      ministryId: selectedMinistryId,
      delegateId,
      delegateUserId: null,
    });
  };

  const handleVoteDirect = () => {
    if (!user?.id || !selectedMinistryId) return;

    assignDelegateMutation.mutate({
      userId: user.id,
      ministryId: selectedMinistryId,
      delegateId: null,
      delegateUserId: null,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="container py-4">
            <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              חזרה
            </Button>
          </div>
        </header>
        <main className="container py-8">
          <Card className="p-8 text-center">
            <p className="text-slate-600">נדרש התחברות</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/governance")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            חזרה לממשל
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">🗳️ בחירת נציגים</h1>
          <div className="w-48">
            <Select value={selectedMinistryId?.toString() || ""} onValueChange={(v) => setSelectedMinistryId(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="בחרו משרד" />
              </SelectTrigger>
              <SelectContent>
                {ministries.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.icon} {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Current Selection */}
        {currentAssignment && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-bold text-slate-900">
                  {currentAssignment.votingMethod === "direct"
                    ? "אתה מצביע ישירות"
                    : `אתה מאציל קול ל: ${currentAssignment.delegateName}`}
                </p>
                <p className="text-sm text-slate-600">
                  {ministries.find((m) => m.id === selectedMinistryId)?.name}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Voting Method Selection */}
        <Tabs defaultValue="direct" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">הצבעה ישירה</TabsTrigger>
            <TabsTrigger value="delegate">אצלת קול</TabsTrigger>
          </TabsList>

          {/* Direct Voting Tab */}
          <TabsContent value="direct" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start gap-4">
                <Target className="w-8 h-8 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">הצבעה ישירה</h3>
                  <p className="text-slate-700 mb-4">
                    בחר להצביע ישירות על כל החלטה. אתה תקבל הודעות על הצבעות חדשות ותוכל להחליט בעצמך.
                  </p>
                  <Button
                    onClick={handleVoteDirect}
                    disabled={assignDelegateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {assignDelegateMutation.isPending ? "שומר..." : "בחר הצבעה ישירה"}
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2">אצלת קול</h3>
                  <p className="text-slate-700">
                    בחר נציג שתאציל לו את קולך. הנציג יצביע בשמך על החלטות. אתה יכול לשנות את בחירתך בכל עת.
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
                          <p className="text-xs text-slate-600">תומכים</p>
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
                            ? "✓ בחור כנציג"
                            : "בחר כנציג"}
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="p-6 bg-slate-50 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">ℹ️ כיצד זה עובד?</h3>
          <div className="space-y-3 text-slate-700">
            <p>
              <strong>הצבעה ישירה:</strong> אתה מצביע ישירות על כל החלטה. זה דורה מעורבות אך נותן לך שליטה מלאה.
            </p>
            <p>
              <strong>אצלת קול:</strong> אתה בוחר נציג שיצביע בשמך. אתה יכול לשנות את בחירתך בכל עת.
            </p>
            <p>
              <strong>גמישות:</strong> אתה יכול להחליף בין הצבעה ישירה לאצלת קול בכל רגע, לכל משרד בנפרד.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
