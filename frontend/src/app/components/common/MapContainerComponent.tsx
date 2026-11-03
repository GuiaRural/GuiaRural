'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone customizado para os marcadores no mapa
const customIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="
    background-color: #F59E0B;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export interface LocationData {
  id: string;
  name: string;
  category: string;
  campus: string;
  lat: number;
  lng: number;
  image: string;
  distance: string;
  timeOnFoot: string;
  isOpen: boolean;
  hours: string;
  accessibility: string[];
  description: string;
}

interface MapProps {
  locations: LocationData[];
  onSelectLocation: (loc: LocationData) => void;
  center: [number, number];
}

export default function MapContainerComponent({ locations, onSelectLocation, center }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      {/* Camada do mapa OpenStreetMap ou CartoDB Positron */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => onSelectLocation(loc),
          }}
        />
      ))}
    </MapContainer>
  );
}