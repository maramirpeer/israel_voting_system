import { Globe2 } from "lucide-react";

const languages = [
  { code: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Espa\u00f1ol", dir: "ltr" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

function getOriginalUrl() {
  const url = new URL(window.location.href);

  if (url.hostname.endsWith(".translate.goog")) {
    const originalHost = url.hostname
      .replace(/\.translate\.goog$/, "")
      .replace(/-/g, ".");
    return `https://${originalHost}${url.pathname}${url.search}${url.hash}`;
  }

  return url.href;
}

function getLanguageUrl(language: LanguageCode) {
  const originalUrl = getOriginalUrl();

  if (language === "he") {
    return originalUrl;
  }

  const translateUrl = new URL("https://translate.google.com/translate");
  translateUrl.searchParams.set("sl", "he");
  translateUrl.searchParams.set("tl", language);
  translateUrl.searchParams.set("u", originalUrl);

  return translateUrl.toString();
}

function getCurrentLanguage(): LanguageCode {
  const url = new URL(window.location.href);
  const translatedLanguage = url.searchParams.get("tl") || url.searchParams.get("_x_tr_tl");

  if (translatedLanguage === "en" || translatedLanguage === "es") {
    return translatedLanguage;
  }

  return "he";
}

export function FloatingLanguageSwitcher() {
  const currentLanguage = typeof window === "undefined" ? "he" : getCurrentLanguage();

  return (
    <div className="notranslate fixed bottom-4 right-4 z-[9999]" translate="no">
      <div className="flex items-center gap-1 rounded-lg border border-white/70 bg-white/95 p-1 text-sm font-black text-[#14213d] shadow-xl backdrop-blur">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef6ff] text-[#2454d6]" aria-hidden="true">
          <Globe2 className="h-4 w-4" />
        </span>
        {languages.map((language) => (
          <a
            key={language.code}
            href={getLanguageUrl(language.code)}
            className={`rounded-md px-3 py-2 leading-none transition hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2454d6] ${
              currentLanguage === language.code ? "bg-[#2454d6] text-white" : "text-[#14213d]"
            }`}
            dir={language.dir}
            aria-current={currentLanguage === language.code ? "true" : undefined}
          >
            {language.label}
          </a>
        ))}
      </div>
    </div>
  );
}
