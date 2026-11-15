import { metersBetween, nearestOnSegment, type LatLng } from "../geo";
import { GRAPH_SCALE, parseGraph } from "./format";

// A rede de caminhada já decodificada: coordenadas em graus, arestas com a geometria de ponta a ponta e a lista
// de arestas de cada nó. Montada uma vez a partir do arquivo public/campus-graph.json.
export type NetEdge = {
  a: number;
  b: number;
  // Comprimento da aresta como está no arquivo (é o que a rota soma).
  meters: number;
  flags: number;
  // Geometria de `a` até `b`, com as duas pontas.
  points: LatLng[];
  // Distância acumulada (geométrica) desde `a` em cada ponto; o último valor é o comprimento geométrico.
  along: number[];
};

export type Network = {
  nodes: LatLng[];
  edges: NetEdge[];
  // Para cada nó: as arestas que passam por ele e o nó do outro lado.
  adjacency: { edge: number; to: number }[][];
  generatedAt: string;
};

export function buildNetwork(raw: unknown): Network {
  const graph = parseGraph(raw);
  const nodes: LatLng[] = [];
  for (let i = 0; i < graph.nodes.length; i += 2) {
    nodes.push({ lat: graph.nodes[i] / GRAPH_SCALE, lng: graph.nodes[i + 1] / GRAPH_SCALE });
  }
  const adjacency: Network["adjacency"] = nodes.map(() => []);
  const edges = graph.edges.map(([a, b, meters, flags, middle], index): NetEdge => {
    const points = [nodes[a]];
    for (let i = 0; i < middle.length; i += 2) points.push({ lat: middle[i] / GRAPH_SCALE, lng: middle[i + 1] / GRAPH_SCALE });
    points.push(nodes[b]);
    const along = [0];
    for (let i = 1; i < points.length; i++) along.push(along[i - 1] + metersBetween(points[i - 1], points[i]));
    adjacency[a].push({ edge: index, to: b });
    adjacency[b].push({ edge: index, to: a });
    return { a, b, meters, flags, points, along };
  });
  return { nodes, edges, adjacency, generatedAt: graph.generatedAt };
}

// Posições ao longo de uma aresta são medidas em metros "oficiais" (os do arquivo) a partir de `a`. A geometria
// quantizada pode diferir uns centímetros do comprimento gravado: esta razão converte de uma medida para a outra.
function scaleOf(edge: NetEdge): number {
  const geometric = edge.along[edge.along.length - 1];
  return geometric === 0 ? 1 : edge.meters / geometric;
}

export type Snap = {
  edge: number;
  // Ponto da rede mais próximo.
  point: LatLng;
  // Distância do ponto de origem até `point` (o trecho de acesso, que não é via).
  meters: number;
  // Posição de `point` na aresta, em metros desde `a`.
  pos: number;
};

// Encaixa um ponto na via mais próxima (em qualquer ponto da aresta, não só nos cruzamentos).
// Devolve null se a via mais próxima estiver a mais de `maxMeters`.
export function snapToNetwork(network: Network, point: LatLng, maxMeters = Infinity): Snap | null {
  let best: { edge: number; segment: number; point: LatLng; meters: number } | null = null;
  network.edges.forEach((edge, index) => {
    for (let i = 1; i < edge.points.length; i++) {
      const found = nearestOnSegment(point, edge.points[i - 1], edge.points[i]);
      if (best === null || found.meters < best.meters) best = { edge: index, segment: i - 1, point: found.point, meters: found.meters };
    }
  });
  if (best === null || (best as { meters: number }).meters > maxMeters) return null;
  const { edge: index, segment, point: snapped, meters } = best as { edge: number; segment: number; point: LatLng; meters: number };
  const edge = network.edges[index];
  const geometric = edge.along[segment] + metersBetween(edge.points[segment], snapped);
  return { edge: index, point: snapped, meters, pos: geometric * scaleOf(edge) };
}

// Ponto da aresta na posição `pos` (metros oficiais desde `a`).
export function pointAt(edge: NetEdge, pos: number): LatLng {
  const total = edge.along[edge.along.length - 1];
  const g = Math.max(0, Math.min(total, pos / scaleOf(edge)));
  for (let i = 1; i < edge.along.length; i++) {
    if (g <= edge.along[i]) {
      const span = edge.along[i] - edge.along[i - 1];
      const t = span === 0 ? 0 : (g - edge.along[i - 1]) / span;
      const p = edge.points[i - 1];
      const q = edge.points[i];
      return { lat: p.lat + (q.lat - p.lat) * t, lng: p.lng + (q.lng - p.lng) * t };
    }
  }
  return edge.points[edge.points.length - 1];
}

// Trecho da aresta entre duas posições, na ordem em que é percorrido (pode ir de `b` para `a`).
export function pointsBetween(edge: NetEdge, from: number, to: number): LatLng[] {
  const scale = scaleOf(edge);
  const g0 = from / scale;
  const g1 = to / scale;
  const out = [pointAt(edge, from)];
  if (g0 <= g1) {
    for (let i = 0; i < edge.points.length; i++) if (edge.along[i] > g0 && edge.along[i] < g1) out.push(edge.points[i]);
  } else {
    for (let i = edge.points.length - 1; i >= 0; i--) if (edge.along[i] < g0 && edge.along[i] > g1) out.push(edge.points[i]);
  }
  out.push(pointAt(edge, to));
  return out;
}
