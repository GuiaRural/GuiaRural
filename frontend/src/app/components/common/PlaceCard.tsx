"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { useSavedIds } from "../../hooks/useSavedIds";
import { useSelectedPlaceId } from "../../hooks/useSelectedPlaceId";
import { getPlaceById } from "../../services/placesService";
import { formatHours, isOpenAt } from "../../utils/openingHours";
import Icon from "./Icon";

// Compartilhada com a página completa do local, para o "salvo" ser o mesmo nos dois.
export const SAVED_PLACES_KEY = "guiarural:locais:salvos";

// Card do local selecionado no mapa (?local=id). Id inexistente ou falha ao carregar: não mostra nada.
export default function PlaceCard() {
  const { t } = useLanguage();
  const { selectedId, select } = useSelectedPlaceId();
  const { ids, toggle } = useSavedIds(SAVED_PLACES_KEY);
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    let ignore = false;
    getPlaceById(selectedId)
      .then((found) => {
        if (!ignore) setPlace(found);
      })
      .catch(() => {
        if (!ignore) setPlace(null);
      });
    return () => {
      ignore = true;
    };
  }, [selectedId]);

  // Compara o id para não mostrar o local anterior enquanto o novo carrega.
  if (!place || place.id !== selectedId) return null;

  const saved = ids.includes(place.id);
  const open = isOpenAt(place.hours, new Date());
  const titleId = `place-card-${place.id}`;

  // No celular o card deixa livres a coluna dos botões de zoom (right-14) e a linha do crédito do OSM
  // (bottom-7), que precisa ficar sempre visível. A partir de sm ele fica no canto, longe de ambos.
  return (
    <section
      aria-labelledby={titleId}
      className="absolute bottom-7 left-3 right-14 z-10 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[22rem]"
    >
      <div className="relative h-32 bg-navy-900 sm:h-40">
        {place.image && (
          <Image src={place.image.src} alt={place.image.alt} fill sizes="22rem" className="object-cover" />
        )}
        <span className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] items-center gap-1.5 rounded-md bg-navy-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-red-500" />
          <span className="truncate">{place.tag}</span>
        </span>
        <button
          type="button"
          onClick={() => select(null)}
          aria-label={t.place.close}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white text-navy-900 shadow focus-visible:outline-2 focus-visible:outline-brand-yellow"
        >
          <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
        {open !== null && (
          <span
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold text-white ${
              open ? "bg-emerald-600" : "bg-slate-600"
            }`}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-white" />
            {open ? t.place.openNow : t.place.closed}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="font-bold text-navy-900">
              {place.name}
            </h2>
            <p className="text-sm text-slate-600">{place.address}</p>
          </div>
          <button
            type="button"
            onClick={() => toggle(place.id)}
            aria-pressed={saved}
            aria-label={`${saved ? t.place.unsave : t.place.save}: ${place.name}`}
            className="shrink-0 rounded-md p-1 text-slate-500 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-brand-yellow"
          >
            <Icon name="bookmark" className={`size-5 ${saved ? "fill-current text-navy-900" : ""}`} />
          </button>
        </div>

        {place.hours.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <Icon name="clock" className="size-4 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">{t.place.hours}</p>
              <p className="text-sm font-medium text-navy-900">{formatHours(place.hours, t.place.until)}</p>
            </div>
          </div>
        )}

        <p className="line-clamp-2 text-sm text-slate-700">{place.description}</p>

        <Link
          href={`/locais/${encodeURIComponent(place.id)}`}
          className="flex items-center justify-center gap-2 rounded-lg border-l-4 border-navy-900 bg-brand-yellow px-4 py-2.5 text-sm font-bold text-navy-900 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-navy-900"
        >
          {t.place.viewDetails}
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
