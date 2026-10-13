"use client";

import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/dictionaries";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="flex items-center gap-1 rounded-full bg-red-600 p-1 text-xs font-bold text-white shadow-lg"
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-white ${
            language === code ? "bg-white text-red-700" : "hover:bg-red-500"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
