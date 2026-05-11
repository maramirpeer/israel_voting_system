import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, Users, Target, Search } from "lucide-react";
import { toast } from "sonner";

export default function DelegateSelection() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);
  const [selectedDelegateId, setSelectedDelegateId] = useState<number | null>(null);
  const [votingMethod, setVotingMethod] = useState<"direct" | "delegate" | "citizen">("direct");
  const [showDirectVotingStatus, setShowDirectVotingStatus] = useState(true);
  const [citizenSearchId, setCitizenSearchId] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<{ id: number; name: string; email: string } | null>(null);

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const delegatesQuery = trpc.delegates.listByMinistry.useQuery(
    { ministryId: selectedMinistryId || 0 },
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
      delegatesQuery.refetch();
      setSelectedCitizen(null);
      setCitizenSearchId("");
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

  // Determine voting method based on current assignment
  const currentVotingMethod = currentAssignment?.votingMethod || "direct";

  const handleAssignDelegate = (delegateId: number) => {
    if (!user?.id || !selectedMinistryId) return;

    assignDelegateMutation.mutate({
      userId: user.id,
      ministryId: selectedMinistryId,
      delegateId,
      delegateUserId: null,
    });
    setVotingMethod("delegate");
  };

  const handleVoteDirect = () => {
    if (!user?.id || !selectedMinistryId) return;

    assignDelegateMutation.mutate({
      userId: user.id,
      ministryId: selectedMinistryId,
      delegateId: null,
      delegateUserId: null,
    });
    setVotingMethod("direct");
  };

  const handleSearchCitizen = async () => {
    const citizenId = parseInt(citizenSearchId);
    if (!citizenId || !user?.id) {
      toast.error("הכנס מספר ת.ז תקין");
      return;
    }
    try {
      // Use tRPC client method correctly - cast to any to bypass TS check
      const result = await (trpc.delegates.validateCitizenDelegation as any).query({
        delegatorId: user.id,
        delegateUserId: citizenId,
      });
      
      if (result?.valid && result?.citizen) {
        setSelectedCitizen(result.citizen);
        toast.success(`בחרת את ${result.citizen?.name} כנציג`);
      } else {
        toast.error(result.error || "אזרח לא נמצא");
      }
    } catch (error) {
      toast.error("שגיאה בחיפוש אזרח");
    }
  };

  const handleAssignCitizen = () => {
    if (!user?.id || !selectedMinistryId || !selectedCitizen) return;

    assignDelegateMutation.mutate({
      userId: user.id,
      ministryId: selectedMinistryId,
      delegateId: null,
      delegateUserId: selectedCitizen.id,
    });
    setVotingMethod("citizen");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">נדרש התחברות</h1>
          <p className="text-slate-600 mb-6">עליך להתחבר כדי לבחור נציג</p>
          <Button onClick={() => setLocation("/governance")} className="w-full">
            חזור לממשל
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🗳️ בחירת נציגים</h1>
            <p className="text-slate-600">בחר כיצד תרצה להצביע בכל משרד</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/governance")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            חזרה לממשל
          </Button>
        </div>

        {/* Status Card */}
        {currentAssignment && (
          <Card
            className={`p-6 mb-8 border-2 ${
              currentVotingMethod === "direct"
                ? "bg-green-50 border-green-300"
                : "bg-blue-50 border-blue-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle
                className={`w-6 h-6 ${
                  currentVotingMethod === "direct" ? "text-green-600" : "text-blue-600"
                }`}
              />
              <div>
                <p className="font-semibold text-slate-900">
                  {currentVotingMethod === "direct"
                    ? "✓ אתה מצביע ישירות"
                    : currentVotingMethod === "delegate"
                    ? `✓ אתה מאציל קול לנציג: ${currentAssignment.delegateName || "בחירה..."}`
                    : `✓ אתה מאציל קול לאזרח`}
                </p>
                <p className="text-sm text-slate-600">{ministries.find(m => m.id === selectedMinistryId)?.name}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Ministry Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {ministries.map((ministry) => (
            <Button
              key={ministry.id}
              onClick={() => setSelectedMinistryId(ministry.id)}
              variant={selectedMinistryId === ministry.id ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {ministry.icon || '📋'} {ministry.name}
            </Button>
          ))}
        </div>

        {/* Voting Method Selection */}
        <Tabs defaultValue="delegate" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delegate">האצלת קולי לנציג מוצע</TabsTrigger>
            <TabsTrigger value="citizen">האצלת קולי לפי ת.ז</TabsTrigger>
          </TabsList>

          {/* Delegate Voting Tab */}
          <TabsContent value="delegate" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-4 mb-6">
                <Target className="w-8 h-8 text-purple-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">בחירת נציג מוצע</h3>
                  <p className="text-slate-700">
                    בחר מנציגים מומלצים שנבחרו על סמך ניסיון ומומחיות בתחום. כל נציג מציג את ערכיו ותחומי המומחיות שלו.
                  </p>
                </div>
              </div>

              {/* Direct Voting Option */}
              <div className="mb-6">
                <Button
                  onClick={handleVoteDirect}
                  variant={currentVotingMethod === "direct" ? "default" : "outline"}
                  className="w-full justify-start gap-3 h-auto py-4 px-4"
                >
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">צבעה ישירה</p>
                    <p className="text-sm opacity-75">אתה מצביע ישירות בכל הצעה</p>
                  </div>
                </Button>
              </div>

              {/* Delegates List */}
              <div className="space-y-4">
                {delegates.length > 0 ? (
                  delegates.map((delegate) => (
                    <Card key={delegate.id} className="p-4 border-slate-200 hover:border-purple-300 transition-colors">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{delegate.name}</h4>
                          <p className="text-sm text-slate-600 mb-3">{delegate.bio}</p>

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
                            ? "✓ בחור כנציג"
                            : "בחר כנציג"}
                      </Button>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-slate-600 py-8">אין נציגים זמינים למשרד זה</p>
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2">האצלה לאזרח אחר</h3>
                  <p className="text-slate-700">
                    אתה יכול להאציל את קולך לאזרח אחר בעל ת.ז. זה מאפשר לך להאציל לחבר, משפחה, או כל אזרח אחר שבו אתה סומך.
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
                    disabled={assignDelegateMutation.isPending || !citizenSearchId}
                    className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    חיפוש
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
                      {assignDelegateMutation.isPending ? "שומר..." : "אשר האצלה"}
                    </Button>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
