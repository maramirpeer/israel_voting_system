import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

interface ProposalSubmissionFormsProps {
  cycleId: number;
  userId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

const BILL_CATEGORIES = [
  "חינוך",
  "בריאות",
  "סביבה",
  "תחבורה",
  "רווחה",
  "כלכלה",
  "ביטחון",
  "תרבות",
  "אחר",
];

export function ProposalSubmissionForms({
  cycleId,
  userId,
  onSuccess,
  onClose,
}: ProposalSubmissionFormsProps) {
  const [billTitle, setBillTitle] = useState("");
  const [billDescription, setBillDescription] = useState("");
  const [billCategory, setBillCategory] = useState("");

  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [ministryId, setMinistryId] = useState<number | null>(null);
  const [questionTarget, setQuestionTarget] = useState("");
  const [questionTargetValue, setQuestionTargetValue] = useState("");
  const [urgency, setUrgency] = useState("medium");

  // Fetch ministries from database
  const ministriesQuery = trpc.mk121.getMinistriesList.useQuery();
  const ministries = ministriesQuery.data || [];

  const submitBillMutation = trpc.mk121.submitBillProposal.useMutation({
    onSuccess: () => {
      toast.success("הצעת החוק הוגשה בהצלחה!");
      setBillTitle("");
      setBillDescription("");
      setBillCategory("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "שגיאה בהגשת הצעת החוק");
    },
  });

  const submitQuestionMutation = trpc.mk121.submitQuestionProposal.useMutation({
    onSuccess: () => {
      toast.success("השאילתא הוגשה בהצלחה!");
      setQuestionTitle("");
      setQuestionDescription("");
      setMinistryId(null);
      setQuestionTarget("");
      setQuestionTargetValue("");
      setUrgency("medium");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "שגיאה בהגשת השאילתא");
    },
  });

  const handleSubmitBill = () => {
    if (!billTitle.trim() || !billDescription.trim()) {
      toast.error("אנא מלא את כל השדות");
      return;
    }

    submitBillMutation.mutate({
      cycleId,
      title: billTitle,
      description: billDescription,
      category: billCategory || undefined,
      userId,
    });
  };

  const handleSubmitQuestion = () => {
    if (!questionTitle.trim() || !questionDescription.trim()) {
      toast.error("אנא מלא את כל השדות");
      return;
    }

    if (!questionTarget) {
      toast.error("אנא בחר משרד יעד או ראש ממשלה");
      return;
    }

    submitQuestionMutation.mutate({
      cycleId,
      title: questionTitle,
      description: questionDescription,
      targetMinistry: questionTarget,
      urgency: (urgency as "low" | "medium" | "high") || "medium",
      userId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">הגש הצעה חדשה</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="bill" className="w-full">
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger value="bill">📋 הצעת חוק</TabsTrigger>
            </TabsList>

            {/* Bill Proposal Form */}
            <TabsContent value="bill" className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">כותרת ההצעה</label>
                <Input
                  placeholder="כותרת ברורה וקצרה של הצעת החוק"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  maxLength={255}
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-1">{billTitle.length}/255</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">תיאור מפורט</label>
                <Textarea
                  placeholder="תאר את הצעת החוק בפירוט. מה הבעיה? מה הפתרון המוצע?"
                  value={billDescription}
                  onChange={(e) => setBillDescription(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-1">{billDescription.length}/2000</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">קטגוריה</label>
                <Select value={billCategory} onValueChange={setBillCategory}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="בחר קטגוריה (אופציונלי)" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 font-semibold mb-2">
                  📝 דף מקדים{" "}
                  <a href="/mk121#preliminary" className="text-blue-700 underline underline-offset-4">
                    מה זה?
                  </a>
                </p>
                <p className="text-sm text-purple-800 mb-2">
                  ההצעה שלך תתחיל כ<strong>"דף מקדים"</strong> - לא תופיע בעמוד ח"כ 121 עדיין.
                </p>
                <p className="text-sm text-purple-800 mb-2">
                  כדי שההצעה תיפורסם, צריכה להגיע ל<strong>1000 תומכים מינימום</strong>.
                </p>
                <p className="text-sm text-purple-800">
                  אחרי שתגיע ל-1000 תומכים, ההצעה תופיע בעמוד ח"כ 121 לכל אזרח להצבעה.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>טיפ:</strong> הצעות חוק ברורות וממוקדות יקבלו יותר קולות. הקפד על כתיבה מקצועית וברורה.
                </p>
              </div>

              <Button
                onClick={handleSubmitBill}
                disabled={submitBillMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitBillMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    משדר...
                  </>
                ) : (
                  "הגש הצעת חוק"
                )}
              </Button>
            </TabsContent>

            {/* Question Proposal Form */}
            <TabsContent value="question" className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">כותרת השאילתא</label>
                <Input
                  placeholder="כותרת ברורה של השאילתא"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  maxLength={255}
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-1">{questionTitle.length}/255</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">תיאור מפורט</label>
                <Textarea
                  placeholder="תאר את השאילתא בפירוט. מה הנושא? למה זה דחוף?"
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500 mt-1">{questionDescription.length}/2000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    📢 יעד השאילתא
                  </label>
                  <Select 
                    value={questionTargetValue} 
                    onValueChange={(val) => {
                      setQuestionTargetValue(val);
                      if (val === "ראש הממשלה") {
                        setMinistryId(null);
                        setQuestionTarget("ראש הממשלה");
                        return;
                      }
                      const id = parseInt(val);
                      const selectedMinistry = ministries.find((m) => m.id === id);
                      setMinistryId(Number.isFinite(id) ? id : null);
                      setQuestionTarget(selectedMinistry?.name || "");
                    }}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="בחר שר/ה לפי משרד או ראש ממשלה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ראש הממשלה">ראש הממשלה</SelectItem>
                      {ministriesQuery.isLoading ? (
                        <div className="p-2 text-sm text-slate-600">טוען משרדים...</div>
                      ) : ministries.length === 0 ? (
                        <div className="p-2 text-sm text-slate-600">אין משרדים זמינים</div>
                      ) : (
                        ministries.map((ministry) => (
                          <SelectItem key={ministry.id} value={ministry.id.toString()}>
                            {ministry.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {ministryId && (
                    <p className="text-xs text-slate-600 mt-2">
                      {ministries.find(m => m.id === ministryId)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">רמת דחיפות</label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 נמוכה</SelectItem>
                      <SelectItem value="medium">🟡 בינונית</SelectItem>
                      <SelectItem value="high">🔴 גבוהה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 font-semibold mb-2">
                  📝 דף מקדים{" "}
                  <a href="/mk121#preliminary" className="text-blue-700 underline underline-offset-4">
                    מה זה?
                  </a>
                </p>
                <p className="text-sm text-purple-800 mb-2">
                  השאילתא שלך תתחיל כ<strong>"דף מקדים"</strong> - לא תופיע בעמוד ח"כ 121 עדיין.
                </p>
                <p className="text-sm text-purple-800 mb-2">
                  כדי שהשאילתא תיפורסם, צריכה להגיע ל<strong>1000 תומכים מינימום</strong>.
                </p>
                <p className="text-sm text-purple-800">
                  אחרי שתגיע ל-1000 תומכים, השאילתא תופיע בעמוד ח"כ 121 לכל אזרח להצבעה.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  💡 <strong>טיפ:</strong> שאילתות בעלות דחיפות גבוהה וממוקדות על בעיה ספציפית יקבלו יותר תשומת לב.
                </p>
              </div>

              <Button
                onClick={handleSubmitQuestion}
                disabled={submitQuestionMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitQuestionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    משדר...
                  </>
                ) : (
                  "הגש שאילתא"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
