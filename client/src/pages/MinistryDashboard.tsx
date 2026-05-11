import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MinistryDashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistryId, setSelectedMinistryId] = useState<number | null>(null);

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const statsQuery = trpc.analytics.ministry.stats.useQuery(
    { ministryId: selectedMinistryId || 1 },
    { enabled: !!selectedMinistryId }
  );
  const decisionsQuery = trpc.analytics.ministry.decisions.useQuery(
    { ministryId: selectedMinistryId || 1 },
    { enabled: !!selectedMinistryId }
  );
  const trendsQuery = trpc.analytics.ministry.trends.useQuery(
    { ministryId: selectedMinistryId || 1 },
    { enabled: !!selectedMinistryId }
  );

  const ministries = ministriesQuery.data || [];
  const stats = statsQuery.data;
  const decisions = decisionsQuery.data || [];
  const trends = trendsQuery.data || [];

  // Initialize first ministry on load
  useEffect(() => {
    if (!selectedMinistryId && ministries.length > 0) {
      setSelectedMinistryId(ministries[0].id);
    }
  }, [ministries, selectedMinistryId]);

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
          <h1 className="text-3xl font-bold text-slate-900">📊 לוח בקרה משרדי</h1>
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
        {stats ? (
          <>
            {/* Ministry Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl">{ministries.find((m) => m.id === selectedMinistryId)?.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{stats.ministryName}</h2>
                  <p className="text-slate-600">{stats.totalDecisions} החלטות בסך הכל</p>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">החלטות מאושרות</p>
                    <p className="text-3xl font-bold text-green-900">{stats.approvedDecisions}</p>
                    <p className="text-xs text-green-700 mt-1">{stats.approvalRate.toFixed(1)}% שיעור אישור</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">החלטות שנדחו</p>
                    <p className="text-3xl font-bold text-red-900">{stats.rejectedDecisions}</p>
                    <p className="text-xs text-red-700 mt-1">{stats.rejectionRate.toFixed(1)}% שיעור דחייה</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">החלטות בהצבעה</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.pendingDecisions}</p>
                    <p className="text-xs text-blue-700 mt-1">ממתינות לסיום הצבעה</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-400" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">ממוצע קולות</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.averageVotesFor.toFixed(0)} / {stats.averageVotesAgainst.toFixed(0)}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">בעד / נגד</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Approval Rate Pie Chart */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">התפלגות החלטות</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "מאושרות", value: stats.approvedDecisions },
                        { name: "שנדחו", value: stats.rejectedDecisions },
                        { name: "בהצבעה", value: stats.pendingDecisions },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Trends Chart */}
              {trends.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">מגמת שיעור אישור</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="approvalRate"
                        stroke="#10b981"
                        name="שיעור אישור"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>

            {/* Most Voted Decision */}
            {stats.mostVotedDecision && (
              <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">🔥 החלטה הכי מדובקת</h3>
                <p className="text-slate-700 font-medium">{stats.mostVotedDecision.title}</p>
                <p className="text-sm text-slate-600 mt-1">{stats.mostVotedDecision.totalVotes} קולות בסך הכל</p>
              </Card>
            )}

            {/* Decisions History */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">היסטוריית החלטות</h3>
              <div className="space-y-3">
                {decisions.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">אין החלטות עדיין</p>
                ) : (
                  decisions.map((decision) => (
                    <div key={decision.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{decision.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{decision.description}</p>
                        </div>
                        <Badge
                          className={
                            decision.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : decision.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {decision.status === "approved"
                            ? "✓ מאושרת"
                            : decision.status === "rejected"
                              ? "✗ נדחתה"
                              : "⏳ בהצבעה"}
                        </Badge>
                      </div>

                      {/* Vote Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-slate-600 font-medium">בעד</p>
                          <p className="text-lg font-bold text-green-600">{decision.votesFor}</p>
                          <p className="text-xs text-slate-600">{decision.approvalPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">נגד</p>
                          <p className="text-lg font-bold text-red-600">{decision.votesAgainst}</p>
                          <p className="text-xs text-slate-600">{decision.rejectionPercentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">סה״כ קולות</p>
                          <p className="text-lg font-bold text-slate-900">{decision.totalVotes}</p>
                          <p className="text-xs text-slate-600">{decision.category}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">טוען נתונים...</p>
          </div>
        )}
      </main>
    </div>
  );
}
