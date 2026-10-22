import { isInsideCampus, pathMeters, toPoint, walkingMinutes, type LatLng, type Point } from "../lib/geo";

export type Route = { points: Point[]; meters: number; minutes: number };

// Avenida principal do mapa mock: as rotas seguem por ela até a altura do destino.
const MAIN_ROAD_Y = 380;

// Facade do provedor de rotas (RNF08). Hoje calcula um trajeto aproximado pelas vias do mapa mock;
// a troca por um provedor real (ex.: OSRM) acontece só aqui.
export function computeRoute(origin: Point, destination: Point): Route {
  const points: Point[] = [
    origin,
    { x: origin.x, y: MAIN_ROAD_Y },
    { x: destination.x, y: MAIN_ROAD_Y },
    destination,
  ];
  const meters = Math.round(pathMeters(points));
  return { points, meters, minutes: walkingMinutes(meters) };
}

export type GpsResult =
  | { ok: true; point: Point }
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
        resolve(isInsideCampus(coords) ? { ok: true, point: toPoint(coords) } : { ok: false, reason: "outside" });
      },
      (err) => resolve({ ok: false, reason: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}
