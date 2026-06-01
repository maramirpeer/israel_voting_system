import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const KolMeshutafText = ({ className = "" }: { className?: string }) => (
  <span className={`font-bold ${className}`}>קול משותף</span>
);

export default function CandidateContract() {
  const [, setLocation] = useLocation();

  const goHome = () => {
    setLocation("/");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <main className="min-h-screen bg-[#fbf7ed] text-right text-[#17324d]" dir="rtl">
      <section className="border-b border-[#c8a96a]/40 bg-[linear-gradient(135deg,rgba(238,246,255,0.95)_0%,rgba(251,247,237,0.96)_52%,rgba(238,246,239,0.95)_100%)]">
        <div className="container py-8">
          <Button
            variant="outline"
            onClick={goHome}
            className="mb-10 border-[#c8a96a] bg-white/70 text-[#17324d] hover:bg-white"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לפתיח
          </Button>

          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-bold text-[#2f7d5c]">חוזה ציבורי</p>
            <h1 className="text-4xl font-black leading-tight text-[#17324d] sm:text-6xl">
              חוזה ציבורי בין מועמד/ת לכנסת לבין ציבור הבוחרים
            </h1>
            <p className="mt-6 text-xl font-semibold leading-9 text-[#4a3722]">
              נוסח מלא להתחייבות ציבורית של מועמדים לכנסת לקידום מנגנון השתתפות ציבורית שקוף, אחראי ורציף.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <Card className="mx-auto max-w-5xl border-[#d8c79f] bg-white p-8 shadow-sm">
          <div className="space-y-6 leading-8 text-slate-700">
            <div>
              <h2 className="mb-3 text-2xl font-bold text-slate-900">חוזה ציבורי בין מועמד/ת לכנסת לבין ציבור הבוחרים</h2>
              <p>
                אני, החתום/ה מטה, כמועמד/ת לבחירות לכנסת ישראל, מצהיר/ה בזאת כי אני מכיר/ה בכך
                שהמנדט הציבורי אינו רכוש אישי, מפלגתי או סיעתי בלבד, אלא שליחות הניתנת לי מאת ציבור הבוחרים.
              </p>
              <p className="mt-3">
                מתוך הכרה זו, אני מתחייב/ת לפעול לקידום עקרונות של דמוקרטיה מתקדמת, שקיפות,
                אחריות ציבורית, שיתוף אזרחי וביסוס קולו של הציבור בתהליך קבלת ההחלטות.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">התחייבות מרכזית</h3>
              <p>
                אם אבחר לכנסת, אני מתחייב/ת להצביע בעד הצעת חוק שתסדיר את הקמת מנגנון
                <KolMeshutafText className="mx-1 text-[#17324d]" /> - מנגנון ציבורי, שקוף, ישיר,
                דינמי ומואצל, שיאפשר לציבור להשתתף באופן רציף ומשמעותי בתהליך קבלת ההחלטות.
              </p>
              <p className="mt-3">
                התחייבות זו תחול על הצעת חוק שתונח בפני הכנסת הבאה ותעסוק בהסדרת מנגנון השתתפות ציבורית
                מחייב, שקוף ואחראי.
              </p>
              <p className="mt-3">
                אם חוק <KolMeshutafText className="mx-1 text-[#17324d]" /> לא יוצע, אני מתחייב/ת להציע את החוק בעצמי.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">מהות ההתחייבות</h3>
              <p>
                אני מתחייב/ת כי לא אתייחס להצעת החוק כאל עניין טכני או הצהרתי בלבד, אלא כאל התחייבות
                ציבורית מהותית שניתנה מראש לבוחרים.
              </p>
              <p className="mt-3">
                במסגרת זו אפעל בתום לב, בשקיפות ובאחריות כדי לאפשר את קידום ההצעה, דיון ציבורי בה,
                והצבעה עליה במסגרת הכנסת.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">התחייבויות משלימות</h3>
              <ol className="list-decimal space-y-2 pr-6">
                <li>לפרסם לציבור את עמדתי בנושאים מהותיים לפני הצבעות מרכזיות.</li>
                <li>לנמק החלטות והצבעות בעלות חשיבות ציבורית.</li>
                <li>לאפשר התייעצות ציבורית באמצעות מנגנונים פתוחים, ישירים או מואצלים.</li>
                <li>לפעול לחיזוק אמון הציבור בנבחריו באמצעות שקיפות, אחריות והקשבה רציפה.</li>
              </ol>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">גבולות ההתחייבות</h3>
              <p>
                ידוע לי כי כהונתי כחבר/ת כנסת כפופה לדין, לחוקי מדינת ישראל, לכללי האתיקה של הכנסת
                ולחובותיי כנבחר/ת ציבור.
              </p>
              <p className="mt-3">
                אין בהתחייבות זו כדי לחייב פעולה בלתי חוקית, פגיעה בזכויות יסוד, או פעולה הסותרת באופן
                מובהק את טובת הציבור ואת עקרונות היסוד של מדינת ישראל כמדינה יהודית ודמוקרטית.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">הצהרה ציבורית</h3>
              <p>
                אני מבין/ה כי חתימתי על חוזה זה היא התחייבות ציבורית גלויה כלפי הבוחרים.
              </p>
              <p className="mt-3 font-bold text-slate-900">
                מי שמבקש את קולם של האזרחים צריך לרצות בקולם כחלק מההתנהלות השוטפת של השלטון.
              </p>
            </div>

            <div className="grid gap-3 rounded-lg bg-[#fbf7ed] p-4 text-sm text-slate-700 md:grid-cols-2">
              <p>שם המועמד/ת: ____________</p>
              <p>מספר זהות: ____________</p>
              <p>מפלגה / רשימה: ____________</p>
              <p>תאריך: ____________</p>
              <p>חתימה: ____________</p>
            </div>
          </div>
        </Card>

        <Card className="mx-auto mt-8 max-w-5xl border-[#d8c79f] bg-white p-8 shadow-sm">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">מועמדים שחתמו על החוזה</h2>
          <div className="rounded-lg bg-[#fbf7ed] p-4 text-center text-slate-600">
            עדיין לא חתמו מועמדים על החוזה.
          </div>
        </Card>
      </section>
    </main>
  );
}
