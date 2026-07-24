import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function MK121Threshold() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-right" dir="rtl">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between flex-row-reverse">
          <Button variant="ghost" onClick={() => setLocation("/mk121")} className="flex items-center gap-2 justify-end">
            חזרה לח"כ 121
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">רף ההשתתפות בח"כ 121</h1>
          <div className="w-28" />
        </div>
      </header>

      <main className="container py-8">
        <Card className="mx-auto max-w-3xl p-6 bg-white border-blue-200">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">למה 40,000 קולות?</h2>
          <p className="mb-4 leading-7 text-slate-700">
            רף ההשתתפות נועד להבטיח שהצבעתו של ח"כ 121 כאצבע הצבעה נוספת במליאה תתבסס על השתתפות
            ציבורית רחבה ומשמעותית.
          </p>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-sm font-bold text-blue-700">רף ההשתתפות</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              לפחות 40,000 אזרחים בהצבעה הציבורית
            </p>
          </div>
          <p className="mt-4 leading-7 text-slate-700">
            כאשר הרף מתקיים, הצבעתו של ח"כ 121 תיקבע בהתאם להכרעת הציבור ותתווסף להצבעה במליאת
            הכנסת.
          </p>
        </Card>
      </main>
    </div>
  );
}
