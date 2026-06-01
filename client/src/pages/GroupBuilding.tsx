import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BadgeCheck, Copy, Home, Link2, MessageCircle, Network, QrCode, Send, Share2, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const fallbackReferralCode = "KM-R7K92A";
const publicSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://www.sharedemocracy.com").replace(/\/+$/, "");

function normalizeReferralCode(value: string | null) {
  return (value || "").toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function buildReferralUrl(referralCode: string) {
  return `${publicSiteUrl}/?ref=${encodeURIComponent(referralCode)}`;
}

function buildSignupPath(referralCode: string) {
  return `/?signup=1&ref=${encodeURIComponent(referralCode)}`;
}

function buildQrImageUrl(referralUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(referralUrl)}`;
}

const levels = [
  { level: "רמה 1", title: "חברים שהצטרפו ישירות דרכך", count: 12, weight: "100%", credit: 12 },
  { level: "רמה 2", title: "חברים שהגיעו דרך החברים שלך", count: 31, weight: "50%", credit: 15.5 },
  { level: "רמה 3", title: "המשך מעגל ההשפעה", count: 74, weight: "25%", credit: 18.5 },
  { level: "רמה 4+", title: "שרשרת חברים מתמשכת", count: 146, weight: "דועך", credit: 22.2 },
];

const emptyLevels = levels.map((item) => ({ ...item, count: 0, credit: 0 }));

const actions = [
  { title: "מעתיקים קישור", text: "הקישור מזהה מי הגיע דרכך ומחבר אותו לקבוצת החברים שלך.", icon: Link2 },
  { title: "שולחים לחברים", text: "הזמנה אישית עובדת טוב יותר מפרסום כללי. עדיף להתחיל מ-5 אנשים קרובים.", icon: MessageCircle },
  { title: "הקבוצה גדלה", text: "גם מי שחבריך מזמינים ממשיך להיספר כחלק ממעגל ההשפעה.", icon: Network },
];

const buildTree = (referralCode: string) => [
  { name: "אני", code: referralCode, depth: 0, x: "50%", y: "11%" },
  { name: "דנה", code: "KM-D421", depth: 1, x: "28%", y: "35%" },
  { name: "רועי", code: "KM-R884", depth: 1, x: "72%", y: "35%" },
  { name: "יוסי", code: "KM-Y118", depth: 2, x: "18%", y: "64%" },
  { name: "מיכל", code: "KM-M590", depth: 2, x: "40%", y: "64%" },
  { name: "נעמה", code: "KM-N307", depth: 2, x: "72%", y: "64%" },
  { name: "אורי", code: "KM-O752", depth: 3, x: "86%", y: "84%" },
];

type ReferralStats = {
  directSignups: number;
  totalCluster: number;
  influenceScore: number;
  levels: typeof levels;
};

export default function GroupBuilding() {
  const [, setLocation] = useLocation();
  const [statusMessage, setStatusMessage] = useState("");
  const referralCodeFromUrl = useMemo(() => normalizeReferralCode(new URLSearchParams(window.location.search).get("ref")), []);
  const hasPersonalReferralCode = referralCodeFromUrl.length > 0;
  const referralCode = referralCodeFromUrl || fallbackReferralCode;
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const referralUrl = useMemo(() => buildReferralUrl(referralCode), [referralCode]);
  const qrImageUrl = useMemo(() => buildQrImageUrl(referralUrl), [referralUrl]);
  const inviteText = useMemo(() => `אני מזמין/ה אותך להצטרף לקול משותף - קבוצת חברים שבונה כוח אזרחי מסודר, שקוף ומשפיע.

הצטרפות דרך הקישור האישי שלי:
${referralUrl}`, [referralUrl]);
  const displayLevels = useMemo(() => {
    if (!hasPersonalReferralCode) {
      return levels;
    }

    if (!referralStats?.levels?.length) {
      return emptyLevels;
    }

    return referralStats.levels;
  }, [hasPersonalReferralCode, referralStats]);
  const tree = useMemo(() => buildTree(referralCode), [referralCode]);
  const totalCluster = hasPersonalReferralCode && referralStats ? referralStats.totalCluster : displayLevels.reduce((sum, item) => sum + item.count, 0);
  const totalCredit = hasPersonalReferralCode && referralStats ? referralStats.influenceScore : displayLevels.reduce((sum, item) => sum + item.credit, 0);

  useEffect(() => {
    if (!hasPersonalReferralCode) {
      return;
    }

    let isMounted = true;

    fetch(`/api/member-signups/referral/${encodeURIComponent(referralCode)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (
          isMounted &&
          typeof data?.directSignups === "number" &&
          typeof data?.totalCluster === "number" &&
          typeof data?.influenceScore === "number" &&
          Array.isArray(data?.levels)
        ) {
          setReferralStats({
            directSignups: data.directSignups,
            totalCluster: data.totalCluster,
            influenceScore: data.influenceScore,
            levels: data.levels,
          });
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [hasPersonalReferralCode, referralCode]);

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(""), 2400);
  };

  const copyToClipboard = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text);
    showStatus(message);
  };

  const shareInvite = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "הצטרפות לקול משותף",
        text: inviteText,
        url: referralUrl,
      });
      return;
    }

    await copyToClipboard(inviteText, "ההזמנה הועתקה ואפשר להדביק אותה בכל אפליקציה.");
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf7ed_0%,#ffffff_44%,#eef6ff_100%)] px-4 py-8 text-[#17324d]" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="grid gap-5 border-b border-[#d8c79f] pb-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3 text-right">
            <p className="text-sm font-bold text-[#2f7d5c]">קול משותף</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">בניין קבוצת החברים - הפצה</h1>
            <p className="max-w-3xl text-lg leading-8 text-[#5a4b38]">
              כל מצטרף מקבל קישור אישי. מי שנרשם דרכך מצטרף לקבוצת החברים שלך, וגם ההזמנות שלו ממשיכות להגדיל את מעגל ההשפעה האזרחי שלך.
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")} className="gap-2 border-[#c8a96a] bg-white/80">
            <Home className="h-4 w-4" />
            חזרה לעמוד הבית
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#d8c79f] bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-[#1d4f91]" />
              <p className="text-sm font-bold text-[#5a4b38]">הצטרפו ישירות</p>
            </div>
            <p className="mt-3 text-4xl font-black">{displayLevels[0].count.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <Network className="h-8 w-8 text-[#2f7d5c]" />
              <p className="text-sm font-bold text-[#5a4b38]">כל קבוצת החברים</p>
            </div>
            <p className="mt-3 text-4xl font-black">{totalCluster.toLocaleString("he-IL")}</p>
          </Card>
          <Card className="border-[#d8c79f] bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <Zap className="h-8 w-8 text-[#c28b25]" />
              <p className="text-sm font-bold text-[#5a4b38]">קרדיט השפעה</p>
            </div>
            <p className="mt-3 text-4xl font-black">{totalCredit.toLocaleString("he-IL", { maximumFractionDigits: 1 })}</p>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-[#d8c79f] bg-white/95 p-6">
            <div className="mb-5 flex items-center justify-between">
              <QrCode className="h-7 w-7 text-[#1d4f91]" />
              <h2 className="text-2xl font-bold">הקישור האישי שלי</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
              <div className="rounded-md border border-[#d8c79f] bg-white p-3">
                <img src={qrImageUrl} alt="QR אישי להזמנת חברים" className="h-[220px] w-[220px]" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-[#5a4b38]">קוד אישי</p>
                  <p className="mt-1 rounded-md bg-[#eef6ff] px-3 py-2 font-mono text-lg font-bold text-[#17324d]" dir="ltr">
                    {referralCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#5a4b38]">קישור לשיתוף</p>
                  <p className="mt-1 break-all rounded-md bg-[#fbf7ed] px-3 py-2 text-sm font-semibold text-[#17324d]" dir="ltr">
                    {referralUrl}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => copyToClipboard(referralUrl, "הקישור האישי הועתק.")} className="min-w-24 gap-2 bg-[#1d4f91] hover:bg-[#173f74]">
                    <Copy className="h-4 w-4" />
                    העתקה
                  </Button>
                  <Button variant="outline" onClick={shareInvite} className="min-w-24 gap-2 border-[#2f7d5c] text-[#2f7d5c]">
                    <Share2 className="h-4 w-4" />
                    שיתוף
                  </Button>
                  <Button variant="outline" onClick={openWhatsApp} className="min-w-28 gap-2 border-[#c8a96a] text-[#4a3722]">
                    <Send className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
                {statusMessage && <p className="rounded-md bg-[#eef6ef] p-2 text-sm font-bold text-[#2f5d35]">{statusMessage}</p>}
              </div>
            </div>
          </Card>

          <Card className="border-[#d8c79f] bg-white/95 p-6">
            <div className="mb-5 flex items-center justify-between">
              <MessageCircle className="h-7 w-7 text-[#2f7d5c]" />
              <h2 className="text-2xl font-bold">נוסח הזמנה מוכן</h2>
            </div>
            <div className="rounded-md border border-[#eadfca] bg-[#fbf7ed]/70 p-4 text-right leading-8 text-[#4a3722] whitespace-pre-line">
              {inviteText}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => copyToClipboard(inviteText, "נוסח ההזמנה הועתק.")} className="gap-2 bg-[#2f7d5c] hover:bg-[#286a4f]">
                <Copy className="h-4 w-4" />
                העתק נוסח
              </Button>
              <Button variant="outline" onClick={shareInvite} className="gap-2 border-[#1d4f91] text-[#1d4f91]">
                <Share2 className="h-4 w-4" />
                שתף עכשיו
              </Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {actions.map(({ title, text, icon: Icon }) => (
            <Card key={title} className="border-[#d8c79f] bg-white/94 p-5">
              <Icon className="h-7 w-7 text-[#1d4f91]" />
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 leading-7 text-[#5a4b38]">{text}</p>
            </Card>
          ))}
        </section>

        <Card className="border-[#d8c79f] bg-[#17324d] p-6 text-white">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-2 text-right">
              <h2 className="text-2xl font-bold">כל חבר יכול להוסיף הצעת חוק או שאילתא</h2>
              <p className="max-w-3xl leading-8 text-[#d8c79f]">
                מרכז המסך הוא הפצה: כל חבר שולח קישור או QR אישי, וכל מצטרף דרכו מגדיל את מדד ההשפעה שלו. לצד ההפצה, החבר יכול גם להגיש הצעת חוק או שאילתא משלו לדף המקדים.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => setLocation(buildSignupPath(referralCode))} className="bg-white text-[#17324d] hover:bg-[#eef6ff]">
                הגשת הצעת חוק
              </Button>
              <Button onClick={() => setLocation(buildSignupPath(referralCode))} variant="outline" className="border-[#d8c79f] text-white hover:bg-white/10">
                הגשת שאילתא
              </Button>
            </div>
          </div>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border-[#d8c79f] bg-white/95 p-6">
            <div className="mb-5 flex items-center justify-between">
              <BadgeCheck className="h-7 w-7 text-[#2f7d5c]" />
              <h2 className="text-2xl font-bold">איך הקרדיט נבנה</h2>
            </div>
            <div className="space-y-3">
              {displayLevels.map((item) => (
                <div key={item.level} className="grid gap-3 rounded-md border border-[#eadfca] bg-[#fbf7ed]/55 p-4 md:grid-cols-[90px_1fr_90px_100px] md:items-center">
                  <span className="font-bold text-[#1d4f91]">{item.level}</span>
                  <span className="font-semibold">{item.title}</span>
                  <span>{item.count.toLocaleString("he-IL")} אנשים</span>
                  <span className="rounded bg-white px-2 py-1 text-center text-sm font-bold text-[#2f7d5c]">{item.weight}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5a4b38]">
              השרשרת יכולה להמשיך בלי הגבלת עומק. הקרדיט ממשיך להיספר, אבל המשקל שלו קטן ככל שהמצטרף רחוק יותר מהקוד המקורי.
            </p>
          </Card>

          <Card className="border-[#d8c79f] bg-white/95 p-6">
            <div className="mb-5 flex items-center justify-between">
              <Network className="h-7 w-7 text-[#1d4f91]" />
              <h2 className="text-2xl font-bold">דוגמה לקבוצת חברים</h2>
            </div>
            <div className="relative h-[430px] overflow-hidden rounded-md border border-[#eadfca] bg-[#f7fbff]">
              <div className="absolute left-[28%] top-[17%] h-[118px] w-px rotate-[42deg] bg-[#c8a96a]" />
              <div className="absolute left-[62%] top-[17%] h-[118px] w-px rotate-[-42deg] bg-[#c8a96a]" />
              <div className="absolute left-[22%] top-[43%] h-[105px] w-px rotate-[28deg] bg-[#c8a96a]" />
              <div className="absolute left-[34%] top-[43%] h-[105px] w-px rotate-[-28deg] bg-[#c8a96a]" />
              <div className="absolute left-[76%] top-[43%] h-[105px] w-px rotate-[-10deg] bg-[#c8a96a]" />
              <div className="absolute left-[80%] top-[68%] h-[78px] w-px rotate-[-28deg] bg-[#c8a96a]" />
              {tree.map((node) => (
                <div
                  key={node.code}
                  className={`absolute min-w-28 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-white p-3 text-center shadow-sm ${
                    node.depth === 0 ? "border-[#1d4f91]" : "border-[#d8c79f]"
                  }`}
                  style={{ left: node.x, top: node.y }}
                >
                  <p className="font-bold text-[#17324d]">{node.name}</p>
                  <p className="mt-1 font-mono text-xs text-[#5a4b38]" dir="ltr">
                    {node.code}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
