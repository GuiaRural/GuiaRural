'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import SearchBar from './components/common/SearchBar';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import LocationCardModal from './components/common/LocationCardModal';
import { LocationData } from './components/common/MapContainerComponent';

const MapContainerComponent = dynamic(
  () => import('./components/common/MapContainerComponent'),
  { ssr: false }
);

const UFRPE_CENTER: [number, number] = [-8.0169, -34.9506];

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    const mockData: LocationData[] = [
      {
        id: '1',
        name: 'Prédio Central • Reitoria',
        category: 'REITORIA • PRÉDIO CENTRAL',
        campus: 'Campus Universitário Dois Irmãos, Sede',
        lat: -8.0169,
        lng: -34.9506,
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=400',
        distance: '190m',
        timeOnFoot: '3 min a pé',
        isOpen: true,
        hours: '07:00 às 18:00',
        accessibility: ['Rampas', 'Elevador'],
        description: 'Sede administrativa principal da UFRPE, abrigando Gabinete do Reitor, Pró-Reitorias (PROAC, PROGEST, PROGEPE) e Protocolo Geral.'
      }
    ];

    setLocations(mockData);
    setSelectedLocation(mockData[0]);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Mapa Interativo */}
      <MapContainerComponent
        center={UFRPE_CENTER}
        locations={locations}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />

      {/* SearchBar Flutuante */}
      <div className="absolute inset-x-0 top-4 z-10 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar />
        </div>
      </div>

      {/* Seletor de Idioma */}
      <div className="absolute right-6 top-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* Card Flutuante do Local */}
      {selectedLocation && (
        <LocationCardModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}