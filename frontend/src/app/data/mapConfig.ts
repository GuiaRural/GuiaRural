type LatLngBounds = [[number, number], [number, number]]; // [[sul, oeste], [norte, leste]]

// Limites do campus Sede segundo o polígono "Universidade Federal Rural de Pernambuco - UFRPE"
// (amenity=university) do OSM, arredondados. Não é fonte oficial; ajustar se a equipe definir outro recorte.
export const CAMPUS_BOUNDS: LatLngBounds = [
  [-8.02296, -34.9557],
  [-8.01225, -34.9432],
];

// Folga (graus, ~330 m) além do campus para o usuário ver a vizinhança imediata e não perder
// marcadores na borda. O mapa não sai desta área.
const MAX_BOUNDS_PADDING = 0.003;
export const MAP_MAX_BOUNDS: LatLngBounds = [
  [CAMPUS_BOUNDS[0][0] - MAX_BOUNDS_PADDING, CAMPUS_BOUNDS[0][1] - MAX_BOUNDS_PADDING],
  [CAMPUS_BOUNDS[1][0] + MAX_BOUNDS_PADDING, CAMPUS_BOUNDS[1][1] + MAX_BOUNDS_PADDING],
];

// O zoom mínimo não é fixo: MapCanvas o calcula para que a área acima caiba inteira na tela.
export const MAP_MAX_ZOOM = 19;

// Servidor público do OSM: uso moderado, sem prefetch e com atribuição visível
// (https://operations.osmfoundation.org/policies/tiles/). Trocar aqui se o tráfego exigir outro provedor.
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
