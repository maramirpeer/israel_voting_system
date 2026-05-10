import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Lock, Eye, Users, Shield, Zap, ArrowRight, Megaphone, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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
              <h1 className="text-lg font-bold text-blue-900">קול אזרחי</h1>
              <p className="text-xs text-cyan-600 font-medium">מערכת דמוקרטיה מבוזרת</p>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button onClick={() => setLocation("/mk121")} className="bg-purple-600 hover:bg-purple-700">
                ח"כ 121
              </Button>
              <Button onClick={() => setLocation("/governance")} variant="outline" className="border-blue-300">
                קול דינמי
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 order-2 md:order-1">
              <div className="text-right">
                <h2 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight mb-4">
                  מתחברים <span className="text-cyan-500">ומתקנים</span>
                </h2>

              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setLocation("/mk121")}>
                  ח"כ 121 - ערוץ לכנסת
                </Button>
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50" onClick={() => setLocation("/governance")}>
                  קול דינמי - ערוץ לממשלה
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-blue-900">1</p>
                  <p className="text-sm text-gray-600">קול לכל אזרח</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">✓</p>
                  <p className="text-sm text-gray-600">כוח מחייב אזרחי</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">∞</p>
                  <p className="text-sm text-gray-600">האצלה גמישה</p>
                </div>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <img 
                src="/manus-storage/hero-israel-clean_c99641c5.png"
                alt="ישראל משותפת - יחד מעצבים עתיד טוב לכולם"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
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
                ערוץ אזרחי לכנסת - הציבור בוחר כל 3 חודשים את הצעת החוק והשאילתה הדחופה ביותר לקידום ציבורי
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">הצבעה כל 3 חודשים</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">בחירת הצעת חוק + שאילתה</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <span className="text-gray-700">האצלת קול גמישה</span>
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                </div>
              </div>
              <Button 
                onClick={() => setLocation("/mk121")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                כנס לח"כ 121
              </Button>
            </Card>

            {/* Dynamic Civic Voice Channel */}
            <Card className="p-8 border-2 border-blue-200 hover:border-blue-400 transition text-right">
              <div className="flex items-center gap-3 mb-6 justify-end">
                <h3 className="text-2xl font-bold text-blue-900">קול ציבורי דינמי</h3>
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
                onClick={() => setLocation("/governance")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                כנס לקול דינמי
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Preliminary Stage Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-right">
            <h2 className="text-4xl font-bold text-purple-900 mb-8">דף מקדים - שלב הצבירת תמיכה</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              כל הצעה חדשה (חוק או שאילתה) מתחילה כ<span className="font-bold">"דף מקדים"</span> - זהו שלב ראשוני שבו אזרחים מצביעים על תמיכתם בהצעה.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-right border-2 border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-3">100</div>
                <h3 className="text-lg font-bold text-purple-900 mb-2">תומכים מינימום</h3>
                <p className="text-gray-600 text-sm">
                  כדי שהצעה תעבור לשלב ההצבעה הרשמי, היא צריכה לקבל תמיכה של לפחות 100 אזרחים
                </p>
              </Card>
              
              <Card className="p-6 text-right border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-3">37,500</div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">קולות מינימום</h3>
                <p className="text-gray-600 text-sm">
                  בשלב ההצבעה, הצעה זוכה צריכה קולות של לפחות 1/120 מהמצביעים (בבחירות אמיתיות)
                </p>
              </Card>
              
              <Card className="p-6 text-right border-2 border-cyan-200">
                <div className="text-3xl font-bold text-cyan-600 mb-3">4 שנים</div>
                <h3 className="text-lg font-bold text-cyan-900 mb-2">תוקף הצעה</h3>
                <p className="text-gray-600 text-sm">
                  אם הצעה לא עברה את הרף תוך 4 שנים, היא תיגנז. החלטה סופית בידי הפוליטיקאים
                </p>
              </Card>
            </div>
            
            <div className="bg-white p-8 rounded-xl border-l-4 border-purple-600 text-right">
              <h3 className="text-xl font-bold text-purple-900 mb-4">איך זה עובד?</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">1.</span> אזרח מציע הצעה חדשה</span>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">1</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">2.</span> ההצעה נוצרת כ"דף מקדים" (בשלב צבירת תמיכה)</span>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">2</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">3.</span> אזרחים אחרים תומכים בהצעה (או מבטלים תמיכה)</span>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600 font-bold">3</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">4.</span> כשמגיעים ל-100 תומכים → ההצעה עולה לסדר היום הרשמי</span>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 font-bold">✓</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">5.</span> בשלב ההצבעה, אזרחים מצביעים על ההצעה</span>
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">✓</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">6.</span> אם ההצעה המנצחת עברה את הרף → מיושמת בכנסת/ממשלה</span>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 font-bold">✓</div>
                </li>
                <li className="flex items-start gap-3 justify-end">
                  <span><span className="font-bold">7.</span> אם לא עברה את הרף → עוברת למחזור הבא (3 חודשים)</span>
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 text-yellow-600 font-bold">↻</div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-right">
            <h2 className="text-4xl font-bold text-blue-900 mb-8">משפט החזון</h2>
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold">
              "לא מחליפים את הממשל ביום אחד — מחברים אותו בהדרגה לקול אזרחי חי, דינמי ומבוזר."
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
                כל אזרח מחזיק בקול אחד, ויכול להשפיע ישירות על החלטות ממשלתיות
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
                  <h3 className="font-bold text-blue-900 mb-2">מה ההבדל בין ח"כ 121 לקול דינמי?</h3>
                  <p className="text-gray-600">
                    ח"כ 121 הוא ערוץ לכנסת - אזרחים בוחרים כל 3 חודשים הצעת חוק ושאילתה. קול דינמי הוא ערוץ למשרדי ממשלה - אזרחים מצביעים על החלטות יומיות של השרים.
                  </p>
                </Card>

                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">האם זה מחליף את הממשל הקיים?</h3>
                  <p className="text-gray-600">
                    לא. המערכת מחברת את הממשל הקיים לקול אזרחי בהדרגה. השרים נשארים בתפקידם, אך חייבים לשמוע את הציבור לפני החלטות משמעותיות.
                  </p>
                </Card>

                <Card className="p-6 text-right">
                  <h3 className="font-bold text-blue-900 mb-2">מה קורה כשהציבור מתנגד להחלטה?</h3>
                  <p className="text-gray-600 mb-3">
                    השר מחוייב לנמק את צעדיו ולשכנע את הציבור שיצביע שנית לאחר 72 שעות נוספות. אם הציבור עדיין מתנגד, החלטה לא תעבור.
                  </p>
                  <p className="text-gray-600 text-sm border-t pt-3">
                    כוח ההתנגדות הציבורית לא נועד לשתק את עבודת המשרד, אלא לחייב הקשבה של המשרד הממשלטי. במקרים שבהם קיימת נוכחות של רוב מוחלט בקרב האזרחים.
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
                  <h3 className="font-bold text-blue-900 mb-2">אני יכול לשנות את ההצלה שלי?</h3>
                  <p className="text-gray-600">
                    כן, בכל רגע. אתה יכול להחליף את הנציג שלך או להצביע ישירות במקום להאציל.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">מוכן להשתתף?</h2>
          <p className="text-xl text-blue-100 mb-8">
            בואו נחבר את הממשל לקול אזרחי חי, דינמי ומבוזר
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation("/mk121")}
            >
              ח"כ 121 - ערוץ לכנסת
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={() => setLocation("/governance")}
            >
              קול דינמי - ערוץ לממשלה
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">קול אזרחי</h4>
              <p className="text-sm">מערכת דמוקרטיה מבוזרת לישראל</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">הערוצים</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">ח"כ 121</a></li>
                <li><a href="#" className="hover:text-white transition">קול דינמי</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">מידע</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#vision" className="hover:text-white transition">החזון</a></li>
                <li><a href="#features" className="hover:text-white transition">תכונות</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">עזרה</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-white transition">שאלות נפוצות</a></li>
                <li><a href="#" className="hover:text-white transition">צור קשר</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 קול אזרחי. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
