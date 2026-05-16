import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Lock, Eye, Users, Shield, Zap, ArrowRight, Megaphone, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-cyan-50" dir="rtl">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container flex items-center justify-between py-4">
          <nav className="hidden md:flex items-center gap-8">
            <a href="#channels" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">הערוצים</a>
            <a href="#vision" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">החזון</a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">תכונות</a>
            <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">שאלות נפוצות</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">קול משותף</h1>
              <p className="text-xs text-cyan-600 font-medium">מערכת דמוקרטית מתקדמת</p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button onClick={goToMK121Top} className="bg-purple-600 hover:bg-purple-700">
                ח"כ 121
              </Button>
              <Button onClick={goToGovernanceTop} variant="outline" className="border-blue-300">
                ממשלה משתפת
              </Button>
              <Button onClick={() => setLocation("/analytics")} variant="outline" className="border-green-300">
                📊 ניתוח
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden">
        <img
          src="/assets/decentralization-hero.png"
          alt="חברה מודעת ומחוברת לוקחים חלק בממשלות ובתהליך קבלת ההחלטות בישראל"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/90 via-white/45 to-transparent" />
        <div className="relative container min-h-[calc(100vh-73px)] py-10 flex items-end justify-center">
          <div className="w-full max-w-3xl text-center">
            <div className="flex flex-col sm:flex-row-reverse gap-3 justify-center">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white" onClick={goToMK121Top}>
                ח"כ 121 - ערוץ לכנסת
              </Button>
              <Button size="lg" variant="outline" className="bg-white/85 border-blue-300 text-blue-900 hover:bg-white" onClick={goToGovernanceTop}>
                ממשלה משתפת - ערוץ לממשלה
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Two Channels Section */}
      <section id="channels" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16 text-right">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">שני ערוצי שיתוף מעשיים</h2>
            <p className="text-lg text-gray-600">כל אזרח מחזיק בקול אחד בכל ערוץ - להצביע בעצמו או להאציל לאזרח אחר</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* MK 121 Channel */}
            <Card className="p-8 border-2 border-purple-200 hover:border-purple-400 transition text-right">
              <div className="flex items-center gap-3 mb-6 justify-end">
                <h3 className="text-2xl font-bold text-purple-900">ח"כ 121</h3>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                ערוץ אזרחי לכנסת - הציבור בוחר כל 3 חודשים את הצעת החוק והשאילתא הדחופה ביותר לקידום ציבורי
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">הצבעה כל 3 חודשים</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">בחירת הצעת חוק + שאילתא</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">האצלת קול גמישה</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
              </div>
              <Button 
                onClick={goToMK121Top}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                כנס לח"כ 121
              </Button>
            </Card>

            {/* Dynamic Civic Voice Channel */}
            <Card className="p-8 border-2 border-blue-200 hover:border-blue-400 transition text-right">
              <div className="flex items-center gap-3 mb-6 justify-end">
                <h3 className="text-2xl font-bold text-blue-900">ממשלה משתפת</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                ערוץ אזרחי למשרדי ממשלה - השר מחויב לשמוע את עמדת הציבור לפני החלטות משמעותיות בתחום משרדו
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">הצבעה יומית על החלטות</span>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">כוח מחייב אזרחי</span>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">שקיפות מלאה של תהליך</span>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                </div>
              </div>
              <Button 
                onClick={goToGovernanceTop}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                כנס לממשלה משתפת
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-right">
            <h2 className="text-4xl font-bold text-blue-900 mb-8">הקדמת המפתח</h2>
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold">
              <span className="text-blue-900 font-extrabold">קול הציבור</span> - מערכת שמכוונת להיות תוסף מהפכני למערכת הפוליטית הקיימת.
            </p>
            <p className="mt-4 text-xl text-gray-700 leading-relaxed font-semibold">
              תוסף זה רוצה לקבל תמיכה גורפת מכלל הציבור ונבחריו.
            </p>
            <p className="mt-3 text-lg text-gray-700 leading-relaxed">
              זהו תוסף שכל מי שטובת המדינה בראש מעייניו אמור להיות מסוגל לתמוך בו.
            </p>
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold">
              "לא מחליפים את הממשל ביום אחד — מחברים אותו בהדרגה לקול משותף חי, דינמי ומבוזר."
            </p>
            <p className="text-lg text-gray-600 mt-8 leading-relaxed">
              מערכת זו מציעה שתי דרכים מעשיות לשיתוף אזרחים בקבלת החלטות ממשלתיות, תוך שמירה על יציבות המערכת הפוליטית והמשפטית הקיימת. כל אזרח מחזיק בקול אחד בכל ערוץ, ויכול להצביע בעצמו או להאציל את קולו לאזרח אחר שהוא סומך עליו.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center text-right">תכונות מרכזיות</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">אבטחה מלאה</h3>
              <p className="text-gray-600">
                כל קול מוגן בהצפנה חזקה ובטכנולוגיית בלוקציין לאימות ושקיפות מלאה
              </p>
            </Card>

            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <Eye className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">שקיפות מלאה</h3>
              <p className="text-gray-600">
                כל החלטה, כל הצבעה, וכל תוצאה נחשפות לציבור בזמן אמת
              </p>
            </Card>

            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">כוח אזרחי</h3>
              <p className="text-gray-600">
                כל אזרח יכול להשפיע ישירות או להאציל את קולו
              </p>
            </Card>

            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">אנונימיות מלאה</h3>
              <p className="text-gray-600">
                הקול של כל אזרח נשמר בסוד מלא - אף אחד לא יודע איך הצבעת
              </p>
            </Card>

            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">דינמיקה חיה</h3>
              <p className="text-gray-600">
                המערכת מתגיבה בזמן אמת לקול הציבור - לא מדי פעם, אלא כל הזמן
              </p>
            </Card>

            <Card className="p-6 text-right">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 ml-auto">
                <ArrowRight className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">התקדמות הדרגתית</h3>
              <p className="text-gray-600">
                מערכת זו מחברת את הממשל לקול הציבור בהדרגה, ללא שינוי דרמטי
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center text-right">שאלות נפוצות</h2>
          
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
                    <span className="font-bold text-purple-800">ח"כ 121</span> הוא ערוץ לכנסת: הצעות חוק ושאילתות.
                    <br />
                    <span className="font-bold text-blue-800">ממשלה משתפת</span> היא ערוץ למשרדי הממשלה: הצבעות על החלטות שרים.
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
      <section className="py-20 bg-white">
        <div className="container max-w-4xl text-right" dir="rtl">
          <Card className="p-8 bg-purple-50 border-purple-100">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">אפילוג</h2>
            <div className="space-y-4 text-lg leading-9 text-slate-700">
              <p>
                הפרויקט הוא שירת הברבור של הדמוקרטיה הנוכחית. אנחנו הדור האחרון: דור שמבין
                שהוא עומד על סף שינוי עמוק, ולכן בוחר להפוך את שנותיו של כוח והשפעה
                למהלך של תיקון, אחריות והורשה לדורות הבאים.
              </p>
              <p>
                האצלת קול אינה ויתור על הקול. היא דרך לראות את האחריות עוברת בצורה גלויה:
                מי מחזיק בקול עכשיו, בשם מה הוא מחזיק בו, ומתי אני בוחר להחזיר אותו אלי.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">מוכן להשתתף?</h2>
          <div className="mx-auto mb-8 space-y-4 text-lg leading-9 text-blue-50" dir="rtl">
            <p>
              <span className="font-bold text-white">קול משותף</span> היא יוזמה לשדרוג המערכת הפוליטית בישראל למערכת מתקדמת, גמישה, שקופה ומשתפת יותר - כזו שמחברת את הציבור לתהליך קבלת ההחלטות באופן רציף, ישיר ודינמי.
            </p>
            <p>
              מתוך היוזמה הזאת עולה ההצעה לייסד את <span className="font-bold text-white">קול משותף</span> כישות פוליטית וכמפלגה מאחדת: מפלגה שאינה נבנית סביב מחנה אחד, אדם אחד או אידיאולוגיה מפלגת, אלא סביב מנגנון חדש של אחריות משותפת, השתתפות אזרחית והחזרת הכוח הציבורי אל הציבור עצמו.
            </p>
            <div className="mt-8 rounded-lg border border-white/25 bg-white/10 p-5 text-right">
              <h3 className="mb-3 text-2xl font-bold text-white">מד החברים</h3>
              <p>
                מד החברים סופר נרשמים - ומשמש מדד למצביעים פוטנציאליים.
              </p>
              <p>
                כל אדם שנרשם באתר נספר פעם אחת כחלק מהגרעין המייסד של קול משותף. מספר הנרשמים ישמש אותנו כאומדן לכוח הציבורי האפשרי של המפלגה, אך אינו מהווה סקר, תחזית או הבטחת הצבעה בפועל.
              </p>
              <p className="font-bold text-white">
                כאשר המד יגיע ל-180,000 נרשמים, נראה בכך בסיס ציבורי מספיק לפתיחת תהליך הקמת קול משותף כמפלגה רשמית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Candidate Contract Section */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-5xl text-right" dir="rtl">
          <Card className="border-slate-200 bg-white p-8">
            <p className="mb-3 text-sm font-bold text-blue-700">חוזה ציבורי</p>
            <h2 className="mb-4 text-3xl font-bold text-blue-900">חוזה בין המועמדים לכנסת הבאה לבין הציבור - לנצח</h2>
            <p className="mb-5 text-lg leading-8 text-slate-700">
              מועמד שחותם על החוזה מתחייב כי אם ייבחר לכנסת, יצביע בעד הצעת החוק שתסדיר את הקמת מנגנון קול משותף - לא יאוחר משנה ממועד הבחירות.
            </p>
            <p className="mb-6 rounded-lg border-r-4 border-blue-600 bg-blue-50 p-4 text-xl font-bold leading-8 text-blue-950">
              נבחרת בזכות הציבור - התחייב לקדם את החוק שמחזיר את הכוח לציבור.
            </p>

            <details className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <summary className="cursor-pointer text-lg font-bold text-slate-900">הצג את נוסח החוזה המלא</summary>
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
                    התחייבות זו תחול על הצעת חוק שתונח בפני הכנסת <span className="font-bold">לא יאוחר משנה אחת ממועד הבחירות</span>.
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
                    מי שמבקש את קול הציבור - מתחייב לפעול להשבת קולו של הציבור אל תהליך קבלת ההחלטות.
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

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-12">
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
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 קול משותף. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
