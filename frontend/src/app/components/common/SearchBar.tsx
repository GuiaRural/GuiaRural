"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { getRecentPlaces, searchPlaces } from "../../services/placesService";

export default function SearchBar() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [recent, setRecent] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const latestQuery = useRef("");

  useEffect(() => {
    getRecentPlaces().then(setRecent);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    latestQuery.current = value;
    searchPlaces(value).then((found) => {
      if (latestQuery.current === value) setResults(found);
    });
  }

  function select(place: Place) {
    setQuery(place.name);
    setOpen(false);
  }

  const showList = open && query.trim().length > 0;

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
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls="search-suggestions"
              aria-label={t.search.label}
              placeholder={t.search.placeholder}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
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
                {results.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-600">{t.search.noResults}</li>
                ) : (
                  results.map((p) => (
                    <li key={p.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => select(p)}
                        className="w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100"
                      >
                        {p.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button
            type="button"
            aria-label={t.search.myLocation}
            title={t.search.myLocation}
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-yellow text-navy-900 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-navy-900"
          >
            <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="7" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </button>
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

      {recent.length > 0 && (
        <p className="mt-2 hidden truncate rounded-lg bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow sm:block">
          <span className="font-semibold">{t.search.recent}</span>{" "}
          {recent.map((p) => p.name).join(" • ")}
        </p>
      )}
    </div>
  );
}
