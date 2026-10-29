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
  // A própria origem não mostra distância (seria "0 m").
  const route = place.position && origin?.position && origin.id !== place.id ? computeRoute(origin.position, place.position) : null;
  // Horário e acessibilidade podem não estar cadastrados: sem o dado, a tela não afirma "fechado" nem "sem recursos".
  const hasHours = place.hours !== "";
  const open = hasHours && isOpenNow(place.hours);

  return (
    <section
      aria-label={place.name}
      className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-80"
    >
      <div className="relative">
        <PlacePhoto place={place} className="h-32" />
        <span className="absolute left-3 top-3 rounded-full bg-navy-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {t.categories[place.category]}
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
        <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-[11px] font-semibold">
          {route && (
            <span className="rounded-full bg-navy-900/85 px-2 py-0.5 text-white" title={t.placeCard.fromOrigin}>
              {route.minutes} {t.common.minutes} {t.placeCard.walk} • {route.meters} {t.common.meters}
            </span>
          )}
          {hasHours && (
            <span className={`rounded-full px-2 py-0.5 text-white ${open ? "bg-emerald-600" : "bg-slate-600"}`}>
              {open ? t.placeCard.openNow : t.placeCard.closed}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-bold leading-tight text-navy-900">{place.name}</h2>
            <p className="text-xs text-slate-600">{place.address}</p>
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

        {(hasHours || place.accessibility.length > 0) && (
          <dl className="grid grid-cols-2 gap-2 text-xs">
            {hasHours && (
              <div className="rounded-lg bg-slate-50 p-2">
                <dt className="text-slate-500">{t.placeCard.hours}</dt>
                <dd className="font-semibold text-slate-900">{place.hours.replaceAll("-", "–")}</dd>
              </div>
            )}
            {place.accessibility.length > 0 && (
              <div className="rounded-lg bg-slate-50 p-2">
                <dt className="text-slate-500">{t.accessibility.title}</dt>
                <dd className="font-semibold text-slate-900">
                  {place.accessibility.map((a) => t.accessibility[a]).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        )}

        {place.description && <p className="line-clamp-3 text-xs text-slate-700">{place.description}</p>}

        <Link
          href={`/locais/${place.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-yellow px-3 py-2.5 text-sm font-bold text-navy-900 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-navy-900"
        >
          {t.placeCard.viewFull}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
