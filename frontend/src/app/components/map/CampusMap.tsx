"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useLanguage } from "../../context/LanguageContext";
import { CAMPUS_BOUNDS, MAP_MAX_BOUNDS, MAP_MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "../../data/mapConfig";
import type { LatLng } from "../../lib/geo";

// Mapa do campus em Leaflet + OpenStreetMap (RF01). Carregado só no cliente (ver MapExplorer):
// o Leaflet acessa `window` ao ser importado.

export type MapMarker = { id: string; label: string; point: LatLng; kind: "place" | "gate" };

// Pede que o mapa se mova até `point`; um objeto novo a cada pedido, mesmo para o mesmo ponto.
export type MapFocus = { point: LatLng; zoom?: number };

const FOCUS_ZOOM = 17;

// divIcon em vez do ícone padrão: o Leaflet resolve as imagens do marcador por URL relativa,
// o que quebra com o bundler, e assim também evitamos baixar PNGs extras (RNF01).
function dotIcon(kind: MapMarker["kind"], selected: boolean) {
  const color = kind === "gate" ? "bg-emerald-600" : "bg-brand-yellow";
  const size = selected ? 28 : 22;
  const ring = selected ? "ring-4 ring-brand-yellow/50" : "";
  return L.divIcon({
    className: "",
    html: `<span class="block size-full rounded-full border-2 border-white shadow-md ${color} ${ring}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ICONS = {
  place: dotIcon("place", false),
  placeSelected: dotIcon("place", true),
  gate: dotIcon("gate", false),
  gateSelected: dotIcon("gate", true),
};

const pinIcon = L.divIcon({
  className: "",
  html: '<svg aria-hidden class="size-10 text-red-600 drop-shadow-lg" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="currentColor" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function iconFor(kind: MapMarker["kind"], selected: boolean) {
  if (kind === "gate") return selected ? ICONS.gateSelected : ICONS.gate;
  return selected ? ICONS.placeSelected : ICONS.place;
}

// Zoom mínimo = o que ainda mostra MAP_MAX_BOUNDS inteiro, então o usuário vê o campus todo mas não
// se afasta mais que isso. Recalcula ao redimensionar, pois depende do tamanho da janela.
function LockToCampus() {
  const map = useMap();

  useEffect(() => {
    const apply = () => map.setMinZoom(map.getBoundsZoom(MAP_MAX_BOUNDS));
    apply();
    map.on("resize", apply);
    return () => {
      map.off("resize", apply);
    };
  }, [map]);

  return null;
}

function FocusOn({ focus }: { focus?: MapFocus | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.setView([focus.point.lat, focus.point.lng], Math.max(map.getZoom(), focus.zoom ?? FOCUS_ZOOM));
  }, [map, focus]);

  return null;
}

// Clique no mapa (fora de marcadores, que não propagam o clique).
function MapClicks({ onClick }: { onClick: (point: LatLng) => void }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function RecenterControl({ label }: { label: string }) {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);

  // Sem isso, clicar ou arrastar sobre o botão também moveria o mapa.
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute bottom-[100px] right-[10px] z-[1000] overflow-hidden rounded-[4px] border-2 border-black/20 bg-white"
    >
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => map.fitBounds(CAMPUS_BOUNDS)}
        className="grid size-[30px] place-items-center text-navy-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-900"
      >
        <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function CampusMap({
  markers,
  selectedId,
  onSelectMarker,
  onBackgroundClick,
  route,
  pin,
  onPinMove,
  initialCenter,
  focus,
}: {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelectMarker?: (id: string) => void;
  onBackgroundClick?: () => void;
  route?: LatLng[] | null;
  pin?: LatLng | null;
  onPinMove?: (point: LatLng) => void;
  initialCenter?: LatLng;
  focus?: MapFocus | null;
}) {
  const { t } = useLanguage();
  const routeLine = route && route.length > 1 ? route.map((p): [number, number] => [p.lat, p.lng]) : null;

  // A visão inicial só vale na montagem: rota enquadra o trajeto, local selecionado centraliza nele
  // e, sem nenhum dos dois, mostra o campus inteiro.
  const view = routeLine
    ? { bounds: L.latLngBounds(routeLine), boundsOptions: { padding: [90, 90] as [number, number] } }
    : initialCenter
      ? { center: [initialCenter.lat, initialCenter.lng] as [number, number], zoom: FOCUS_ZOOM }
      : { bounds: CAMPUS_BOUNDS };

  return (
    <MapContainer
      {...view}
      maxBounds={MAP_MAX_BOUNDS}
      maxBoundsViscosity={1}
      maxZoom={MAP_MAX_ZOOM}
      zoomControl={false}
      className="absolute inset-0"
      aria-label={t.map.label}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAP_MAX_ZOOM} />
      <LockToCampus />
      <FocusOn focus={focus} />
      <MapClicks onClick={(point) => (onPinMove ? onPinMove(point) : onBackgroundClick?.())} />
      <ZoomControl position="bottomright" zoomInTitle={t.map.zoomIn} zoomOutTitle={t.map.zoomOut} />
      <RecenterControl label={t.map.recenter} />

      {routeLine && (
        <>
          <Polyline positions={routeLine} pathOptions={{ color: "#ffffff", weight: 10, lineCap: "round", lineJoin: "round" }} />
          <Polyline positions={routeLine} pathOptions={{ color: "#2563eb", weight: 5, lineCap: "round", lineJoin: "round" }} />
          <CircleMarker
            center={routeLine[0]}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
          />
        </>
      )}

      {markers.map((m) => {
        const selected = m.id === selectedId;
        return (
          <Marker
            key={m.id}
            position={[m.point.lat, m.point.lng]}
            icon={iconFor(m.kind, selected)}
            title={m.label}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelectMarker?.(m.id) }}
          >
            <Tooltip permanent direction="bottom" offset={[0, 12]}>
              {m.label}
            </Tooltip>
          </Marker>
        );
      })}

      {pin && (
        <Marker
          position={[pin.lat, pin.lng]}
          icon={pinIcon}
          draggable={Boolean(onPinMove)}
          title="Pin do local"
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              onPinMove?.({ lat, lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
