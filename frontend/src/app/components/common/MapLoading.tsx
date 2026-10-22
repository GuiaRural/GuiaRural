"use client";

import { useLanguage } from "../../context/LanguageContext";

// Ocupa o lugar do mapa enquanto o Leaflet (só cliente) é carregado.
export default function MapLoading() {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      className="absolute inset-0 grid place-items-center bg-[#e6efdc] bg-[radial-gradient(circle,#c9d9b8_1px,transparent_1px)] [background-size:24px_24px]"
    >
      <div className="mx-6 max-w-sm rounded-xl bg-white/90 p-5 text-center shadow">
        <p className="font-semibold text-navy-900">{t.map.title}</p>
        <p className="mt-1 text-sm text-slate-700">{t.map.loading}</p>
      </div>
    </div>
  );
}
