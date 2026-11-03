"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { useLanguage } from "../../context/LanguageContext";
import { CAMPUS_BOUNDS, MAP_MAX_BOUNDS, MAP_MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "../../data/mapConfig";
import type { Place } from "../../data/mockPlaces";
import { useSelectedPlaceId } from "../../hooks/useSelectedPlaceId";
import { getMapPlaces } from "../../services/placesService";

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// divIcon em vez do ícone padrão: o Leaflet resolve as imagens do marcador por URL relativa,
// o que quebra com o bundler, e assim também evitamos baixar PNGs extras (RNF01).
// O nome fica dentro do ícone (posição absoluta abaixo do ponto), então clicar nele também seleciona.
// Fundo azul-marinho no nome para ficar legível sobre os tiles do OSM.
function markerIcon(name: string, selected: boolean) {
  const dot = selected
    ? "size-6 -m-0.5 ring-4 ring-navy-900"
    : "size-5 ring-4 ring-brand-yellow/30";
  return L.divIcon({
    className: "",
    html: `<span class="block rounded-full bg-brand-yellow shadow ${dot}"></span><span class="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-navy-900/85 px-1.5 py-0.5 text-[11px] font-semibold text-brand-yellow">${escapeHtml(name)}</span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
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

// Selecionar pela busca pode escolher um local fora da área visível: desliza o mapa até ele.
function PanToSelected({ place }: { place?: Place }) {
  const map = useMap();
  const coords = place?.coords;

  useEffect(() => {
    if (coords && !map.getBounds().contains([coords.lat, coords.lng])) map.panTo([coords.lat, coords.lng]);
  }, [map, coords]);

  return null;
}

// Carregado só no cliente (ver MapView): o Leaflet acessa `window` ao ser importado.
export default function MapCanvas() {
  const { t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  const { selectedId, select } = useSelectedPlaceId();

  useEffect(() => {
    getMapPlaces().then(setPlaces);
  }, []);

  return (
    <MapContainer
      bounds={CAMPUS_BOUNDS}
      maxBounds={MAP_MAX_BOUNDS}
      maxBoundsViscosity={1}
      maxZoom={MAP_MAX_ZOOM}
      zoomControl={false}
      className="absolute inset-0"
      aria-label={t.map.title}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAP_MAX_ZOOM} />
      <LockToCampus />
      <PanToSelected place={places.find((p) => p.id === selectedId)} />
      <ZoomControl position="bottomright" zoomInTitle={t.map.zoomIn} zoomOutTitle={t.map.zoomOut} />
      {places.map(
        (p) =>
          p.coords && (
            <Marker
              key={p.id}
              position={[p.coords.lat, p.coords.lng]}
              icon={markerIcon(p.name, p.id === selectedId)}
              title={p.name}
              zIndexOffset={p.id === selectedId ? 1000 : 0}
              eventHandlers={{ click: () => select(p.id) }}
            />
          ),
      )}
    </MapContainer>
  );
}
