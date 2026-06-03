import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck, Copy, Home, Link2, List, Loader2, LogIn, MessageCircle, Network, QrCode, Send, Share2, Users, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
  directSignupNames: string[];
  directSignupPreviewName: string;
  levels: typeof levels;
};

export default function GroupBuilding() {
  const [location, setLocation] = useLocation();
  const [statusMessage, setStatusMessage] = useState("");
  const [isPersonalLoaderOpen, setPersonalLoaderOpen] = useState(false);
  const [personalEmail, setPersonalEmail] = useState("");
  const [personalEmailTypedPrefix, setPersonalEmailTypedPrefix] = useState("");
  const [personalEmailSuggestions, setPersonalEmailSuggestions] = useState<string[]>([]);
  const [personalLoaderMessage, setPersonalLoaderMessage] = useState("");
  const [isPersonalLoaderSubmitting, setPersonalLoaderSubmitting] = useState(false);
  const personalEmailInputRef = useRef<HTMLInputElement | null>(null);
  const searchParams = useMemo(() => new URLSearchParams(location.split("?")[1] || window.location.search), [location]);
  const referralCodeFromUrl = useMemo(() => normalizeReferralCode(searchParams.get("ref")), [searchParams]);
  const hasPersonalReferralCode = referralCodeFromUrl.length > 0;
  const showDirectDetails = hasPersonalReferralCode && searchParams.get("direct") === "1";
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
  const directSignupNames = referralStats?.directSignupNames || [];
  const directSignupPreviewName = referralStats?.directSignupPreviewName || directSignupNames[0] || "";
  const directDetailsPath = `/group-building?ref=${encodeURIComponent(referralCode)}&direct=1`;

  useEffect(() => {
    const emailPrefix = personalEmailTypedPrefix.trim().toLowerCase();

    if (!isPersonalLoaderOpen || emailPrefix.length < 2) {
      setPersonalEmailSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      fetch(`/api/member-signups/email-suggestions?q=${encodeURIComponent(emailPrefix)}`, {
        signal: controller.signal,
      })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          const emails = Array.isArray(data?.emails) ? data.emails : [];
          setPersonalEmailSuggestions(emails);
        })
        .catch(() => undefined);
    }, 160);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isPersonalLoaderOpen, personalEmailTypedPrefix]);

  useEffect(() => {
    const typedEmail = personalEmailTypedPrefix.trim().toLowerCase();

    if (!isPersonalLoaderOpen || typedEmail.length < 2) {
      return;
    }

    const completion = personalEmailSuggestions.find((email) => {
      const normalizedEmail = email.toLowerCase();
      return normalizedEmail.startsWith(typedEmail) && normalizedEmail !== typedEmail;
    });

    if (!completion) {
      return;
    }

    const typedLength = personalEmailTypedPrefix.length;
    setPersonalEmail(completion);
    window.requestAnimationFrame(() => {
      personalEmailInputRef.current?.setSelectionRange(typedLength, completion.length);
    });
  }, [isPersonalLoaderOpen, personalEmailTypedPrefix, personalEmailSuggestions]);

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
            directSignupNames: Array.isArray(data.directSignupNames) ? data.directSignupNames : [],
            directSignupPreviewName: typeof data.directSignupPreviewName === "string" ? data.directSignupPreviewName : "",
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

  const loadPersonalGroupPage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = personalEmail.trim();

    if (!email) {
      setPersonalLoaderMessage("צריך להזין אימייל רשום כדי לטעון את הדף האישי.");
      return;
    }

    setPersonalLoaderSubmitting(true);
    setPersonalLoaderMessage("");

    try {
      const response = await fetch("/api/member-signups/recover-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "לא נמצאה הרשמה מאושרת למייל הזה.");
      }

      const nextReferralCode = normalizeReferralCode(data.referralCode || "");
      if (!nextReferralCode) {
        throw new Error("נמצא חבר רשום, אבל לא נמצא קישור אישי.");
      }

      setPersonalLoaderOpen(false);
      window.location.assign(`/group-building?ref=${encodeURIComponent(nextReferralCode)}`);
    } catch (error) {
      setPersonalLoaderMessage(error instanceof Error ? error.message : "טעינת הדף האישי נכשלה.");
    } finally {
      setPersonalLoaderSubmitting(false);
    }
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

        <Card
          className={`border p-5 ${
            hasPersonalReferralCode
              ? "border-[#2f7d5c] bg-[#eef8f2]"
              : "border-[#c8a96a] bg-[#fff9e8]"
          }`}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-2 text-right">
              <p className={`text-sm font-black ${hasPersonalReferralCode ? "text-[#2f7d5c]" : "text-[#9a6a12]"}`}>
                {hasPersonalReferralCode ? "דף אישי אמיתי" : "אלו נתוני דמה"}
              </p>
              <p className="text-base font-semibold leading-7 text-[#4a3722]">
                {hasPersonalReferralCode
                  ? "המספרים, הקוד והקישור בדף הזה מחוברים לבניין ההשפעה האישית שלך על ההצטרפות לקבוצה."
                  : "המספרים והקוד שמופיעים כאן הם להמחשה בלבד. כדי לראות נתונים אמיתיים צריך לעבור לבניין ההשפעה האישית על ההצטרפות לקבוצה."}
              </p>
            </div>
            {!hasPersonalReferralCode && (
              <Button onClick={() => setPersonalLoaderOpen(true)} className="gap-2 bg-[#1d4f91] hover:bg-[#173f74]">
                <LogIn className="h-4 w-4" />
                מעבר לבניין ההשפעה האישית
              </Button>
            )}
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#d8c79f] bg-white/92 p-5">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-[#1d4f91]" />
              <p className="text-sm font-bold text-[#5a4b38]">הצטרפו ישירות</p>
            </div>
            <HoverCard openDelay={180}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  onClick={() => setLocation(directDetailsPath)}
                  className="mt-3 block text-4xl font-black leading-none text-[#17324d] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4f91]"
                  aria-label="פתיחת פירוט המצטרפים הישירים"
                >
                  {displayLevels[0].count.toLocaleString("he-IL")}
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 border-[#d8c79f] bg-white text-right" side="bottom">
                {directSignupPreviewName ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#5a4b38]">אחד מהמצטרפים ישירות דרכך</p>
                    <p className="text-lg font-black text-[#17324d]">{directSignupPreviewName}</p>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-[#5a4b38]">עדיין אין שמות להצגה.</p>
                )}
              </HoverCardContent>
            </HoverCard>
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

        {showDirectDetails && (
          <Card className="border-[#d8c79f] bg-white/95 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <List className="h-7 w-7 text-[#1d4f91]" />
              <div className="text-right">
                <h2 className="text-2xl font-bold">המצטרפים הישירים שלי</h2>
                <p className="mt-1 text-sm font-semibold text-[#5a4b38]">
                  מי שאישרו הצטרפות דרך הקישור האישי שלך.
                </p>
              </div>
            </div>
            {directSignupNames.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {directSignupNames.map((name, index) => (
                  <div key={`${name}-${index}`} className="rounded-md border border-[#eadfca] bg-[#fbf7ed]/60 p-4">
                    <p className="text-xs font-bold text-[#5a4b38]">מצטרף ישיר</p>
                    <p className="mt-1 text-lg font-black text-[#17324d]">{name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-[#eadfca] bg-[#fbf7ed]/60 p-4 text-right font-semibold text-[#5a4b38]">
                עדיין אין מצטרפים ישירים מאושרים דרך הקישור הזה.
              </div>
            )}
          </Card>
        )}

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

      <Dialog open={isPersonalLoaderOpen} onOpenChange={setPersonalLoaderOpen}>
        <DialogContent className="max-w-md border-[#d8c79f] bg-[#fbf7ed] text-right" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black text-[#17324d]">מעבר לבניין ההשפעה האישית</DialogTitle>
            <DialogDescription className="leading-7 text-[#5a4b38]">
              הזינו אימייל רשום כדי לפתוח את הדף האישי עם הקוד, ההצטרפויות והמדדים האמיתיים.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={loadPersonalGroupPage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal-group-email">אימייל רשום</Label>
              <Input
                id="personal-group-email"
                ref={personalEmailInputRef}
                type="text"
                inputMode="email"
                value={personalEmail}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  const selectionStart = event.target.selectionStart ?? nextValue.length;
                  const typedPrefix = nextValue.slice(0, selectionStart);
                  setPersonalEmail(nextValue);
                  setPersonalEmailTypedPrefix(typedPrefix);
                }}
                autoComplete="email"
                placeholder="name@example.com"
                className="text-left"
                dir="ltr"
              />
            </div>
            {personalLoaderMessage && (
              <p className="rounded-md border border-[#d8c79f] bg-white/80 p-3 text-sm font-bold text-[#9a2a2a]">
                {personalLoaderMessage}
              </p>
            )}
            <Button type="submit" disabled={isPersonalLoaderSubmitting} className="w-full gap-2 bg-[#1d4f91] hover:bg-[#173f74]">
              {isPersonalLoaderSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              טעינת הדף האישי
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
