import { Button } from "@/components/ui/button";
import { Music, VolumeX } from "lucide-react";
import { useState } from "react";

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/track/1O3lvpDcOZDYm21Z75n7xp?utm_source=generator";

export function BackgroundMusicPlayer() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  return (
    <div className={`fixed bottom-3 left-3 z-50 max-w-[calc(100vw-1.5rem)] text-right ${isPlayerVisible ? "w-[280px]" : "w-auto"}`} dir="rtl">
      {!isPlayerVisible ? (
        <Button
          type="button"
          onClick={() => setIsPlayerVisible(true)}
          className="h-9 rounded-full bg-slate-950 px-3 text-xs text-white shadow-lg hover:bg-slate-800"
        >
          <Music className="ml-1.5 h-3.5 w-3.5" />
          הפעל
        </Button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-bold text-slate-900">לחץ Play בנגן</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPlayerVisible(false)}
              className="h-7 shrink-0 border-slate-300 px-1.5 text-[11px] text-slate-700"
            >
              <VolumeX className="ml-1 h-3 w-3" />
              עצור
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
