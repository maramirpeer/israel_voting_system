import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Vote, TrendingUp, Activity } from "lucide-react";

interface VotingStats {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
  directVotes: number;
  delegatedVotes: number;
  delegationRate: number;
}

interface EngagementMetrics {
  activeUsers: number;
  newUsersThisWeek: number;
  averageVotesPerUser: number;
  mostActiveMinistry: string;
  leastActiveMinistry: string;
}

interface MinistryStats {
  ministryId: number;
  ministryName: string;
  totalDecisions: number;
  approvedDecisions: number;
  rejectedDecisions: number;
  pendingDecisions: number;
  approvalRate: number;
  rejectionRate: number;
  averageVotesFor: number;
  averageVotesAgainst: number;
}

interface ApprovalTrend {
  month: string;
  approvalRate: number;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

export function Analytics() {
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [ministryStats, setMinistryStats] = useState<MinistryStats[]>([]);
  const [approvalTrends, setApprovalTrends] = useState<ApprovalTrend[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<number>(1);

  // Fetch voting stats
  const votingStatsQuery = trpc.governance.analytics.votingStats.useQuery();
  
  // Fetch engagement metrics
  const engagementQuery = trpc.governance.analytics.engagementMetrics.useQuery();
  
  // Fetch ministry stats
  const ministryStatsQuery = trpc.governance.analytics.ministryStats.useQuery();
  
  // Fetch approval trends for selected ministry
  const approvalTrendsQuery = trpc.governance.analytics.approvalTrends.useQuery({ ministryId: selectedMinistry });

  useEffect(() => {
    if (votingStatsQuery.data) {
      setVotingStats(votingStatsQuery.data);
    }
  }, [votingStatsQuery.data]);

  useEffect(() => {
    if (engagementQuery.data) {
      setEngagementMetrics(engagementQuery.data);
    }
  }, [engagementQuery.data]);

  useEffect(() => {
    if (ministryStatsQuery.data) {
      setMinistryStats(ministryStatsQuery.data);
    }
  }, [ministryStatsQuery.data]);

  useEffect(() => {
    if (approvalTrendsQuery.data) {
      setApprovalTrends(approvalTrendsQuery.data);
    }
  }, [approvalTrendsQuery.data]);

  const isLoading = votingStatsQuery.isLoading || engagementQuery.isLoading || ministryStatsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  // Prepare data for pie chart
  const votingMethodData = votingStats
    ? [
        { name: "הצבעה ישירה", value: votingStats.directVotes },
        { name: "הצבעה מועברת", value: votingStats.delegatedVotes },
      ]
    : [];

  // Prepare data for ministry approval chart
  const ministryApprovalData = ministryStats.map((m) => ({
    name: m.ministryName,
    approved: m.approvedDecisions,
    rejected: m.rejectedDecisions,
    pending: m.pendingDecisions,
  }));

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 דוח ניתוח הצבעות</h1>
        <p className="text-gray-600">סטטיסטיקות מלאות על השתתפות ותעוד הצבעות</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">סה"כ מצביעים</p>
              <p className="text-3xl font-bold text-blue-900">{votingStats?.totalVoters || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">סה"כ הצבעות</p>
              <p className="text-3xl font-bold text-green-900">{votingStats?.totalVotes || 0}</p>
            </div>
            <Vote className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">שיעור השתתפות</p>
              <p className="text-3xl font-bold text-purple-900">{votingStats?.participationRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">משתמשים פעילים</p>
              <p className="text-3xl font-bold text-orange-900">{engagementMetrics?.activeUsers || 0}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="voting-methods">שיטות הצבעה</TabsTrigger>
          <TabsTrigger value="ministries">משרדים</TabsTrigger>
          <TabsTrigger value="trends">מגמות</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">📈 מדדי עיסוק</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">משתמשים חדשים השבוע</span>
                  <span className="text-2xl font-bold text-blue-600">{engagementMetrics?.newUsersThisWeek || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">ממוצע הצבעות למשתמש</span>
                  <span className="text-2xl font-bold text-green-600">{engagementMetrics?.averageVotesPerUser || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">משרד פעיל ביותר</span>
                  <span className="text-lg font-semibold text-purple-600">{engagementMetrics?.mostActiveMinistry || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">משרד פעיל פחות</span>
                  <span className="text-lg font-semibold text-orange-600">{engagementMetrics?.leastActiveMinistry || "N/A"}</span>
                </div>
              </div>
            </Card>

            {/* Voting Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🗳️ סטטיסטיקות הצבעה</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">הצבעות ישירות</span>
                  <span className="text-2xl font-bold text-blue-600">{votingStats?.directVotes || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">הצבעות מועברות</span>
                  <span className="text-2xl font-bold text-green-600">{votingStats?.delegatedVotes || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">שיעור הצבעות מועברות</span>
                  <span className="text-2xl font-bold text-purple-600">{votingStats?.delegationRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">שיעור השתתפות כללי</span>
                  <span className="text-2xl font-bold text-orange-600">{votingStats?.participationRate.toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Voting Methods Tab */}
        <TabsContent value="voting-methods" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🔄 התפלגות שיטות הצבעה</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={votingMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {votingMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Ministries Tab */}
        <TabsContent value="ministries" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🏛️ ביצועי משרדים</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ministryApprovalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#10b981" name="אושרו" />
                <Bar dataKey="rejected" fill="#ef4444" name="נדחו" />
                <Bar dataKey="pending" fill="#f59e0b" name="בהמתנה" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Ministry Details Table */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📋 פרטי משרדים</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-right py-2 px-4">שם משרד</th>
                    <th className="text-right py-2 px-4">סה"כ החלטות</th>
                    <th className="text-right py-2 px-4">אושרו</th>
                    <th className="text-right py-2 px-4">נדחו</th>
                    <th className="text-right py-2 px-4">שיעור אישור</th>
                  </tr>
                </thead>
                <tbody>
                  {ministryStats.map((ministry) => (
                    <tr key={ministry.ministryId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{ministry.ministryName}</td>
                      <td className="py-3 px-4">{ministry.totalDecisions}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{ministry.approvedDecisions}</td>
                      <td className="py-3 px-4 text-red-600 font-semibold">{ministry.rejectedDecisions}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {ministry.approvalRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📉 מגמות אישור לפי חודש</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">בחר משרד:</label>
              <select
                value={selectedMinistry}
                onChange={(e) => setSelectedMinistry(Number(e.target.value))}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md"
              >
                {ministryStats.map((ministry) => (
                  <option key={ministry.ministryId} value={ministry.ministryId}>
                    {ministry.ministryName}
                  </option>
                ))}
              </select>
            </div>
            {approvalTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={approvalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approvalRate" stroke="#3b82f6" name="שיעור אישור (%)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">אין נתונים זמינים לתקופה זו</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
