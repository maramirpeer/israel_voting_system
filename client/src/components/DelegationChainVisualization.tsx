import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, GitBranch } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface DelegationChainVisualizationProps {
  ministryId: number;
  ministryName: string;
}

export function DelegationChainVisualization({
  ministryId,
  ministryName,
}: DelegationChainVisualizationProps) {
  const statsQuery = trpc.delegationAnalytics.getStats.useQuery({ ministryId });

  if (statsQuery.isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="animate-spin">⏳</div>
          טוען נתונים...
        </div>
      </Card>
    );
  }

  const stats = statsQuery.data;
  if (!stats) return null;

  const delegationPercentage = stats.totalCitizens > 0 
    ? Math.round((stats.delegatedVoters / stats.totalCitizens) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Citizens */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">סה"כ אזרחים</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCitizens}</p>
            </div>
            <Users className="w-8 h-8 text-purple-300" />
          </div>
        </Card>

        {/* Direct Voters */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">מצביעים ישירות</p>
              <p className="text-3xl font-bold text-green-600">{stats.directVoters}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.totalCitizens > 0 
                  ? Math.round((stats.directVoters / stats.totalCitizens) * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-300" />
          </div>
        </Card>

        {/* Delegated Voters */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">מאוצלים</p>
              <p className="text-3xl font-bold text-blue-600">{stats.delegatedVoters}</p>
              <p className="text-xs text-slate-500 mt-1">{delegationPercentage}%</p>
            </div>
            <GitBranch className="w-8 h-8 text-blue-300" />
          </div>
        </Card>
      </div>

      {/* Top Delegates */}
      {stats.topDelegates.length > 0 && (
        <Card className="p-6 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            נציגים מובילים
          </h3>
          <div className="space-y-3">
            {stats.topDelegates.map((delegate, idx) => (
              <div
                key={delegate.delegateId}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>

                  {/* Delegate Info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{delegate.delegateName}</h4>
                    <p className="text-sm text-slate-600">
                      {delegate.directDelegations} אזרחים מאוצלים
                    </p>
                  </div>
                </div>

                {/* Vote Count */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {delegate.totalVotesRepresented}
                  </div>
                  <p className="text-xs text-slate-600">קולות</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delegation Distribution */}
      <Card className="p-6 border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">התפלגות האצלה</h3>
        
        {/* Direct Voters Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">מצביעים ישירות</span>
            <span className="text-sm font-bold text-slate-900">{stats.directVoters}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
              style={{
                width: `${
                  stats.totalCitizens > 0
                    ? (stats.directVoters / stats.totalCitizens) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Delegated Voters Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">מאוצלים</span>
            <span className="text-sm font-bold text-slate-900">{stats.delegatedVoters}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
              style={{
                width: `${
                  stats.totalCitizens > 0
                    ? (stats.delegatedVoters / stats.totalCitizens) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* All Delegates List */}
      {stats.delegationChains.length > 0 && (
        <Card className="p-6 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">כל הנציגים</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.delegationChains.map((delegate) => (
              <div
                key={delegate.delegateId}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{delegate.delegateName}</p>
                  <p className="text-xs text-slate-600">
                    {delegate.directDelegations} אזרחים מאוצלים
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                  {delegate.totalVotesRepresented} קולות
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {stats.delegationChains.length === 0 && (
        <Card className="p-8 text-center bg-slate-50 border-slate-200">
          <p className="text-slate-600">אין נציגים במשרד זה עדיין</p>
        </Card>
      )}
    </div>
  );
}
