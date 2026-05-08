import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelegationChainVisualization } from "@/components/DelegationChainVisualization";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, BarChart3, Users } from "lucide-react";

const MINISTRIES = [
  { id: 1, name: "אוצר" },
  { id: 2, name: "פנים" },
  { id: 3, name: "ביטחון" },
  { id: 4, name: "משפטים" },
  { id: 5, name: "חדשנות" },
  { id: 6, name: "חוץ" },
  { id: 7, name: "חינוך" },
  { id: 8, name: "בריאות" },
  { id: 9, name: "תרבות" },
];

export default function DelegationAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMinistry, setSelectedMinistry] = useState(MINISTRIES[0]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-slate-600 mb-4">נא להתחבר כדי לצפות בנתונים</p>
            <Button onClick={() => setLocation("/")}>חזור לעמוד הבית</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/governance")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                ניתוח שרשראות האצלה
              </h1>
              <p className="text-blue-100 mt-1">צפייה בנתונים על האצלת קולות ונציגים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Ministry Selector */}
        <Card className="p-6 border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            בחר משרד
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {MINISTRIES.map((ministry: { id: number; name: string }) => (
              <Button
                key={ministry.id}
                variant={selectedMinistry.id === ministry.id ? "default" : "outline"}
                onClick={() => setSelectedMinistry(ministry)}
                className="text-sm"
              >
                {ministry.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Delegation Chain Visualization */}
        <DelegationChainVisualization
          ministryId={selectedMinistry.id}
          ministryName={selectedMinistry.name}
        />

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">מה זה שרשרת האצלה?</h3>
          <p className="text-sm text-blue-800">
            שרשרת האצלה מציגה כמה קולות כל נציג או אזרח מייצג בפועל. כאשר אזרח מאציל את קולו לנציג,
            הנציג מייצג את הקול הזה בהצבעות. הגרפים מציגים את התפלגות האצלת הקולות לכל משרד.
          </p>
        </Card>
      </div>
    </div>
  );
}
