"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { useLanguage } from "../../context/LanguageContext";
import { CAMPUS_BOUNDS, MAP_MAX_BOUNDS, MAP_MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "../../data/mapConfig";
import type { Place } from "../../data/mockPlaces";
import { getMapPlaces } from "../../services/placesService";

// divIcon em vez do ícone padrão: o Leaflet resolve as imagens do marcador por URL relativa,
// o que quebra com o bundler, e assim também evitamos baixar PNGs extras (RNF01).
const markerIcon = L.divIcon({
  className: "",
  html: '<span class="block size-5 rounded-full border-2 border-brand-yellow bg-navy-700 shadow"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

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

// Carregado só no cliente (ver MapView): o Leaflet acessa `window` ao ser importado.
export default function MapCanvas() {
  const { t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);

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
      <ZoomControl position="bottomright" zoomInTitle={t.map.zoomIn} zoomOutTitle={t.map.zoomOut} />
      {places.map(
        (p) =>
          p.coords && (
            <Marker key={p.id} position={[p.coords.lat, p.coords.lng]} icon={markerIcon} title={p.name}>
              <Popup>{p.name}</Popup>
            </Marker>
          ),
      )}
    </MapContainer>
  );
}
