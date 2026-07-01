import { Globe2 } from "lucide-react";
import { useEffect, useState } from "react";

const languages = [
  { code: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Espa\u00f1ol", dir: "ltr" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

type GoogleTranslateElement = new (
  options: { includedLanguages: string; pageLanguage: string; autoDisplay: boolean },
  elementId: string,
) => void;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge}`;

  const hostname = window.location.hostname;
  if (hostname.includes(".")) {
    document.cookie = `${name}=${value};path=/;domain=.${hostname};max-age=${maxAge}`;
  }
}

function getCurrentLanguage(): LanguageCode {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/he\/([^;]+)/);
  const translatedLanguage = match?.[1] as LanguageCode | undefined;

  if (translatedLanguage === "en" || translatedLanguage === "es") {
    return translatedLanguage;
  }

  return "he";
}

function applyDocumentDirection(language: LanguageCode) {
  const selected = languages.find((item) => item.code === language) ?? languages[0];
  document.documentElement.lang = selected.code;
  document.documentElement.dir = selected.dir;
}

function initializeGoogleTranslate() {
  const containerId = "google_translate_element";
  if (!document.getElementById(containerId)) return;

  const TranslateElement = (window.google as unknown as { translate?: { TranslateElement?: GoogleTranslateElement } } | undefined)?.translate?.TranslateElement;
  if (!TranslateElement) return;

  new TranslateElement(
    {
      pageLanguage: "he",
      includedLanguages: "he,en,es",
      autoDisplay: false,
    },
    containerId,
  );
}

function ensureGoogleTranslateScript() {
  window.googleTranslateElementInit = initializeGoogleTranslate;

  if (document.querySelector('script[data-google-translate="true"]')) {
    initializeGoogleTranslate();
    return;
  }

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.dataset.googleTranslate = "true";
  document.body.appendChild(script);
}

export function FloatingLanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("he");

  useEffect(() => {
    const language = getCurrentLanguage();
    setCurrentLanguage(language);
    applyDocumentDirection(language);
    ensureGoogleTranslateScript();
  }, []);

  const selectLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
    applyDocumentDirection(language);
    setCookie("googtrans", language === "he" ? "/he/he" : `/he/${language}`);
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <div className="notranslate fixed bottom-4 right-4 z-40" translate="no">
        <div className="flex items-center gap-1 rounded-lg border border-white/70 bg-white/95 p-1 text-sm font-black text-[#14213d] shadow-xl backdrop-blur">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#eef6ff] text-[#2454d6]" aria-hidden="true">
            <Globe2 className="h-4 w-4" />
          </span>
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => selectLanguage(language.code)}
              className={`rounded-md px-3 py-2 leading-none transition hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2454d6] ${
                currentLanguage === language.code ? "bg-[#2454d6] text-white" : "text-[#14213d]"
              }`}
              dir={language.dir}
              aria-pressed={currentLanguage === language.code}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
