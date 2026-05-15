import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/track/1O3lvpDcOZDYm21Z75n7xp?utm_source=generator";

export function BackgroundMusicPlayer() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  return (
    <div className={`fixed bottom-3 left-3 z-50 max-w-[calc(100vw-1.5rem)] text-right ${isPlayerVisible ? "w-[280px]" : "w-auto"}`} dir="rtl">
      {!isPlayerVisible ? (
        <Button
          type="button"
          aria-label="הפעל מוזיקת רקע"
          onClick={() => setIsPlayerVisible(true)}
          className="h-10 w-10 rounded-full bg-slate-950 p-0 text-white shadow-lg hover:bg-slate-800"
        >
          <Play className="h-4 w-4 fill-current" />
        </Button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur">
          <div className="mb-1.5 flex justify-end">
            <Button
              type="button"
              aria-label="עצור מוזיקת רקע"
              variant="outline"
              onClick={() => setIsPlayerVisible(false)}
              className="h-7 w-7 shrink-0 rounded-full border-slate-300 p-0 text-slate-700"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
            </Button>
          </div>
          <iframe
            title="Zelão - Sérgio Ricardo Spotify player"
            style={{ borderRadius: "12px" }}
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height="80"
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
    </div>
  );
}
