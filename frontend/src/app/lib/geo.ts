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
