"use client";

import Link from "next/link";
import AppShell from "../common/AppShell";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { getPublicPlaces, type Place, type PlaceCategory } from "../../services/placesService";

// Categorias de cada página pública de locais (Fase 7 do plano de integração). Decisão do time em 14/11/2026,
// pendente de confirmação do PO: para mudar o que uma página mostra, edite só esta tabela.
const LISTS = {
  stops: ["portaria"],
  eat: ["alimentacao"],
  study: ["sala", "biblioteca"],
} as const satisfies Record<string, readonly PlaceCategory[]>;

export type PlaceList = keyof typeof LISTS;

const noArg = null;

function belongsTo(list: PlaceList, place: Place) {
  const categories: readonly PlaceCategory[] = LISTS[list];
  return categories.includes(place.category);
}

export default function PlaceCategoryPage({ list }: { list: PlaceList }) {
  const { t } = useLanguage();
  const state = useApi(getPublicPlaces, noArg);

  const places =
    state.status === "ready"
      ? state.data.filter((p) => belongsTo(list, p)).sort((a, b) => a.name.localeCompare(b.name, "pt"))
      : null;

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.sidebar[list]}</h1>
              <p className="mt-1 text-sm text-text-2nd">{t.placeLists.subtitle[list]}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {t.placeLists.portugueseOnly && <p className="mt-4 text-xs text-text-2nd">{t.placeLists.portugueseOnly}</p>}

          <div className="mt-6">
            {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
            {state.status === "error" && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {t.placeLists.error}{" "}
                <button type="button" onClick={state.retry} className="font-semibold underline">
                  {t.placeLists.retry}
                </button>
              </div>
            )}
            {places?.length === 0 && (
              <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.placeLists.empty}</p>
            )}
            {places && places.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {places.map((place) => (
                  <li key={place.id} className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                      {t.categories[place.category]}
                    </p>
                    <h2 lang="pt" className="mt-1 font-bold text-navy-900">
                      {place.name}
                    </h2>
                    {place.address && (
                      <p lang="pt" className="mt-1 text-sm text-slate-600">
                        {place.address}
                      </p>
                    )}
                    {place.hours && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-semibold">{t.placeCard.hours}:</span> {place.hours.replaceAll("-", "–")}
                      </p>
                    )}
                    <Link
                      href={`/locais/${place.id}`}
                      aria-label={`${t.placeLists.viewDetails}: ${place.name}`}
                      className="mt-4 inline-flex items-center gap-1 self-start rounded-md text-sm font-semibold text-navy-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                    >
                      {t.placeLists.viewDetails}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {list === "stops" && state.status === "ready" && (
              <p className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.placeLists.stopsSoon}</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
