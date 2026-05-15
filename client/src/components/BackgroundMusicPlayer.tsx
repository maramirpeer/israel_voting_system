import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/track/1O3lvpDcOZDYm21Z75n7xp?utm_source=generator";

export function BackgroundMusicPlayer() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2 text-right" dir="rtl">
      {isPlayerVisible && (
        <div className="w-[300px] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur">
          <iframe
            title="Zelão - Sérgio Ricardo Spotify player"
            style={{ borderRadius: "12px" }}
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <p className="mt-1 text-[10px] leading-3 text-slate-500">
            ההשמעה מתבצעת דרך Spotify ובהתאם לתנאי השימוש שלה.
          </p>
        </div>
      )}

      <Button
        type="button"
        title={isPlayerVisible ? "עצור מוזיקה" : "הפעל מוזיקה"}
        aria-label={isPlayerVisible ? "עצור מוזיקה" : "הפעל מוזיקה"}
        onClick={() => setIsPlayerVisible((value) => !value)}
        className="h-11 w-11 rounded-full bg-slate-950 p-0 text-white shadow-lg hover:bg-slate-800"
      >
        {isPlayerVisible ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
      </Button>
    </div>
  );
}
