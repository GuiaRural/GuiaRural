import type { LatLng } from "./geo";

// Endereço da Home que desenha a rota (UC10): ?rota=<destino>&origem=<id do local ou gps:lat,lng>.
// É o formato que o MapExplorer já entende; a posição nunca sai do navegador (RNF04).
export type RouteOrigin = { placeId: string } | { gps: LatLng };

export function routeHref(destinationId: string, origin: RouteOrigin): string {
  const from = "gps" in origin ? `gps:${origin.gps.lat.toFixed(6)},${origin.gps.lng.toFixed(6)}` : origin.placeId;
  // Slugs só têm letras, números e hífen; ":" e "," ficam legíveis na URL, como já eram.
  return `/?rota=${destinationId}&origem=${from}`;
}
