'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function MapLoading() {
  let loadingText = 'Carregando mapa da UFRPE...';

  try {
    const { t } = useLanguage();
    if (t?.map?.loading) {
      loadingText = t.map.loading;
    }
  } catch (e) {
    // Fallback seguro caso o contexto ainda não esteja montado
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/80">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-700">{loadingText}</p>
      </div>
    </div>
  );
}