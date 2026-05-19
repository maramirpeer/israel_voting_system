import { ArrowRight, BookOpen, Network, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function GateFifty() {
  const [, setLocation] = useLocation();

  const goHome = () => {
    setLocation("/");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <main className="min-h-screen bg-[#fbf7ed] text-right text-[#17324d]" dir="rtl">
      <section className="relative overflow-hidden border-b border-[#c8a96a]/40 bg-[linear-gradient(135deg,rgba(238,246,255,0.95)_0%,rgba(251,247,237,0.96)_52%,rgba(238,246,239,0.95)_100%)]">
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
            <p className="mb-4 text-sm font-bold text-[#2f7d5c]">מושג יסוד בקול משותף</p>
            <h1 className="text-4xl font-black leading-tight text-[#17324d] sm:text-6xl">שער ה-50</h1>
            <p className="mt-6 text-xl font-semibold leading-9 text-[#4a3722]">
              בקבלה מדברים על נ׳ שערי בינה: חמישים מדרגות של הבנה, השגה, תיקון והתקרבות אל האור האלוהי.
              שער ה-50 מסמן את הרגע שבו העבודה המדורגת מבשילה למפגש עם תורה, אחריות ובינה גבוהה יותר.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="mx-auto max-w-4xl rounded-lg border border-[#c8a96a]/35 bg-white/78 p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-[#17324d]">מספירת העומר לשבועות</h2>
          <p className="mt-4 text-lg leading-8 text-[#4a3722]">
            49 הימים של ספירת העומר הם עבודה הדרגתית על המידות: חסד, גבורה, תפארת, נצח, הוד, יסוד ומלכות.
            כל מידה כלולה מכל שבע המידות, ולכן נוצרת דרך של 7 כפול 7: ארבעים ותשעה שערים או מדרגות תיקון.
          </p>
          <p className="mt-4 text-lg leading-8 text-[#4a3722]">
            ואז מגיע היום החמישים: חג השבועות, מתן תורה. זהו לא עוד צעד בתוך הרצף, אלא פתיחה של שער אחר,
            שבו התיקון הפרטי והציבורי יכול להפוך לקבלה של תורה, משמעות וכיוון.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "49 מדרגות",
              text: "הדרך מתחילה בעבודה עקבית על המידות, צעד אחר צעד, עד שנבנית יכולת להכיל מורכבות ואחריות.",
            },
            {
              icon: Sparkles,
              title: "היום החמישים",
              text: "שער ה-50 הוא רגע של פתיחה: מעבר מתיקון מדורג לקבלת תורה, בינה וכיוון משותף.",
            },
            {
              icon: Network,
              title: "בינה ציבורית",
              text: "בקול משותף הדימוי הופך לשפה אזרחית: ריבוי קולות שאינו מתבטל, אלא מצטרף לתהליך שקוף ומשותף.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-lg border border-[#c8a96a]/35 bg-white/76 p-6 shadow-sm">
              <Icon className="mb-4 h-9 w-9 text-[#2f7d5c]" />
              <h2 className="text-2xl font-bold text-[#17324d]">{title}</h2>
              <p className="mt-3 text-base leading-7 text-[#4a3722]">{text}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-lg border border-[#2f7d5c]/25 bg-[#eef6ef]/70 p-7">
          <h2 className="text-2xl font-bold text-[#17324d]">בהקשר האזרחי</h2>
          <p className="mt-4 text-lg leading-8 text-[#4a3722]">
            שער ה-50 הוא הדימוי למעבר מחברה של קולות נפרדים לחברה שמסוגלת לבנות בינה ציבורית. לא מוחקים מחלוקות
            ולא כופים אחדות, אלא יוצרים מנגנון שבו הקול הפרטי נשמר, מצטרף לקולות נוספים, ומקבל דרך מעשית להשפיע
            על קבלת ההחלטות.
          </p>
        </div>
      </section>
    </main>
  );
}
