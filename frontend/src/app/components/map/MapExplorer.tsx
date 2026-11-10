"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../services/placesService";
import { useApi } from "../../hooks/useApi";
import { useSelectedPlaceId } from "../../hooks/useSelectedPlaceId";
import type { LatLng } from "../../lib/geo";
import { addRecentPlace, getPublicPlaces } from "../../services/placesService";
import { computeRoute } from "../../services/routeService";
import ApiFailure from "../courses/ApiFailure";
import LanguageSwitcher from "../common/LanguageSwitcher";
import MapLoading from "../common/MapLoading";
import SearchBar from "../common/SearchBar";
import PlaceCard from "../places/PlaceCard";
import type { MapFocus, MapMarker } from "./CampusMap";

// ssr: false só funciona em Client Component, por isso o carregamento fica aqui e não na page.
const CampusMap = dynamic(() => import("./CampusMap"), { ssr: false, loading: () => <MapLoading /> });

// Origem da rota vinda da URL: id de um local/portaria ou "gps:lat,lng".
function parseOrigin(raw: string | undefined, places: Place[]): { label: string | null; point: LatLng } | null {
  if (!raw) return null;
  if (raw.startsWith("gps:")) {
    const [lat, lng] = raw.slice(4).split(",").map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { label: null, point: { lat, lng } } : null;
  }
  const place = places.find((p) => p.id === raw);
  return place?.position ? { label: place.name, point: place.position } : null;
}

export default function MapExplorer({ focusId, routeTo, routeFrom }: { focusId?: string; routeTo?: string; routeFrom?: string }) {
  const { t } = useLanguage();
  const state = useApi(getPublicPlaces, null);
  const { selectedId: urlLocal, select: setSelectedPlaceInUrl } = useSelectedPlaceId();
  const [selectedId, setSelectedId] = useState<string | null>(routeTo ?? focusId ?? null);
  const [seenUrlLocal, setSeenUrlLocal] = useState(urlLocal);
  const [recentVersion, setRecentVersion] = useState(0);
  const [focus, setFocus] = useState<MapFocus | null>(null);

  // O ?local= da URL manda na seleção: "voltar"/"avançar" do navegador abrem e fecham o cartão.
  if (seenUrlLocal !== urlLocal) {
    setSeenUrlLocal(urlLocal);
    setSelectedId(urlLocal);
  }

  function deselect() {
    setSelectedId(null);
    setSelectedPlaceInUrl(null);
  }

  if (state.status === "loading") {
    return <div className="absolute inset-0 grid place-items-center bg-[#e6efdc] text-sm text-slate-600">{t.common.loading}</div>;
  }
  if (state.status === "error") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#e6efdc] p-4">
        <ApiFailure error={state.error} onRetry={state.retry} />
      </div>
    );
  }
  const places = state.data;

  const selected = places.find((p) => p.id === selectedId) ?? null;
  const destination = routeTo ? places.find((p) => p.id === routeTo) : undefined;
  const origin = parseOrigin(routeFrom, places);
  const route = destination?.position && origin ? computeRoute(origin.point, destination.position) : null;

  const markers: MapMarker[] = places.map((p) => ({
    id: p.id,
    label: p.shortName,
    point: p.position!,
    kind: p.category === "portaria" ? "gate" : "place",
  }));

  function select(place: Place) {
    setSelectedId(place.id);
    setSelectedPlaceInUrl(place.id);
    addRecentPlace(place.id);
    setRecentVersion((v) => v + 1);
    if (place.position) setFocus({ point: place.position });
  }

  return (
    <>
      {/* isolate cria um contexto de empilhamento: os painéis do Leaflet usam z-index até 1000
          e, sem isso, ficariam por cima da busca e do seletor de idioma. */}
      <div className="absolute inset-0 isolate">
        <CampusMap
          markers={markers}
          selectedId={selectedId}
          onSelectMarker={(id) => {
            const place = places.find((p) => p.id === id);
            if (place) select(place);
          }}
          onBackgroundClick={deselect}
          route={route?.points}
          initialCenter={selected?.position ?? undefined}
          focus={focus}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3 sm:p-4">
        <div className="pointer-events-auto w-full max-w-2xl">
          <SearchBar onSelect={select} recentVersion={recentVersion} />
        </div>
      </div>
      <div className="absolute right-3 top-24 z-10 sm:right-5 sm:top-28">
        <LanguageSwitcher />
      </div>

      {route && destination && (
        <section
          aria-live="polite"
          className="absolute left-3 top-24 z-10 w-[calc(100%-6rem)] max-w-xs rounded-2xl bg-white p-4 shadow-xl sm:left-5 sm:top-32"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">{t.route.to}</p>
          <h2 className="font-bold text-navy-900">{destination.name}</h2>
          <p className="mt-1 text-xs text-slate-600">
            {t.route.from}: {origin?.label ?? t.route.yourLocation}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 p-2">
              <dt className="text-[11px] text-slate-600">{t.route.distance}</dt>
              <dd className="text-lg font-bold text-navy-900">
                {route.meters} {t.common.meters}
              </dd>
            </div>
            <div className="rounded-lg bg-blue-50 p-2">
              <dt className="text-[11px] text-slate-600">{t.route.time}</dt>
              <dd className="text-lg font-bold text-navy-900">
                {route.minutes} {t.common.minutes}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-500">{t.placePage.externalOnly}</p>
          <Link
            href="/"
            className="mt-3 block rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t.route.end}
          </Link>
        </section>
      )}

      {selected && !route && (
        <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-auto sm:bottom-5 sm:left-5">
          <PlaceCard key={selected.id} place={selected} onClose={deselect} />
        </div>
      )}
    </>
  );
}
