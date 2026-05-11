import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Vote, Target } from "lucide-react";

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Queries
  const ministriesQuery = trpc.governance.ministries.list.useQuery();
  const ministryStatsQuery = (trpc.governance.ministryDetails as any).useQuery();

  const ministries = Array.isArray(ministriesQuery.data) ? ministriesQuery.data : [];
  const ministryStats = Array.isArray(ministryStatsQuery.data) ? ministryStatsQuery.data : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">נדרש התחברות</h1>
          <p className="text-slate-600 mb-6">עליך להתחבר כדי לראות ניתוח</p>
          <Button onClick={() => setLocation("/governance")} className="w-full">
            חזור לממשל
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate voting statistics
  const totalMinistries = ministries.length;
  const totalDecisions = ministryStats.reduce((sum: number, m: any) => sum + (m.totalDecisions || 0), 0);
  const approvedDecisions = ministryStats.reduce((sum: number, m: any) => sum + (m.approvedDecisions || 0), 0);
  const rejectedDecisions = ministryStats.reduce((sum: number, m: any) => sum + (m.rejectedDecisions || 0), 0);
  const pendingDecisions = ministryStats.reduce((sum: number, m: any) => sum + (m.pendingDecisions || 0), 0);

  // Prepare data for charts
  const ministryChartData = ministryStats.map((m: any) => ({
    name: m.ministryName,
    approved: m.approvedDecisions || 0,
    rejected: m.rejectedDecisions || 0,
    pending: m.pendingDecisions || 0,
  }));

  const approvalRateData = ministryStats.map((m: any) => ({
    name: m.ministryName.substring(0, 8),
    rate: Math.round(m.approvalRate || 0),
  }));

  const decisionStatusData = [
    { name: "אושרו", value: approvedDecisions, fill: "#10b981" },
    { name: "דחויו", value: rejectedDecisions, fill: "#ef4444" },
    { name: "בהצבעה", value: pendingDecisions, fill: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 ניתוח הצבעות</h1>
            <p className="text-slate-600">סטטיסטיקות וטרנדים של ההצבעות בממשל</p>
          </div>
          <Button
            onClick={() => setLocation("/governance")}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← חזור לממשל
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">סך הכל משרדים</p>
                <p className="text-3xl font-bold text-blue-900">{totalMinistries}</p>
              </div>
              <Target className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">הצעות אושרו</p>
                <p className="text-3xl font-bold text-green-900">{approvedDecisions}</p>
              </div>
              <Vote className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">הצעות דחויו</p>
                <p className="text-3xl font-bold text-red-900">{rejectedDecisions}</p>
              </div>
              <Users className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">בהצבעה כעת</p>
                <p className="text-3xl font-bold text-amber-900">{pendingDecisions}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ministry Decisions Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">הצעות לפי משרד</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ministryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#10b981" name="אושרו" />
                <Bar dataKey="rejected" fill="#ef4444" name="דחויו" />
                <Bar dataKey="pending" fill="#f59e0b" name="בהצבעה" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Decision Status Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">סטטוס הצעות כללי</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={decisionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {decisionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Approval Rate Chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">שיעור אישור לפי משרד</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={approvalRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                name="שיעור אישור (%)"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Ministry Details Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">פרטים לפי משרד</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">משרד</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">סך הכל</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">אושרו</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">דחויו</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">בהצבעה</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">שיעור אישור</th>
                </tr>
              </thead>
              <tbody>
                {ministryStats.map((stat: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 font-medium">{stat.ministryName}</td>
                    <td className="py-3 px-4 text-slate-600">{stat.totalDecisions}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-800">{stat.approvedDecisions}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-red-100 text-red-800">{stat.rejectedDecisions}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-amber-100 text-amber-800">{stat.pendingDecisions}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {Math.round(stat.approvalRate || 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
