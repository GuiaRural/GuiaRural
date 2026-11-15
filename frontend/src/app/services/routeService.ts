import { isInsideCampus, pathMeters, walkingMinutes, type LatLng } from "../lib/geo";
import { buildNetwork, type Network } from "../lib/routing/network";
import { findRoute } from "../lib/routing/router";

// Facade do provedor de rotas (RNF08). O provedor de hoje é o grafo de caminhada do campus (OpenStreetMap, ver
// docs/plano-rota-malha-viaria.md), carregado do próprio site e calculado no navegador: a posição do usuário não vai
// a nenhum serviço externo (RNF04). Trocar de provedor é mexer só neste arquivo.

export type Route = {
  // Desenho completo, do ponto de partida ao de chegada (também serve para enquadrar o mapa).
  points: LatLng[];
  // Trecho pelas vias mapeadas: vai em linha cheia.
  solid: LatLng[];
  // Trechos que não são via mapeada, em linha tracejada: o acesso da origem e do destino até a via mais próxima
  // e, na estimativa, a linha reta inteira.
  dashed: LatLng[][];
  meters: number;
  minutes: number;
  // "straight": estimativa em linha reta (rede indisponível, sem caminho ou ponto longe das vias). A tela avisa.
  source: "network" | "straight";
  // Parte do trajeto que é escada (só informativo).
  stepsMeters: number;
};

export const GRAPH_URL = "/campus-graph.json";

// O grafo é pequeno e muda só quando alguém regera o arquivo: uma carga por sessão. Se falhar, a próxima rota
// tenta de novo (e enquanto isso todas caem na estimativa).
let networkPromise: Promise<Network | null> | null = null;

function loadNetwork(): Promise<Network | null> {
  networkPromise ??= fetch(GRAPH_URL, { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(buildNetwork)
    .catch(() => {
      networkPromise = null;
      return null;
    });
  return networkPromise;
}

// Para testes e para quem regerar o grafo com o site aberto.
export function resetRouteCache() {
  networkPromise = null;
}

function straightRoute(origin: LatLng, destination: LatLng): Route {
  const meters = Math.round(pathMeters([origin, destination]));
  return { points: [origin, destination], solid: [], dashed: [[origin, destination]], meters, minutes: walkingMinutes(meters), source: "straight", stepsMeters: 0 };
}

// Trecho de acesso menor que isso (origem já em cima da via) não vale desenhar.
const MIN_ACCESS_METERS = 1;

export async function computeRoute(origin: LatLng, destination: LatLng): Promise<Route> {
  const network = await loadNetwork();
  if (!network) return straightRoute(origin, destination);
  const found = findRoute(network, origin, destination);
  if (!found) return straightRoute(origin, destination);
  const meters = Math.round(found.meters);
  const dashed: LatLng[][] = [];
  if (found.accessMeters.start >= MIN_ACCESS_METERS) dashed.push([origin, found.network[0]]);
  if (found.accessMeters.end >= MIN_ACCESS_METERS) dashed.push([found.network[found.network.length - 1], destination]);
  return { points: found.points, solid: found.network, dashed, meters, minutes: walkingMinutes(meters), source: "network", stepsMeters: Math.round(found.stepsMeters) };
}

// useApi aceita um argumento só: origem e destino vão juntos numa chave de texto ("lat,lng>lat,lng"). Chave vazia = sem rota.
export type RouteKey = string;
export const NO_ROUTE: RouteKey = "";
const fixed = (value: number) => value.toFixed(6);

export function routeKey(origin: LatLng, destination: LatLng): RouteKey {
  return `${fixed(origin.lat)},${fixed(origin.lng)}>${fixed(destination.lat)},${fixed(destination.lng)}`;
}

function parseKey(key: RouteKey): { origin: LatLng; destination: LatLng } | null {
  const match = key.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)>(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (!match) return null;
  const [lat1, lng1, lat2, lng2] = match.slice(1).map(Number);
  return { origin: { lat: lat1, lng: lng1 }, destination: { lat: lat2, lng: lng2 } };
}

// Nunca rejeita: sem rede, cai na estimativa. Chave vazia ou inválida devolve null.
export async function getRoute(key: RouteKey): Promise<Route | null> {
  const parsed = parseKey(key);
  return parsed ? computeRoute(parsed.origin, parsed.destination) : null;
}

export type GpsResult =
  | { ok: true; point: LatLng }
  | { ok: false; reason: "unavailable" | "denied" | "outside" };

// RN-01 do UC10: rotas só dentro do campus Sede. Fora dele, o usuário escolhe a origem manualmente.
export function getCurrentCampusPosition(): Promise<GpsResult> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ ok: false, reason: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve(isInsideCampus(coords) ? { ok: true, point: coords } : { ok: false, reason: "outside" });
      },
      (err) => resolve({ ok: false, reason: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}
