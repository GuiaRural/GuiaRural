"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { MIN_SEARCH_CHARS, getRecentPlaces, searchPlaces } from "../../services/placesService";

const noopSubscribe = () => () => {};

// No macOS o atalho é ⌘K; nos demais sistemas, Ctrl+K. No servidor assume Ctrl para não divergir na hidratação.
function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

export default function SearchBar({
  onSelect,
  recentVersion = 0,
  onLocate,
  locating = false,
}: {
  onSelect: (place: Place) => void;
  recentVersion?: number;
  onLocate?: () => void;
  locating?: boolean;
}) {
  const { t } = useLanguage();
  const isMac = useIsMac();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [recent, setRecent] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latestQuery = useRef("");

  // recentVersion muda a cada local consultado, para refletir a lista atualizada (RN-UC02.02).
  useEffect(() => {
    getRecentPlaces().then(setRecent);
  }, [recentVersion]);

  // Ctrl/⌘+K aciona o campo de busca de qualquer ponto do mapa (passo 1 do fluxo principal).
  useEffect(() => {
    function handleShortcut(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    setActive(-1);
    latestQuery.current = value;
    searchPlaces(value, t.categories).then((found) => {
      if (latestQuery.current === value) setResults(found);
    });
  }

  function select(place: Place) {
    setQuery(place.name);
    setOpen(false);
    onSelect(place);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showList || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[Math.max(active, 0)]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // FE-01.02: campo vazio não dispara busca nem abre a lista.
  const trimmed = query.trim();
  const showList = open && trimmed.length > 0;
  const tooShort = trimmed.length < MIN_SEARCH_CHARS;

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl bg-white p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <svg aria-hidden className="ml-2 size-5 shrink-0 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `search-option-${active}` : undefined}
              aria-label={t.search.label}
              placeholder={t.search.placeholder}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
            />
            {showList && (
              <ul
                id="search-suggestions"
                role="listbox"
                className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-slate-300 bg-white shadow-lg"
              >
                {tooShort ? (
                  <li className="px-3 py-2 text-sm text-slate-600">{t.search.minChars}</li>
                ) : results.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-600">{t.search.noResults}</li>
                ) : (
                  results.map((p, i) => (
                    <li key={p.id} id={`search-option-${i}`} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => select(p)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 ${
                          i === active ? "bg-slate-100" : ""
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="shrink-0 text-xs text-slate-500">{t.categories[p.category]}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            aria-label={locating ? t.search.locating : t.search.myLocation}
            title={locating ? t.search.locating : t.search.myLocation}
            className="relative grid size-10 shrink-0 place-items-center rounded-lg bg-brand-yellow text-navy-900 shadow-sm hover:brightness-95 focus-visible:outline-2 focus-visible:outline-navy-900 disabled:cursor-wait"
          >
            <svg aria-hidden className={`size-5 ${locating ? "animate-pulse" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <circle cx="12" cy="12" r="7" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
            <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-red-600 ring-2 ring-brand-yellow" />
          </button>
          <kbd
            title={t.search.shortcut}
            className="hidden h-7 shrink-0 items-center rounded-md bg-slate-100 px-2 font-sans text-xs font-semibold text-slate-600 sm:flex"
          >
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
          <button
            type="button"
            aria-label={t.search.filters}
            title={t.search.filters}
            className="hidden size-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 sm:grid"
          >
            <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="8" cy="17" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* FA-01.02: seleção direta pelos últimos acessos */}
      {recent.length > 0 && (
        <div className="mt-2 hidden items-center gap-x-1 overflow-hidden whitespace-nowrap rounded-lg bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow sm:flex">
          <svg aria-hidden className="size-3.5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5M12 7v5l3 2" />
          </svg>
          <span className="shrink-0 font-semibold text-navy-900">{t.search.recent}</span>
          {recent.map((p, i) => (
            <span key={p.id} className="flex shrink-0 items-center gap-1">
              {i > 0 && <span aria-hidden>•</span>}
              <button
                type="button"
                onClick={() => select(p)}
                title={p.name}
                className="rounded px-1 hover:bg-slate-100 hover:text-navy-900 hover:underline"
              >
                {p.name.length <= 26 ? p.name : p.shortName}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
