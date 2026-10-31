"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/dictionaries";

function LanguageButtons({ onPick }: { onPick?: () => void }) {
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
          onClick={() => {
            setLanguage(code);
            onPick?.();
          }}
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

// compact: botão redondo com o ícone de tradução (protótipo do mapa) que abre as opções PT/EN/ES.
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!compact) return <LanguageButtons />;

  return (
    <div ref={rootRef} className="relative flex flex-col items-end">
      <button
        type="button"
        aria-label={t.language.open}
        title={t.language.open}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-14 place-items-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white/40 hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
      >
        <svg aria-hidden className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5h8M8 3v2M5.5 5c.8 3 3.2 5.6 6 7M10.5 5c-.6 3.5-3 6.8-6.5 8.5" />
          <path d="m12 21 4.5-10L21 21M13.5 18h6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2">
          <LanguageButtons onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
