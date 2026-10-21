import { MOCK_PLACES, MOCK_RECENT_IDS, type Place } from "../data/mockPlaces";

// Ponto único de acesso aos locais: hoje usa mock, depois trocar por fetch("/api/...")
// sem alterar os componentes.
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_PLACES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
}

// Locais com coordenadas, prontos para virar marcador no mapa.
export async function getMapPlaces(): Promise<Place[]> {
  return MOCK_PLACES.filter((p) => p.coords !== undefined);
}

export async function getRecentPlaces(): Promise<Place[]> {
  return MOCK_RECENT_IDS.map((id) => MOCK_PLACES.find((p) => p.id === id)).filter(
    (p): p is Place => Boolean(p),
  );
}
