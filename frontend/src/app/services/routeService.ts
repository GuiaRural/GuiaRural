import { isInsideCampus, pathMeters, walkingMinutes, type LatLng } from "../lib/geo";

export type Route = { points: LatLng[]; meters: number; minutes: number };

// Facade do provedor de rotas (RNF08). Hoje liga origem e destino em linha reta, o que subestima a
// distância real a pé; a troca por um provedor com malha viária (ex.: OSRM) acontece só aqui.
export function computeRoute(origin: LatLng, destination: LatLng): Route {
  const points = [origin, destination];
  const meters = Math.round(pathMeters(points));
  return { points, meters, minutes: walkingMinutes(meters) };
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
