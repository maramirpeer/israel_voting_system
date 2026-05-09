import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { VotingInterface } from "./VotingInterface";

export function ActiveVotingSection() {
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<number, string>>({});

  // Fetch active voting decisions
  const { data: decisions, isLoading, error } = trpc.mk121.getActiveVotingDecisions.useQuery();

  // Update countdown timers
  useEffect(() => {
    if (!decisions) return;

    const interval = setInterval(() => {
      const newTimeRemaining: Record<number, string> = {};
      
      decisions.forEach((decision) => {
        if (decision.votingEndsAt) {
          const now = new Date();
          const endsAt = new Date(decision.votingEndsAt);
          const diffMs = endsAt.getTime() - now.getTime();

          if (diffMs <= 0) {
            newTimeRemaining[decision.id] = "Voting ended";
          } else {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            if (hours > 0) {
              newTimeRemaining[decision.id] = `${hours}h ${minutes}m`;
            } else if (minutes > 0) {
              newTimeRemaining[decision.id] = `${minutes}m ${seconds}s`;
            } else {
              newTimeRemaining[decision.id] = `${seconds}s`;
            }
          }
        }
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [decisions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">⏰ החלטות בהצבעה פעילה</h2>
        <div className="text-center text-gray-500">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">⏰ החלטות בהצבעה פעילה</h2>
        <div className="text-center text-red-500">שגיאה בטעינת ההחלטות</div>
      </div>
    );
  }

  if (!decisions || decisions.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">⏰ החלטות בהצבעה פעילה</h2>
        <div className="text-center text-gray-500">אין החלטות בהצבעה כרגע</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">⏰ החלטות בהצבעה פעילה</h2>
        <p className="text-gray-600">החלטות משרדיות המחכות להצבעה ציבורית ב-72 שעות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decisions.map((decision) => (
          <Card key={decision.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg line-clamp-2">{decision.title}</h3>
                  {decision.ministry && (
                    <Badge variant="outline" className="mt-2">
                      📢 {decision.ministry.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{decision.description}</p>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 p-2 rounded">
                <Clock className="w-4 h-4" />
                <span>⏱️ {timeRemaining[decision.id] || "טוען..."}</span>
              </div>

              {/* Vote Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>בעד: {decision.votesFor || 0}</span>
                  <span>נגד: {decision.votesAgainst || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  {(() => {
                    const total = (decision.votesFor || 0) + (decision.votesAgainst || 0);
                    const forPercentage = total > 0 ? ((decision.votesFor || 0) / total) * 100 : 0;
                    return (
                      <div
                        className="bg-green-500 h-full transition-all"
                        style={{ width: `${forPercentage}%` }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Vote Buttons */}
              {selectedDecision === decision.id ? (
                <VotingInterface
                  decisionId={decision.id}
                  ministryId={decision.ministryId}
                  onClose={() => setSelectedDecision(null)}
                />
              ) : (
                <Button
                  onClick={() => setSelectedDecision(decision.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  🗳️ הצבע עכשיו
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
