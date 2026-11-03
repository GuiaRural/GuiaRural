'use client';

import React, { Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import SearchBar from './components/common/SearchBar';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import MapView from './components/common/MapView';
import PlaceCard from './components/common/PlaceCard';

export default function Home() {
  return (
    <LanguageProvider>
      <div className="relative h-full w-full">
        {/* Mapa Interativo */}
        <MapView />

        {/* SearchBar Flutuante */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center p-3 sm:p-4 pointer-events-none">
          <div className="pointer-events-auto">
            <SearchBar />
          </div>
        </div>

        {/* Seletor de Idioma */}
        <div className="absolute right-6 top-6 z-10">
          <LanguageSwitcher />
        </div>

        {/* PlaceCard lê ?local= da URL via useSearchParams wrapped em Suspense */}
        <Suspense fallback={null}>
          <PlaceCard />
        </Suspense>
      </div>
    </LanguageProvider>
  );
}