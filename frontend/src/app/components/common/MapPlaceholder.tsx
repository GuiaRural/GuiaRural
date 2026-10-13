"use client";

import { useLanguage } from "../../context/LanguageContext";

// Substituir por Leaflet + OpenStreetMap (RF01). Mantém o espaço e o contrato visual do mapa.
export default function MapPlaceholder() {
  const { t } = useLanguage();

  return (
    <div
      role="img"
      aria-label={t.map.placeholderTitle}
      className="absolute inset-0 grid place-items-center bg-[#e6efdc] bg-[radial-gradient(circle,#c9d9b8_1px,transparent_1px)] [background-size:24px_24px]"
    >
      <div className="mx-6 max-w-sm rounded-xl bg-white/90 p-5 text-center shadow">
        <p className="font-semibold text-navy-900">{t.map.placeholderTitle}</p>
        <p className="mt-1 text-sm text-slate-700">{t.map.placeholderText}</p>
      </div>
    </div>
  );
}
