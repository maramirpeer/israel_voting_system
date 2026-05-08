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
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight mb-4">
                  לא מחליפים. <span className="text-cyan-500">מחברים.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  מערכת דמוקרטיה מבוזרת המחברת את הממשל בהדרגה לקול אזרחי חי, דינמי ומבוזר. שני ערוצי שיתוף מעשיים בין אזרחים לממשל.
                </p>
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
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663429815346/U6pRes7wCe3Tq4MFFrBU3d/hero-blockchain-voting-QZMGzn4EM44k5Skr4RYqWZ.webp"
                alt="מערכת דמוקרטיה מבוזרת"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two Channels Section */}
      <section id="channels" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">שני ערוצי שיתוף מעשיים</h2>
            <p className="text-lg text-gray-600">כל אזרח מחזיק בקול אחד בכל ערוץ - להצביע בעצמו או להאציל לאזרח אחר</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* MK 121 Channel */}
            <Card className="p-8 border-2 border-purple-200 hover:border-purple-400 transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-900">ח"כ 121</h3>
              </div>
              <p className="text-gray-600 mb-6">
                ערוץ אזרחי לכנסת - הציבור בוחר כל 3 חודשים את הצעת החוק והשאילתה הדחופה ביותר לקידום ציבורי
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">הצבעה כל 3 חודשים</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">בחירת הצעת חוק + שאילתה</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">האצלת קול גמישה</span>
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
            <Card className="p-8 border-2 border-blue-200 hover:border-blue-400 transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">קול ציבורי דינמי</h3>
              </div>
              <p className="text-gray-600 mb-6">
                ערוץ אזרחי למשרדי ממשלה - השר מחויב לשמוע את עמדת הציבור לפני החלטות משמעותיות בתחום משרדו
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">הצבעה יומית על החלטות</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">51% כוח מחייב אזרחי</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">שקיפות מלאה של תהליך</span>
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

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
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
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">תכונות מרכזיות</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">אבטחה מלאה</h3>
              <p className="text-gray-600">
                כל קול מוגן בהצפנה חזקה ובטכנולוגיית בלוקציין לאימות ושקיפות מלאה
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">שקיפות מלאה</h3>
              <p className="text-gray-600">
                כל החלטה, כל הצבעה, וכל תוצאה נחשפות לציבור בזמן אמת
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">כוח אזרחי</h3>
              <p className="text-gray-600">
                כל אזרח מחזיק בקול אחד, ויכול להשפיע ישירות על החלטות ממשלתיות
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">אנונימיות מלאה</h3>
              <p className="text-gray-600">
                הקול של כל אזרח נשמר בסוד מלא - אף אחד לא יודע איך הצבעת
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">דינמיקה חיה</h3>
              <p className="text-gray-600">
                המערכת מתגיבה בזמן אמת לקול הציבור - לא מדי פעם, אלא כל הזמן
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
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
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">שאלות נפוצות</h2>
          
          <div className="max-w-2xl mx-auto">
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tab1">על המערכת</TabsTrigger>
                <TabsTrigger value="tab2">על ההצבעה</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tab1" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-blue-900 mb-2">מה ההבדל בין ח"כ 121 לקול דינמי?</h3>
                  <p className="text-gray-600">
                    ח"כ 121 הוא ערוץ לכנסת - אזרחים בוחרים כל 3 חודשים הצעת חוק ושאילתה. קול דינמי הוא ערוץ למשרדי ממשלה - אזרחים מצביעים על החלטות יומיות של השרים.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-blue-900 mb-2">האם זה מחליף את הממשל הקיים?</h3>
                  <p className="text-gray-600">
                    לא. המערכת מחברת את הממשל הקיים לקול אזרחי בהדרגה. השרים נשארים בתפקידם, אך חייבים לשמוע את הציבור לפני החלטות משמעותיות.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-blue-900 mb-2">מה קורה כשהציבור מתנגד להחלטה?</h3>
                  <p className="text-gray-600">
                    ההחלטה נדחית אוטומטית. זה כוח מחייב אזרחי - אם הציבור מתנגד, ההחלטה לא תעבור.
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="tab2" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold text-blue-900 mb-2">איך אני מצביע?</h3>
                  <p className="text-gray-600">
                    אתה מחובר למערכת עם ת.ז שלך. כשיש הצבעה, אתה יכול להצביע ישירות או להאציל את קולך לאזרח אחר שאתה סומך עליו.
                  </p>
                </Card>

                <Card className="p-6">
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
