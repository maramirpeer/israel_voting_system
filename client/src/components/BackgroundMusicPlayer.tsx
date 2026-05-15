import { Button } from "@/components/ui/button";
import { Music, X } from "lucide-react";
import { useState } from "react";

const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/track/1O3lvpDcOZDYm21Z75n7xp?utm_source=generator";
const SPOTIFY_TRACK_URL = "https://open.spotify.com/track/1O3lvpDcOZDYm21Z75n7xp";

export function BackgroundMusicPlayer() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  return (
    <div className={`fixed right-3 top-1/2 z-50 max-w-[calc(100vw-1.5rem)] -translate-y-1/2 text-right ${isPlayerVisible ? "w-[320px]" : "w-auto"}`} dir="rtl">
      {!isPlayerVisible ? (
        <Button
          type="button"
          onClick={() => setIsPlayerVisible(true)}
          className="h-10 rounded-full bg-slate-950 px-3 text-xs text-white shadow-lg hover:bg-slate-800"
        >
          <Music className="ml-1.5 h-3.5 w-3.5" />
          Spotify
        </Button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <a
              href={SPOTIFY_TRACK_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-green-700 underline-offset-2 hover:underline"
            >
              פתח ב-Spotify
            </a>
            <Button
              type="button"
              aria-label="סגור נגן"
              variant="outline"
              onClick={() => setIsPlayerVisible(false)}
              className="h-7 w-7 shrink-0 rounded-full border-slate-300 p-0 text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
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
    </div>
  );
}
