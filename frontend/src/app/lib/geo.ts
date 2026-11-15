import { CAMPUS_BOUNDS } from "../data/mapConfig";

export type LatLng = { lat: number; lng: number };

export function isInsideCampus({ lat, lng }: LatLng): boolean {
  const [[south, west], [north, east]] = CAMPUS_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

// Distância equirretangular: suficiente na escala de um campus.
export function metersBetween(a: LatLng, b: LatLng): number {
  const meanLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const dx = (b.lng - a.lng) * 111_320 * Math.cos(meanLat);
  const dy = (b.lat - a.lat) * 110_574;
  return Math.hypot(dx, dy);
}

// Menor distância de um ponto a um segmento a-b, na mesma aproximação plana de metersBetween.
// Devolve também o ponto do segmento mais próximo (para encaixar um local numa via).
export function nearestOnSegment(p: LatLng, a: LatLng, b: LatLng): { point: LatLng; meters: number; t: number } {
  const kx = 111_320 * Math.cos((p.lat * Math.PI) / 180);
  const ky = 110_574;
  const ax = (a.lng - p.lng) * kx;
  const ay = (a.lat - p.lat) * ky;
  const dx = (b.lng - a.lng) * kx;
  const dy = (b.lat - a.lat) * ky;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  const point = { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
  return { point, meters: Math.hypot(ax + t * dx, ay + t * dy), t };
}

export function pathMeters(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += metersBetween(points[i - 1], points[i]);
  return total;
}

const WALK_METERS_PER_MINUTE = 80;

export function walkingMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_METERS_PER_MINUTE));
}

export function formatCoord(value: number): string {
  return value.toFixed(5);
}
