import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Lock, Eye, Users, Shield, Zap, ArrowRight, Megaphone, BarChart3, FileText, BadgeCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [isSignupSubmitting, setSignupSubmitting] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const [isWelcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isContractOpen, setContractOpen] = useState(false);
  const [isPartyContractOpen, setPartyContractOpen] = useState(false);
  const [isMembersOpen, setMembersOpen] = useState(false);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [memberNamesMessage, setMemberNamesMessage] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    note: "",
  });

  useEffect(() => {
    let isMounted = true;

    fetch("/api/member-signups/count")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (isMounted && typeof data?.count === "number") {
          setMemberCount(data.count);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMemberCount(0);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const goToMK121Top = () => {
    setLocation("/mk121");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const goToGovernanceTop = () => {
    setLocation("/governance");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const updateSignupForm = (field: keyof typeof signupForm, value: string) => {
    setSignupForm((current) => ({ ...current, [field]: value }));
  };
  const loadMemberNames = async (open: boolean) => {
    setMembersOpen(open);
    if (!open) return;

    setMemberNamesMessage("");
    try {
      const response = await fetch("/api/member-signups/names");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "טעינת השמות נכשלה");
      }
      setMemberNames(Array.isArray(data.names) ? data.names : []);
    } catch (error) {
      setMemberNamesMessage(error instanceof Error ? error.message : "טעינת השמות נכשלה");
    }
  };
  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupSubmitting(true);
    setSignupMessage("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/member-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "השליחה נכשלה");
      }

      if (typeof data.count === "number") {
        setMemberCount(data.count);
      }

      const countText = data.isNewSignup
        ? `המד עלה ל-${data.count} נרשמים.`
        : `הרשומה עודכנה. המד נשאר על ${data.count} נרשמים.`;
      const emailText = data.emailSent
        ? "מייל ברכה נשלח אליך."
        : "ההרשמה נשמרה, אך מייל הברכה יישלח לאחר חיבור שירות המייל בשרת.";
      setSignupMessage(`${countText} ${emailText}`);
      setWelcomeMessage(`${data.isNewSignup ? "ברוכים הבאים לגרעין המייסד של קול משותף." : "הרשומה שלך עודכנה בהצלחה."} ${countText}`);
      setSignupForm({ fullName: "", nationalId: "", phone: "", email: "", note: "" });
      setSignupOpen(false);
      setWelcomeOpen(true);
      window.setTimeout(() => setWelcomeOpen(false), 4500);
    } catch (error) {
      const timeoutMessage = error instanceof DOMException && error.name === "AbortError"
        ? "ההרשמה נשמרת לאט מדי כרגע. נסה שוב בעוד רגע, או רענן את הדף ובדוק אם המד עלה."
        : "השליחה נכשלה";
      setSignupMessage(error instanceof Error && error.name !== "AbortError" ? error.message : timeoutMessage);
    } finally {
      window.clearTimeout(timeout);
      setSignupSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7ed]" dir="rtl">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-18"
        style={{ backgroundImage: "url('/assets/decentralization-hero-clean.png')" }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(251,247,237,0.86)_0%,rgba(255,255,255,0.78)_34%,rgba(238,246,239,0.78)_68%,rgba(238,246,255,0.82)_100%)]" />
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#fbf7ed]/88 backdrop-blur-md border-b border-[#c8a96a]">
        <div className="container flex items-center justify-between py-4">
          <nav className="hidden md:flex items-center gap-8">
            <a href="#channels" className="text-sm font-medium text-[#4a3722] hover:text-[#1d4f91] transition">הערוצים</a>
            <a href="#vision" className="text-sm font-medium text-[#4a3722] hover:text-[#1d4f91] transition">החזון</a>
            <a href="#features" className="text-sm font-medium text-[#4a3722] hover:text-[#1d4f91] transition">תכונות</a>
            <a href="#faq" className="text-sm font-medium text-[#4a3722] hover:text-[#1d4f91] transition">שאלות נפוצות</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1d4f91] via-[#2f7d5c] to-[#c8a96a] rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">קול משותף</h1>
              <p className="text-xs text-[#2f7d5c] font-medium">מערכת דמוקרטית מתקדמת</p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button onClick={goToMK121Top} className="bg-[#1d4f91] hover:bg-[#173f74]">
                ח"כ 121
              </Button>
              <Button onClick={goToGovernanceTop} variant="outline" className="border-[#2f7d5c] text-[#1d4f91]">
                ממשלה משתפת
              </Button>
              <Button onClick={() => setLocation("/analytics")} variant="outline" className="border-[#c8a96a] text-[#4a3722]">
                📊 ניתוח
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-73px)] overflow-hidden">
        <img
          src="/assets/decentralization-hero-clean.png"
          alt="חברה מודעת ומחוברת לוקחים חלק בממשלות ובתהליך קבלת ההחלטות בישראל"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,247,237,0.78)_0%,rgba(255,255,255,0.32)_35%,rgba(251,247,237,0.12)_68%,rgba(251,247,237,0.92)_100%)]" />
        <div className="relative container min-h-[calc(100vh-73px)] py-10 flex flex-col items-center justify-between">
          <div className="mt-10 w-full max-w-4xl text-center">
            <h2 className="text-4xl font-black text-[#17324d] sm:text-6xl">חברה מודעת ומחוברת</h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl font-semibold leading-8 text-[#17324d] sm:text-2xl">
              לוקחים חלק בממשל ובתהליך קבלת ההחלטות בישראל
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 rounded-lg bg-[#fbf7ed]/75 p-3 backdrop-blur-sm sm:grid-cols-5">
              {[
                { label: "שקיפות", icon: Eye },
                { label: "שיתוף ציבור", icon: Users },
                { label: "מידע פתוח", icon: FileText },
                { label: "אחריות", icon: BadgeCheck },
                { label: "השפעה אמיתית", icon: Zap },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex min-h-24 flex-col items-center justify-center border-l border-[#8a6a3f]/20 px-2 text-[#4b5130] last:border-l-0">
                  <Icon className="mb-2 h-9 w-9 stroke-[1.8]" />
                  <span className="text-sm font-bold sm:text-base">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full max-w-3xl text-center">
            <div className="flex flex-col sm:flex-row-reverse gap-3 justify-center">
              <Button size="lg" className="bg-[#1d4f91] hover:bg-[#173f74] text-white" onClick={goToMK121Top}>
                ח"כ 121 - ערוץ לכנסת
              </Button>
              <Button size="lg" variant="outline" className="bg-[#fbf7ed]/90 border-[#c8a96a] text-[#17324d] hover:bg-white" onClick={goToGovernanceTop}>
                ממשלה משתפת - ערוץ לממשלה
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="relative z-10 py-20 bg-[linear-gradient(120deg,rgba(238,246,255,0.88)_0%,rgba(251,247,237,0.82)_48%,rgba(238,246,239,0.88)_100%)]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-right">
            <h2 className="text-4xl font-bold text-[#17324d] mb-8">הקדמת המפתח</h2>
            <p className="text-2xl text-[#4a3722] leading-relaxed font-semibold">
              <span className="font-bold">קול משותף</span> היא תנועה להנחלת תוסף למערכת הפוליטית הקיימת.
            </p>
            <p className="mt-5 text-xl text-[#4a3722] leading-relaxed font-semibold">
              קול משותף מבקש להיות שער חמישים אזרחי: לאחר ריבוי קולות, דעות ושברים - נפתח שער של בינה ציבורית, שבו הקול הפרטי אינו נמחק אלא מצטרף לתורה משותפת של אחריות, שקיפות ומשילות.
            </p>
            <p className="mt-3 text-lg text-[#4a3722] leading-relaxed">
              למעלה מזה, תנועת קול משותף מציעה למועמדים לכנסת הבאה את הזכות להצטרף לתומכיה,
              ומזמינה אותם להתחייב לפעול להקמת ערוץ השיתוף שלנו, בהיבחרם.
            </p>
            <p className="text-2xl text-[#4a3722] leading-relaxed font-semibold">
              "לא מחליפים את הממשל אלא מחברים אותו."
            </p>
          </div>
        </div>
      </section>

      {/* Two Channels Section */}
      <section id="channels" className="relative z-10 py-20 bg-[linear-gradient(180deg,rgba(251,247,237,0.9)_0%,rgba(255,255,255,0.82)_48%,rgba(238,246,239,0.9)_100%)]">
        <div className="container">
          <div className="mb-16 text-right">
            <h2 className="text-4xl font-bold text-[#17324d] mb-4">שני ערוצי שיתוף מעשיים</h2>
            <div className="mx-auto mt-4 max-w-4xl space-y-4 text-lg leading-8 text-[#5f513e]">
              <p className="font-bold text-[#17324d]">
                קול משותף מקדמת שני ערוצי מעורבות משלימים לחיבור הציבור לעבודת השלטון:
              </p>
              <p>
                <span className="font-bold text-[#17324d]">ערוץ מעורבות בכנסת</span> - מנגנון ציבורי להעלאה, דירוג וקידום של הצעות חוק אזרחיות מול חברי הכנסת.
              </p>
              <p>
                <span className="font-bold text-[#17324d]">ממשלה משתפת</span> - מנגנון שיחבר את הציבור למשרדי הממשלה, באמצעות שאילתות ציבוריות לשרים, ועירוב אזרחים בהחלטות עקרוניות בכל משרד ממשלתי.
              </p>
              <p>
                כך ניתן להפוך את האכפתיות, החדשנות וריבוי הדעות של החברה הישראלית לכוח דמוקרטי מסודר: לא רק הצבעה אחת לכמה שנים, אלא מעורבות שוטפת, שקופה ואחראית בין בחירות.
              </p>
              <p>
                כל אזרח מחזיק בקול אחד בכל ערוץ - להצביע בעצמו או להאציל קולו לאזרח אחר.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* MK 121 Channel */}
            <Card className="p-8 border-2 border-[#c8a96a] bg-[#fbf7ed]/88 hover:border-[#2f7d5c] transition text-right shadow-md">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-[#eef6ef] rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-[#2f7d5c]" />
                </div>
                <h3 className="text-2xl font-bold text-[#17324d]">ח"כ 121</h3>
              </div>
              <p className="mb-6 text-right text-lg font-bold leading-8 text-[#17324d]">
                ערוץ אזרחי לכנסת שמחבר בין הציבור לנבחריו אחת לעונה (כל 3 חודשים).
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-[#2f7d5c] flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right text-[#4a3722]">כל 3 חודשים נבחרי הציבור יצביעו ישירות בקריאה ראשונה על הצעת החוק הנבחרת.</span>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-[#2f7d5c] flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right text-[#4a3722]">המצביעים יוכלו לבחור ישירות או להאציל את קולם.</span>
                </div>
              </div>
              <Button 
                onClick={goToMK121Top}
                className="w-full bg-[#1d4f91] hover:bg-[#173f74]"
              >
                כנס לח"כ 121
              </Button>
            </Card>

            {/* Dynamic Civic Voice Channel */}
            <Card className="p-8 border-2 border-[#c7d8df] bg-[#f7fbff]/88 hover:border-[#1d4f91] transition text-right shadow-md">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-[#eef6ff] rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#1d4f91]" />
                </div>
                <h3 className="text-2xl font-bold text-[#17324d]">ממשלה משתפת</h3>
              </div>
              <p className="mb-6 text-right text-lg font-bold leading-8 text-[#17324d]">
                ערוץ אזרחי למשרדי ממשלה - השר מחויב לשמוע את עמדת הציבור לפני החלטות משמעותיות בתחום משרדו
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-[#1d4f91] flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right text-[#4a3722]">שאילתות ציבוריות לשרים</span>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-[#1d4f91] flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right text-[#4a3722]">הצבעה על החלטות עקרוניות במשרדי הממשלה</span>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <CheckCircle2 className="w-5 h-5 text-[#1d4f91] flex-shrink-0 mt-0.5" />
                  <span className="flex-1 text-right text-[#4a3722]">שקיפות מלאה של תהליך</span>
                </div>
              </div>
              <Button 
                onClick={goToGovernanceTop}
                className="w-full bg-[#2f7d5c] hover:bg-[#27684d]"
              >
                כנס לממשלה משתפת
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/78 backdrop-blur-[1px]">
        <div className="container">
          <div className="mx-auto mb-12 max-w-3xl text-right">
            <h2 className="text-4xl font-bold text-[#17324d] mb-4">תכונות מרכזיות</h2>
            <p className="text-lg leading-8 text-[#5f513e]">
              המערכת בנויה כך שהאזרח יכול להשפיע בלי לוותר על פרטיות, אחריות או יציבות.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl divide-y divide-[#c8a96a] border-y border-[#c8a96a] bg-[#fbf7ed]/78 shadow-sm md:grid-cols-3 md:divide-x md:divide-y">
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#2f7d5c]">אמון</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">אבטחת מידע</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">המערכת תיבנה כמערכת מוצפנת על בסיס טכנולוגיית הבלוקצ׳יין.</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#2f7d5c]">אמון</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">שקיפות ניתנת לבדיקה</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">מה הוחלט, מתי, ולפי איזה קול ציבורי.</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#8a6a3f]">השפעה</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">כוח אזרחי רציף</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">דינמיקה חיה של חיבור רציף בין הציבור לנבחריו, למי שרוצים להתקדם משיטת הבחירות המאכזבת.</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#8a6a3f]">השפעה</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">האצלה מודעת</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">להפקיד את הקול, ולהחזיר אותו בכל עת.</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#1d4f91]">התפתחות</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">ישראליות</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">אומת הסטארטאפ, רוח יזמות, בעלי דעה, אחריות וערכים - עם יכולת אמיתית להתפתח למקום חדש.</p>
            </div>
            <div className="p-4 text-right">
              <p className="text-xs font-bold text-[#1d4f91]">התפתחות</p>
              <h3 className="mt-1 text-lg font-bold text-[#17324d]">התפתחות הדרגתית</h3>
              <p className="mt-1 text-sm leading-6 text-[#5f513e]">נוסיף כלים לדמוקרטיה הקיימת במקום לנסות לערער את הקיים.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 bg-[#f8f3e6]/88 backdrop-blur-[1px]">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-right">שאלות נפוצות</h2>
          
          <div className="max-w-2xl mx-auto">
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tab2">על ההצבעה</TabsTrigger>
                <TabsTrigger value="tab1">על המערכת</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tab1" className="space-y-4">
                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">מה ההבדל בין ח"כ 121 לממשלה משתפת?</h3>
                  <p className="text-gray-600 leading-7">
                    <span className="font-bold text-purple-800">ח"כ 121</span> הוא ערוץ לכנסת: הצעות חוק אזרחיות.
                    <br />
                    <span className="font-bold text-blue-800">ממשלה משתפת</span> היא ערוץ למשרדי הממשלה: שאילתות ציבוריות והצבעות על החלטות עקרוניות.
                  </p>
                </Card>

                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">האם זה מחליף את הממשל הקיים?</h3>
                  <p className="text-gray-600">
                    לא. המערכת מחברת את הממשל הקיים לקול משותף בהדרגה. השרים נשארים בתפקידם, אך חייבים לשמוע את הציבור לפני החלטות משמעותיות.
                  </p>
                </Card>

                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">מה קורה כשהציבור מתנגד להחלטה?</h3>
                  <p className="text-gray-600 mb-3">
                    הצבעה ראשונה נפתחת ל-72 שעות לאחר פרסום הצעת ההחלטה. אם הציבור מסרב, השר מגיב ומנמק את עמדתו, ולאחר 72 שעות נפתחת הצבעה נוספת. אם גם בהצבעה השנייה הציבור מסרב, נפתחת הצבעה שלישית. אם בהצבעה השלישית יש סירוב ברוב מוחלט, ההחלטה תיגנז.
                  </p>
                  <p className="text-gray-600 text-sm border-t pt-3">
                    כוח ההתנגדות הציבורית לא נועד לשתק את עבודת המשרד, אלא לחייב הקשבה, הסבר ותיקון לפני קבלת החלטות משמעותיות.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="tab2" className="space-y-4">
                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">איך אני מצביע?</h3>
                  <p className="text-gray-600">
                    אתה מחובר למערכת עם ת.ז. שלך. כשיש הצבעה, אתה יכול להצביע ישירות או להאציל את קולך לאזרח אחר שאתה סומך עליו.
                  </p>
                </Card>

                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">האם הקול שלי נשמר בסוד?</h3>
                  <p className="text-gray-600">
                    כן, בהחלט. הקול שלך מוגן בהצפנה חזקה - אף אחד לא יודע איך הצבעת, רק שהצבעת.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-blue-900 mb-2">אני יכול לשנות את האצלתי?</h3>
                  <p className="text-gray-600">
                    כן, בכל רגע. אתה יכול להחליף את הנציג שלך או להצביע ישירות במקום להאציל.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Epilogue Section */}
      <section className="relative z-10 py-20 bg-white/78 backdrop-blur-[1px]">
        <div className="container max-w-4xl text-right" dir="rtl">
          <Card className="p-8 bg-[#fbf7ed]/92 border-[#d8c79f] shadow-sm">
            <h2 className="text-3xl font-bold text-[#17324d] mb-6">אפילוג</h2>
            <div className="space-y-4 text-lg leading-9 text-[#4a3722]">
              <p>
                קול משותף מבקשת לתקן את המערכת הפוליטית בצורתה הנוכחית,
                ולחבר אותה לצורתה העתידית - שקופה ומשתפת.
              </p>
              <p>
                לכן הצעד המעשי הבא הוא חוזה ציבורי ברור: מועמדים לכנסת שיבקשו את אמון הציבור
                יוזמנו להתחייב מראש לפעול להקמת מנגנון קול משותף ולהצביע בעד שיתופו.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Public Candidate Contract Section */}
      <section className="relative z-10 py-20 bg-[#fbf7ed]/90 backdrop-blur-[1px]">
        <div className="container max-w-5xl text-right" dir="rtl">
          <Card className="border-[#d8c79f] bg-white p-8 shadow-sm">
            <p className="mb-3 text-sm font-bold text-[#2f7d5c]">חוזה ציבורי</p>
            <h2 className="mb-4 text-3xl font-bold text-[#17324d]">חוזה בין המועמדים לכנסת הבאה לבין הציבור</h2>
            <p className="mb-5 text-lg leading-8 text-slate-700">
              מועמד שחותם על החוזה מתחייב כי אם ייבחר לכנסת, יצביע בעד הצעת החוק שתסדיר את הקמת מנגנון קול משותף בכנסת הבאה.
            </p>
            <p className="mb-6 rounded-lg border-r-4 border-[#2f7d5c] bg-[#eef6ef] p-4 text-xl font-bold leading-8 text-[#17324d]">
              ח"כ עתידי יקר - נבחרת בזכות אמון הציבור, האם תתחייב להצביע בעד שיתופו?
            </p>

            <details
              className="rounded-lg border border-[#d8c79f] bg-[#fbf7ed] p-5"
              onToggle={(event) => setContractOpen(event.currentTarget.open)}
            >
              <summary className="cursor-pointer text-lg font-bold text-slate-900">
                {isContractOpen ? "הסתר את הנוסח המלא של החוזה" : "הצג את נוסח החוזה המלא"}
              </summary>
              <div className="mt-6 space-y-6 leading-8 text-slate-700">
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900">חוזה ציבורי בין מועמד/ת לכנסת לבין ציבור הבוחרים</h3>
                  <p>
                    אני, החתום/ה מטה, כמועמד/ת לבחירות לכנסת ישראל, מצהיר/ה בזאת כי אני מכיר/ה בכך שהמנדט הציבורי אינו רכוש אישי, מפלגתי או סיעתי בלבד, אלא שליחות הניתנת לי מאת ציבור הבוחרים.
                  </p>
                  <p className="mt-3">
                    מתוך הכרה זו, אני מתחייב/ת לפעול לקידום עקרונות של דמוקרטיה מתקדמת, שקיפות, אחריות ציבורית, שיתוף אזרחי והחזרת כוח ההשפעה אל הציבור.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">התחייבות מרכזית</h4>
                  <p>
                    אם אבחר לכנסת, אני מתחייב/ת להצביע בעד הצעת חוק שתסדיר את הקמת מנגנון <span className="font-bold">קול משותף</span> - מנגנון ציבורי, שקוף, ישיר, דינמי ומואצל, שיאפשר לציבור להשתתף באופן רציף ומשמעותי בתהליך קבלת ההחלטות.
                  </p>
                  <p className="mt-3">
                    התחייבות זו תחול על הצעת חוק שתונח בפני <span className="font-bold">הכנסת הבאה</span>.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">מהות ההתחייבות</h4>
                  <p>
                    אני מתחייב/ת כי לא אתייחס להצעת החוק כאל עניין טכני או הצהרתי בלבד, אלא כאל התחייבות ציבורית מהותית שניתנה מראש לבוחרים.
                  </p>
                  <p className="mt-3">
                    במסגרת זו, אפעל בתום לב, בשקיפות ובאחריות כדי לאפשר את קידום ההצעה, דיון ציבורי בה, והצבעה עליה במסגרת הכנסת.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">התחייבויות משלימות</h4>
                  <ol className="list-decimal space-y-2 pr-6">
                    <li>לפרסם לציבור את עמדתי בנושאים מהותיים לפני הצבעות מרכזיות.</li>
                    <li>לנמק החלטות והצבעות בעלות חשיבות ציבורית.</li>
                    <li>לאפשר התייעצות ציבורית באמצעות מנגנונים פתוחים, ישירים או מואצלים.</li>
                    <li>לפעול לחיזוק אמון הציבור בנבחריו באמצעות שקיפות, אחריות והקשבה רציפה.</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">גבולות ההתחייבות</h4>
                  <p>
                    ידוע לי כי כהונתי כחבר/ת כנסת כפופה לדין, לחוקי מדינת ישראל, לכללי האתיקה של הכנסת, ולחובותיי כנבחר/ת ציבור.
                  </p>
                  <p className="mt-3">
                    אין בהתחייבות זו כדי לחייב פעולה בלתי חוקית, פגיעה בזכויות יסוד, או פעולה הסותרת במובהק את טובת הציבור ואת עקרונות היסוד של מדינת ישראל כמדינה יהודית ודמוקרטית.
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">הצהרה ציבורית</h4>
                  <p>אני מבין/ה כי חתימתי על חוזה זה היא התחייבות ציבורית גלויה כלפי הבוחרים.</p>
                  <p className="mt-3 font-bold text-slate-900">
                    מי שמבקש את <span className="font-bold">קול משותף</span> - מתחייב לפעול להשבת קולו של הציבור אל תהליך קבלת ההחלטות.
                  </p>
                </div>

                <div className="grid gap-3 rounded-lg bg-white p-4 text-sm text-slate-700 md:grid-cols-2">
                  <p>שם המועמד/ת: ____________</p>
                  <p>מספר זהות: ____________</p>
                  <p>מפלגה / רשימה: ____________</p>
                  <p>תאריך: ____________</p>
                  <p>חתימה: ____________</p>
                </div>
              </div>
            </details>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              נוסח זה הוא בסיס רעיוני-ציבורי, ויעבור התאמה משפטית לפני שימוש רשמי מול מועמדים.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-[linear-gradient(120deg,rgba(23,50,77,0.96)_0%,rgba(29,79,145,0.94)_38%,rgba(47,125,92,0.94)_70%,rgba(138,106,63,0.96)_100%)]">
        <div className="container max-w-4xl text-right" dir="rtl">
          <h2 className="text-4xl font-bold text-white mb-6">מוכן להשתתף?</h2>
          <div className="mx-auto mb-8 space-y-4 text-lg leading-9 text-blue-50" dir="rtl">
            <p>
              <span className="font-bold text-white">קול משותף</span> היא יוזמה לשדרוג המערכת הפוליטית בישראל למערכת מתקדמת, גמישה, שקופה ומשתפת יותר - כזו שמחברת את הציבור לתהליך קבלת ההחלטות באופן רציף, ישיר ודינמי.
            </p>
            <p>
              מתוך היוזמה הזאת עולה ההצעה לייסד את <span className="font-bold text-white">קול משותף</span> כישות פוליטית וכמפלגה מאחדת: מפלגה שאינה נבנית סביב מחנה אחד, אדם אחד או אידיאולוגיה מפלגת, אלא סביב מנגנון חדש של אחריות משותפת, השתתפות אזרחית והחזרת הכוח הציבורי אל הציבור עצמו.
            </p>
            <p>
              אם וכאשר <span className="font-bold text-white">קול משותף</span> אכן תהיה מפלגה, זו תהיה מפלגה הפועלת בדמוקרטיה ישירה בלבד - כאשר מצביעיה הם למעשה חבריה. חברי הכנסת מטעמה יהיו נציגי המפלגה, ימלאו את תפקידם בשם המפלגה ויפעלו לפי ההוראות שיתקבלו ממערכת ההצבעות המפלגתית.
            </p>
            <Dialog open={isPartyContractOpen} onOpenChange={setPartyContractOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/35 bg-white/10 px-6 text-white hover:bg-white hover:text-[#17324d]">
                  חוזה מפלגת קול משותף
                </Button>
              </DialogTrigger>
              <DialogContent className="text-right sm:max-w-2xl" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="text-2xl text-[#17324d]">חוזה מפלגת קול משותף</DialogTitle>
                  <DialogDescription>
                    טיוטת עקרון פעולה למפלגה שתפעל באמצעות מערכת הצבעות דמוקרטית, שקופה ומחייבת.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-2 leading-8 text-slate-700">
                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">עיקרון יסוד</h4>
                    <p>
                      קול משותף, אם וכאשר תוקם כמפלגה, תהיה מפלגה שמחויבת לפעול באמצעות מנגנון הצבעה דמוקרטי, שקוף, מתועד ומחייב. הכוח הפוליטי של המפלגה אינו נמסר לנבחריה באופן חופשי ובלתי מוגבל, אלא מופעל באמצעות רצון חברי המפלגה כפי שהוא מתבטא במערכת ההצבעות של קול משותף.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">חברות והצבעה</h4>
                    <p>
                      מצביעי קול משותף הם למעשה חברי המפלגה הפעילים. לכל חבר/ה קול אחד בכל הצבעה. ההשתתפות יכולה להיות ישירה או מואצלת, בהתאם לכללים שייקבעו במערכת: החבר רשאי להצביע בעצמו, להאציל את קולו לאדם אחר או למומחה, ולהחזיר אליו את קולו בכל עת.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">מחויבות נציגי המפלגה</h4>
                    <p>
                      כל חבר/ת כנסת מטעם קול משותף מתחייב/ת מראש לפעול בכנסת לפי הכרעות מערכת ההצבעות המפלגתית. כאשר מתקיימת הצבעה תקפה במערכת, נציגי המפלגה בכנסת יצביעו בהתאם לתוצאה שהתקבלה.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">מבנה ההצבעה המחייב</h4>
                    <ol className="list-decimal space-y-1 pr-6">
                      <li>פרסום ברור של הנושא להצבעה.</li>
                      <li>הצגת מידע רקע, השלכות ונימוקים בעד ונגד.</li>
                      <li>פרק זמן סביר לעיון, דיון והצעת תיקונים.</li>
                      <li>הצבעה מאובטחת של חברי המפלגה.</li>
                      <li>פרסום תוצאת ההצבעה, שיעור ההשתתפות ונימוק ההכרעה.</li>
                      <li>תיעוד מלא של ההליך לצורך ביקורת ציבורית.</li>
                    </ol>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">הצבעות בכנסת</h4>
                    <p>
                      בכל הצבעה בכנסת שבה התקבלה הכרעה תקפה במערכת קול משותף, נציגי המפלגה מחויבים להצביע לפי אותה הכרעה. אם לא התקיימה הצבעה תקפה בזמן, או אם מדובר במקרה דחוף שאינו מאפשר הליך מלא, הנציג/ה יפעל/תפעל לפי עקרונות המפלגה, ויפרסם/תפרסם לציבור נימוק מלא בדיעבד.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">גבולות המחויבות</h4>
                    <p>
                      המחויבות למערכת ההצבעות אינה חלה על פעולה בלתי חוקית, פגיעה בזכויות יסוד, הסתה, אפליה פסולה, פגיעה בביטחון המדינה או פעולה הסותרת במובהק את הדין ואת עקרונות היסוד של מדינת ישראל כמדינה יהודית ודמוקרטית.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">שקיפות ובקרה</h4>
                    <p>
                      כל הצבעה מחייבת תלווה בפרסום ציבורי של נוסח ההצעה, תוצאות ההצבעה, שיעור ההשתתפות, מספר הקולות הישירים והמואצלים, וזהות בעלי תפקידים או מומחים שקיבלו האצלות משמעותיות, בכפוף לשמירה על פרטיות המצביעים.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">אבטחת מידע ופרטיות</h4>
                    <p>
                      מערכת ההצבעות תיבנה כך שכל חבר יוכל להצביע פעם אחת בלבד, תוך אימות זהות, שמירה על פרטיות, מניעת זיופים, תיעוד ביקורת והגנה על הנתונים. המערכת תאפשר ביקורת אמינה על התוצאות בלי לחשוף את בחירתו האישית של כל מצביע, אלא אם נקבע אחרת ובהסכמה מפורשת.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">האצלת קול</h4>
                    <p>
                      האצלת קול אינה ויתור על הקול. היא דרך להשתמש בו באופן מודע. כל חבר רשאי לדעת למי האציל את קולו, באילו תחומים, ועל בסיס אילו ערכים או מומחיות. החבר רשאי להחזיר את קולו אליו בכל עת.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">הפרת החוזה</h4>
                    <p>
                      נציג מפלגה שיצביע בניגוד להכרעה מחייבת של מערכת קול משותף יידרש לפרסם נימוק מלא לציבור ולמוסדות המפלגה. הפרה חוזרת או מהותית תיחשב הפרת אמון פוליטית כלפי חברי המפלגה, ותאפשר נקיטת צעדים פנימיים בהתאם לתקנון, לרבות דרישה ציבורית להתפטרות, שלילת תמיכה עתידית או אי-שיבוץ ברשימת המפלגה.
                    </p>
                  </section>

                  <section>
                    <h4 className="mb-2 text-lg font-bold text-[#17324d]">שינוי החוזה</h4>
                    <p>
                      לא ניתן לשנות את עקרון הפעולה המרכזי של קול משותף כמפלגה דמוקרטית ישירה אלא ברוב מיוחד של חברי המפלגה ובהליך שקוף, פומבי וממושך.
                    </p>
                  </section>

                  <p className="rounded-lg bg-[#fbf7ed] p-4 font-bold text-[#17324d]">
                    מי שנבחר מטעם קול משותף אינו מקבל כוח לפעול במקום הציבור, אלא אחריות להפעיל את כוח הציבור כפי שהציבור הכריע במערכת קול משותף.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <div className="mt-10 rounded-lg border border-[#d8c79f] bg-[#fbf7ed]/95 p-6 text-right text-[#17324d] shadow-xl">
              <div className="flex flex-col gap-5 md:flex-row-reverse md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#2f7d5c]">מד החברים</p>
                  <h3 className="mt-1 text-3xl font-bold text-[#17324d]">הגרעין המייסד של קול משותף</h3>
                </div>
                <div className="text-right md:text-left">
                  <Dialog open={isMembersOpen} onOpenChange={loadMemberNames}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-5xl font-black leading-none text-[#1d4f91] underline-offset-4 transition hover:text-[#2f7d5c] hover:underline"
                        aria-label="הצג את שמות המצטרפים"
                      >
                        {memberCount.toLocaleString("he-IL")}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="text-right sm:max-w-lg" dir="rtl">
                      <DialogHeader className="text-right">
                        <DialogTitle className="text-2xl text-[#17324d]">שמות המצטרפים</DialogTitle>
                        <DialogDescription>
                          מוצגים שמות בלבד, ללא פרטי קשר או תעודת זהות.
                        </DialogDescription>
                      </DialogHeader>
                      {memberNamesMessage ? (
                        <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{memberNamesMessage}</p>
                      ) : memberNames.length > 0 ? (
                        <div className="space-y-4">
                          <p className="rounded-md bg-[#fbf7ed] p-3 text-sm font-bold text-[#8a6a3f]">
                            ככל שהמספר שלך קרוב יותר ל-1, כך הקדמת לראות את העתיד.
                          </p>
                          <ul className="max-h-80 space-y-2 overflow-auto pr-5 text-right leading-7 text-slate-700">
                            {memberNames.map((name, index) => (
                              <li key={`${name}-${index}`} className={index === 0 ? "list-disc font-bold text-[#17324d]" : "list-disc"}>
                                {index === 0 ? `מצטרף מספר ${index + 1}: ${name} - החבר הראשון` : `מצטרף מספר ${index + 1}: ${name}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-600">עדיין אין שמות להצגה.</p>
                      )}
                    </DialogContent>
                  </Dialog>
                  <p className="mt-1 text-sm font-bold text-[#5f513e]">מתוך 180,000 נרשמים</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e5d9bf]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#2f7d5c,#1d4f91)] transition-all duration-500"
                  style={{ width: `${Math.min((memberCount / 180000) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-5 space-y-3 text-base leading-8 text-[#4a3722]">
                <p>
                  מד החברים סופר נרשמים - ומשמש מדד למצביעים פוטנציאליים.
                </p>
                <p>
                  כל אדם שנרשם באתר נספר פעם אחת כחלק מהגרעין המייסד של קול משותף. מספר הנרשמים ישמש אותנו כאומדן לכוח הציבורי האפשרי של המפלגה, אך אינו מהווה סקר, תחזית או הבטחת הצבעה בפועל.
                </p>
                <p className="font-bold text-[#17324d]">
                  כאשר המד יגיע ל-180,000 נרשמים, נראה בכך בסיס ציבורי מספיק לפתיחת תהליך הקמת קול משותף כמפלגה רשמית.
                </p>
              </div>
            </div>
            <Dialog open={isSignupOpen} onOpenChange={setSignupOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6 bg-white px-8 text-blue-800 hover:bg-blue-50">
                  הצטרפות לגרעין המייסד
                </Button>
              </DialogTrigger>
              <DialogContent className="text-right sm:max-w-xl" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="text-2xl text-blue-900">טופס הצטרפות לגרעין המייסד</DialogTitle>
                  <DialogDescription>
                    הפרטים נשמרים במערכת ומשמשים לספירת נרשמים פוטנציאליים. אותה תעודת זהות נספרת פעם אחת בלבד, ולאחר השליחה יישלח מייל ברכה.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-full-name">שם מלא</Label>
                      <Input
                        id="signup-full-name"
                        value={signupForm.fullName}
                        onChange={(event) => updateSignupForm("fullName", event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-national-id">תעודת זהות</Label>
                      <Input
                        id="signup-national-id"
                        inputMode="numeric"
                        value={signupForm.nationalId}
                        onChange={(event) => updateSignupForm("nationalId", event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">טלפון (אופציונלי)</Label>
                      <Input
                        id="signup-phone"
                        inputMode="tel"
                        value={signupForm.phone}
                        onChange={(event) => updateSignupForm("phone", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">אימייל</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(event) => updateSignupForm("email", event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-note">הערה (אופציונלי)</Label>
                    <Textarea
                      id="signup-note"
                      value={signupForm.note}
                      onChange={(event) => updateSignupForm("note", event.target.value)}
                      placeholder="אפשר להשאיר ריק"
                    />
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    שליחת הטופס אינה מהווה הצבעה, סקר או התחייבות פוליטית. היא נספרת כהבעת עניין להצטרפות לגרעין המייסד.
                  </p>
                  {signupMessage && (
                    <p className="rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-900">{signupMessage}</p>
                  )}
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isSignupSubmitting}>
                    {isSignupSubmitting ? "שולח..." : "שליחה"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isWelcomeOpen} onOpenChange={setWelcomeOpen}>
              <DialogContent className="text-right sm:max-w-md" dir="rtl">
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl text-blue-900">ברוכים הבאים</DialogTitle>
                    <DialogDescription className="text-base leading-7 text-slate-700">
                      {welcomeMessage}
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-slate-500">החלון ייסגר בעוד רגע.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative z-10 bg-[#17324d] text-[#d8c79f] py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4 whitespace-nowrap">קול משותף - מערכת דמוקרטית מתקדמת לישראל</h4>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">הערוצים</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/mk121" onClick={(event) => { event.preventDefault(); goToMK121Top(); }} className="hover:text-white transition">ח"כ 121</a></li>
                <li><a href="/governance" onClick={(event) => { event.preventDefault(); goToGovernanceTop(); }} className="hover:text-white transition">ממשלה משותפת</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">מידע</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#vision" onClick={(event) => { event.preventDefault(); scrollToSection("vision"); }} className="hover:text-white transition">החזון</a></li>
                <li><a href="#features" onClick={(event) => { event.preventDefault(); scrollToSection("features"); }} className="hover:text-white transition">תכונות</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">עזרה</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" onClick={(event) => { event.preventDefault(); scrollToSection("faq"); }} className="hover:text-white transition">שאלות נפוצות</a></li>
                <li><a href="#contact" onClick={(event) => { event.preventDefault(); scrollToSection("contact"); }} className="hover:text-white transition">צור קשר</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/15 pt-8 text-right text-sm">
            <p>&copy; 2026 קול משותף. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
