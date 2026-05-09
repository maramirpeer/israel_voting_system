import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, ThumbsDown, Users, User } from "lucide-react";

interface VotingInterfaceProps {
  decisionId: number;
  ministryId: number;
  onClose: () => void;
}

export function VotingInterface({ decisionId, ministryId, onClose }: VotingInterfaceProps) {
  const [votingMethod, setVotingMethod] = useState<"direct" | "delegate">("direct");
  const [delegateMethod, setDelegateMethod] = useState<"list" | "id">("list");
  const [selectedDelegateId, setSelectedDelegateId] = useState<number | null>(null);
  const [citizenId, setCitizenId] = useState("");
  const [userId, setUserId] = useState(1); // Demo user ID

  // Fetch approved delegates
  const { data: delegates } = trpc.mk121.getApprovedDelegates.useQuery({ ministryId });

  // Mutations
  const castVoteMutation = trpc.mk121.castDirectVote.useMutation();
  const delegateToDelegateMutation = trpc.mk121.delegateVoteToDelegateFromList.useMutation();
  const delegateToIdMutation = trpc.mk121.delegateVoteByCitizenId.useMutation();

  const handleDirectVote = async (vote: "for" | "against") => {
    try {
      await castVoteMutation.mutateAsync({
        decisionId,
        userId,
        vote,
      });
      onClose();
    } catch (error) {
      console.error("Voting error:", error);
    }
  };

  const handleDelegateToDelegate = async () => {
    if (!selectedDelegateId) return;
    try {
      await delegateToDelegateMutation.mutateAsync({
        decisionId,
        userId,
        delegateId: selectedDelegateId,
        ministryId,
      });
      onClose();
    } catch (error) {
      console.error("Delegation error:", error);
    }
  };

  const handleDelegateToId = async () => {
    if (!citizenId) return;
    try {
      await delegateToIdMutation.mutateAsync({
        decisionId,
        userId,
        delegateCitizenId: citizenId,
        ministryId,
      });
      onClose();
    } catch (error) {
      console.error("Delegation error:", error);
    }
  };

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <Tabs value={votingMethod} onValueChange={(v) => setVotingMethod(v as "direct" | "delegate")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            הצבעה ישירה
          </TabsTrigger>
          <TabsTrigger value="delegate" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            האצלת קול
          </TabsTrigger>
        </TabsList>

        {/* Direct Voting */}
        <TabsContent value="direct" className="space-y-3">
          <p className="text-sm text-gray-700 mb-3">בחר את עמדתך:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleDirectVote("for")}
              disabled={castVoteMutation.isPending}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              בעד
            </Button>
            <Button
              onClick={() => handleDirectVote("against")}
              disabled={castVoteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              נגד
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            ביטול
          </Button>
        </TabsContent>

        {/* Delegation */}
        <TabsContent value="delegate" className="space-y-3">
          <Tabs value={delegateMethod} onValueChange={(v) => setDelegateMethod(v as "list" | "id")}>
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="list" className="text-xs">מרשימה</TabsTrigger>
              <TabsTrigger value="id" className="text-xs">לפי ת.ז</TabsTrigger>
            </TabsList>

            {/* Delegate from list */}
            <TabsContent value="list" className="space-y-3">
              <p className="text-sm text-gray-700">בחר נציג מאומת:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {delegates && delegates.length > 0 ? (
                  delegates.map((delegate) => (
                    <button
                      key={delegate.id}
                      onClick={() => setSelectedDelegateId(delegate.id)}
                      className={`w-full p-2 text-left rounded border-2 transition-colors ${
                        selectedDelegateId === delegate.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">{delegate.name}</div>
                      {delegate.bio && <div className="text-xs text-gray-600">{delegate.bio}</div>}
                      <Badge variant="secondary" className="mt-1 text-xs">
                        👍 {delegate.endorsements || 0} תמיכות
                      </Badge>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">אין נציגים זמינים</p>
                )}
              </div>
              <Button
                onClick={handleDelegateToDelegate}
                disabled={!selectedDelegateId || delegateToDelegateMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {delegateToDelegateMutation.isPending ? "שולח..." : "האצל קול לנציג"}
              </Button>
            </TabsContent>

            {/* Delegate by citizen ID */}
            <TabsContent value="id" className="space-y-3">
              <p className="text-sm text-gray-700">הזן ת.ז של אזרח:</p>
              <input
                type="text"
                placeholder="ת.ז (9 ספרות)"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, "").slice(0, 9))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <Button
                onClick={handleDelegateToId}
                disabled={citizenId.length !== 9 || delegateToIdMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {delegateToIdMutation.isPending ? "שולח..." : "האצל קול לאזרח"}
              </Button>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <Button
        onClick={onClose}
        variant="ghost"
        className="w-full mt-2"
      >
        סגור
      </Button>
    </Card>
  );
}
