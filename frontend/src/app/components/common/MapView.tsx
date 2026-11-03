"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";

// ssr: false só funciona em Client Component; por isso este wrapper existe separado da page.
const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false, loading: () => <MapLoading /> });

// `isolate` cria um contexto de empilhamento: os painéis do Leaflet usam z-index até 1000
// e, sem isso, ficariam por cima da busca e do seletor de idioma.
export default function MapView() {
  return (
    <div className="absolute inset-0 isolate">
      <MapCanvas />
    </div>
  );
}
