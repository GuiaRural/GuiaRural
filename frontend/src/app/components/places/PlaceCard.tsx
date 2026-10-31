"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { isOpenNow } from "../../lib/hours";
import { getDefaultOrigin, isPlaceSaved, toggleSavedPlace } from "../../services/placesService";
import { computeRoute } from "../../services/routeService";
import PlacePhoto from "./PlacePhoto";

// Cartão de informações resumidas (UC02, passo 4). Renderizar com key={place.id}.
export default function PlaceCard({ place, onClose }: { place: Place; onClose: () => void }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(() => isPlaceSaved(place.id));
  const origin = getDefaultOrigin();
  const route = place.position && origin.position ? computeRoute(origin.position, place.position) : null;
  const open = isOpenNow(place.hours);
  const hours = place.hours.replaceAll("-", ` ${t.placeCard.hoursTo} `);

  return (
    <section
      aria-label={place.name}
      className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-[26rem]"
    >
      <div className="relative">
        <PlacePhoto place={place} className="h-36 sm:h-40" />
        <span className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] items-center gap-1.5 rounded-md bg-navy-900/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-red-500" />
          <span className="truncate">
            {t.categories[place.category]} • {place.shortName}
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-slate-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-navy-900"
        >
          <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-xs font-semibold">
          {route && (
            <span className="rounded-md border border-white/40 bg-navy-900/85 px-2 py-0.5 text-white" title={t.placeCard.fromOrigin}>
              {route.minutes} {t.common.minutes} {t.placeCard.walk} • {route.meters} {t.common.meters}
            </span>
          )}
          <span className={`ml-auto rounded-md px-2 py-0.5 text-white ${open ? "bg-emerald-600" : "bg-slate-600"}`}>
            <span aria-hidden>• </span>
            {open ? t.placeCard.openNow : t.placeCard.closed}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold leading-tight text-navy-900">{place.name}</h2>
            <p className="text-sm text-slate-600">{place.address}</p>
          </div>
          {/* FA-02.02: salvar local a partir do mapa */}
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? t.placeCard.saved : t.placeCard.save}
            title={saved ? t.placeCard.saved : t.placeCard.save}
            onClick={() => setSaved(toggleSavedPlace(place.id))}
            className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-900"
          >
            <svg aria-hidden className={`size-5 ${saved ? "fill-brand-yellow text-amber-500" : "fill-none text-slate-500"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12v18l-6-4-6 4V3Z" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <svg aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <div>
              <dt className="text-slate-500">{t.placeCard.hours}</dt>
              <dd className="font-semibold text-slate-900">{hours}</dd>
            </div>
          </div>
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <svg aria-hidden className="mt-0.5 size-4 shrink-0 text-navy-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="4" r="1.6" fill="currentColor" />
              <path d="M11 7v6h5l2 6M11 10h5" />
              <path d="M8 11.5a5 5 0 1 0 7 6" />
            </svg>
            <div>
              <dt className="text-slate-500">{t.accessibility.title}</dt>
              <dd className="font-semibold text-slate-900">
                {place.accessibility.length
                  ? place.accessibility.map((a) => t.accessibility[a]).join(", ")
                  : t.accessibility.none}
              </dd>
            </div>
          </div>
        </dl>

        <p className="line-clamp-3 text-xs text-slate-700">{place.description}</p>

        <Link
          href={`/locais/${place.id}`}
          className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <svg aria-hidden className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
          {t.placeCard.viewFull}
        </Link>
      </div>
    </section>
  );
}
