// O mapa mock usa um plano de 1000 × 700 unidades sobre o campus Dois Irmãos (Sede).
// Estes limites convertem unidades do plano em latitude/longitude e definem o que é "dentro do campus".
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 700;

export const CAMPUS_BOUNDS = { north: -8.011, south: -8.024, west: -34.954, east: -34.938 };

export type Point = { x: number; y: number };
export type LatLng = { lat: number; lng: number };

export function toLatLng({ x, y }: Point): LatLng {
  return {
    lat: CAMPUS_BOUNDS.north + (y / MAP_HEIGHT) * (CAMPUS_BOUNDS.south - CAMPUS_BOUNDS.north),
    lng: CAMPUS_BOUNDS.west + (x / MAP_WIDTH) * (CAMPUS_BOUNDS.east - CAMPUS_BOUNDS.west),
  };
}

export function toPoint({ lat, lng }: LatLng): Point {
  return {
    x: ((lng - CAMPUS_BOUNDS.west) / (CAMPUS_BOUNDS.east - CAMPUS_BOUNDS.west)) * MAP_WIDTH,
    y: ((lat - CAMPUS_BOUNDS.north) / (CAMPUS_BOUNDS.south - CAMPUS_BOUNDS.north)) * MAP_HEIGHT,
  };
}

export function isInsideCampus({ lat, lng }: LatLng): boolean {
  return (
    lat <= CAMPUS_BOUNDS.north &&
    lat >= CAMPUS_BOUNDS.south &&
    lng >= CAMPUS_BOUNDS.west &&
    lng <= CAMPUS_BOUNDS.east
  );
}

// Distância equirretangular: suficiente na escala de um campus.
export function metersBetween(a: Point, b: Point): number {
  const pa = toLatLng(a);
  const pb = toLatLng(b);
  const meanLat = ((pa.lat + pb.lat) / 2) * (Math.PI / 180);
  const dx = (pb.lng - pa.lng) * 111_320 * Math.cos(meanLat);
  const dy = (pb.lat - pa.lat) * 110_574;
  return Math.hypot(dx, dy);
}

export function pathMeters(points: Point[]): number {
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
