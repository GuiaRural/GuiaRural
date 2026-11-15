// Gerador do grafo de caminhada do campus (rota pela malha viária, etapa 1 de docs/plano-rota-malha-viaria.md).
// Funções puras: recebem o JSON do OpenStreetMap (Overpass ou API) e devolvem o grafo compacto e um relatório de
// qualidade. Sem rede e sem arquivos aqui; quem lê e grava é scripts/build-campus-graph.ts.
import { CAMPUS_BOUNDS } from "../../src/app/data/mapConfig";
import { metersBetween, nearestOnSegment, type LatLng } from "../../src/app/lib/geo";
import { FLAG_STEPS, GRAPH_SCALE, type CampusGraph, type GraphEdge } from "../../src/app/lib/routing/format";

export type OsmNode = { type: "node"; id: number; lat: number; lon: number };
export type OsmWay = { type: "way"; id: number; nodes: number[]; tags?: Record<string, string> };
export type OsmElement = OsmNode | OsmWay | { type: string; id: number };

// O formato do arquivo é definido por lib/routing/format.ts (o roteador lê o que este gerador grava).
export { FLAG_STEPS, GRAPH_SCALE, type CampusGraph, type GraphEdge };

export type BuildOptions = {
  // Folga (graus) além de CAMPUS_BOUNDS, para pegar as ruas das portarias.
  padding: number;
  // Vias `access=private` revisadas e liberadas (D19.3) e vias que devem ficar de fora de qualquer jeito.
  includePrivateWays: number[];
  excludeWays: number[];
  // Em geral só o maior componente conexo vai para o arquivo; ilhas só atrapalham o encaixe.
  keepIslands: boolean;
  generatedAt: string;
};

// Caixa consultada no OSM: CAMPUS_BOUNDS mais a folga, em [sul, oeste, norte, leste].
export function graphBox(padding: number): [number, number, number, number] {
  const [[south, west], [north, east]] = CAMPUS_BOUNDS;
  return [south - padding, west - padding, north + padding, east + padding];
}

export const DEFAULT_OPTIONS: BuildOptions = {
  padding: 0.0015,
  includePrivateWays: [],
  excludeWays: [],
  keepIslands: false,
  generatedAt: new Date().toISOString().slice(0, 10),
};

// Tipos de via que um pedestre não usa (ou que não existem de fato).
const NOT_WALKABLE = new Set([
  "motorway", "motorway_link", "trunk", "trunk_link", "construction", "proposed", "raceway", "bus_guideway",
  "elevator", "services", "rest_area", "platform",
]);

export type WayStatus = "ok" | "private" | "excluded";

export function classifyWay(way: OsmWay, options: Pick<BuildOptions, "includePrivateWays" | "excludeWays">): { status: WayStatus; reason: string } {
  const tags = way.tags ?? {};
  const highway = tags.highway ?? "";
  if (options.excludeWays.includes(way.id)) return { status: "excluded", reason: "excluída na configuração" };
  if (NOT_WALKABLE.has(highway)) return { status: "excluded", reason: `tipo ${highway}` };
  if (tags.foot === "no" || tags.access === "no") return { status: "excluded", reason: "foot=no ou access=no" };
  if (tags.area === "yes") return { status: "excluded", reason: "área (area=yes)" };
  const restricted = ["private", "customers", "permit"].includes(tags.access ?? "");
  const footAllowed = ["yes", "designated", "permissive"].includes(tags.foot ?? "");
  if (restricted && !footAllowed) {
    return options.includePrivateWays.includes(way.id)
      ? { status: "ok", reason: "access restrito liberado na configuração" }
      : { status: "private", reason: `access=${tags.access}` };
  }
  return { status: "ok", reason: "" };
}

export type PlaceInput = { slug: string; status: string; latitude: number | null; longitude: number | null };

export type BuildReport = {
  generatedAt: string;
  waysTotal: number;
  byHighway: Record<string, number>;
  byStatus: Record<WayStatus, number>;
  missingNodes: number;
  selectedWays: number;
  graph: { nodes: number; edges: number; kilometers: number; jsonBytes: number };
  components: { total: number; mainKilometers: number; droppedIslands: boolean };
  privateWays: { id: number; highway: string; name: string | null; service: string | null; meters: number; componentsTouched: number }[];
  islands: { meters: number; ways: number; center: LatLng; insideCampus: boolean; gapMetersToMain: number | null }[];
  places: { slug: string; status: string; snapMeters: number; nearestIsIsland: boolean }[] | null;
  // Dica de leitura: quantos locais publicados passam de 40 m da via mais próxima do componente principal.
  farPlaces: { slug: string; snapMeters: number }[] | null;
  unroutablePlaces: string[] | null;
};

const MAX_SNAP_METERS = 40;

type Prepared = { id: number; highway: string; nodeIds: number[]; tags: Record<string, string> };

class UnionFind {
  private parent = new Map<number, number>();
  find(x: number): number {
    let root = x;
    while ((this.parent.get(root) ?? root) !== root) root = this.parent.get(root)!;
    // compressão de caminho
    let cur = x;
    while (cur !== root) {
      const next = this.parent.get(cur) ?? cur;
      this.parent.set(cur, root);
      cur = next;
    }
    this.parent.set(root, root);
    return root;
  }
  union(a: number, b: number) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

function insideBox(p: LatLng, padding: number): boolean {
  const [[south, west], [north, east]] = CAMPUS_BOUNDS;
  return p.lat >= south - padding && p.lat <= north + padding && p.lng >= west - padding && p.lng <= east + padding;
}

function polylineMeters(points: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += metersBetween(points[i - 1], points[i]);
  return total;
}

type RawEdge = { a: number; b: number; ids: number[]; points: LatLng[]; meters: number; flags: number; wayId: number };

export function buildCampusGraph(
  elements: OsmElement[],
  places: PlaceInput[] | null,
  partial: Partial<BuildOptions> = {},
): { graph: CampusGraph; report: BuildReport } {
  const options: BuildOptions = { ...DEFAULT_OPTIONS, ...partial };
  const bbox = graphBox(options.padding);

  const coords = new Map<number, LatLng>();
  const allWays: OsmWay[] = [];
  for (const element of elements) {
    if (element.type === "node") {
      const node = element as OsmNode;
      coords.set(node.id, { lat: node.lat, lng: node.lon });
    } else if (element.type === "way" && (element as OsmWay).tags?.highway) {
      allWays.push(element as OsmWay);
    }
  }
  allWays.sort((x, y) => x.id - y.id);

  const byHighway: Record<string, number> = {};
  const byStatus: Record<WayStatus, number> = { ok: 0, private: 0, excluded: 0 };
  let missingNodes = 0;
  const okWays: Prepared[] = [];
  const privateWays: Prepared[] = [];

  for (const way of allWays) {
    const highway = way.tags!.highway;
    byHighway[highway] = (byHighway[highway] ?? 0) + 1;
    const { status } = classifyWay(way, options);
    byStatus[status]++;
    const present = way.nodes.filter((id) => coords.has(id));
    missingNodes += way.nodes.length - present.length;
    // Só entram as vias que passam pela área do campus (com a folga); o resto é cidade.
    if (present.length < 2 || !present.some((id) => insideBox(coords.get(id)!, options.padding))) continue;
    const prepared: Prepared = { id: way.id, highway, nodeIds: present, tags: way.tags! };
    if (status === "ok") okWays.push(prepared);
    else if (status === "private") privateWays.push(prepared);
  }

  // Cruzamentos e pontas: nós que são ponta de via, aparecem em mais de uma via ou se repetem na mesma via.
  const uses = new Map<number, number>();
  for (const way of okWays) {
    way.nodeIds.forEach((id, i) => {
      const isEnd = i === 0 || i === way.nodeIds.length - 1;
      uses.set(id, (uses.get(id) ?? 0) + (isEnd ? 2 : 1));
    });
  }
  const isJunction = (id: number) => (uses.get(id) ?? 0) !== 1;

  const rawEdges: RawEdge[] = [];
  for (const way of okWays) {
    const flags = way.highway === "steps" ? FLAG_STEPS : 0;
    let start = 0;
    for (let i = 1; i < way.nodeIds.length; i++) {
      if (!isJunction(way.nodeIds[i]) && i !== way.nodeIds.length - 1) continue;
      const slice = way.nodeIds.slice(start, i + 1);
      const points = slice.map((id) => coords.get(id)!);
      const meters = polylineMeters(points);
      if (slice[0] !== slice[slice.length - 1] || points.length > 2) {
        if (meters > 0) rawEdges.push({ a: slice[0], b: slice[slice.length - 1], ids: slice, points, meters, flags, wayId: way.id });
      }
      start = i;
    }
  }

  // Componentes conexos (a pé, sem sentido único).
  const uf = new UnionFind();
  for (const edge of rawEdges) uf.union(edge.a, edge.b);
  const componentMeters = new Map<number, number>();
  for (const edge of rawEdges) componentMeters.set(uf.find(edge.a), (componentMeters.get(uf.find(edge.a)) ?? 0) + edge.meters);
  const ranked = [...componentMeters.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0]);
  const mainRoot = ranked.length ? ranked[0][0] : -1;
  const kept = rawEdges.filter((edge) => options.keepIslands || uf.find(edge.a) === mainRoot);

  // Índices estáveis: nós ordenados pelo id do OSM.
  const nodeIds = [...new Set(kept.flatMap((edge) => [edge.a, edge.b]))].sort((x, y) => x - y);
  const index = new Map(nodeIds.map((id, i) => [id, i]));
  const q = (value: number) => Math.round(value * GRAPH_SCALE);
  const nodes = nodeIds.flatMap((id) => [q(coords.get(id)!.lat), q(coords.get(id)!.lng)]);
  const edges: GraphEdge[] = kept
    .map((edge): GraphEdge => [
      index.get(edge.a)!,
      index.get(edge.b)!,
      Math.round(edge.meters * 10) / 10,
      edge.flags,
      edge.points.slice(1, -1).flatMap((p) => [q(p.lat), q(p.lng)]),
    ])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);

  const graph: CampusGraph = {
    version: 1,
    generatedAt: options.generatedAt,
    source: "OpenStreetMap contributors (ODbL), via Overpass API",
    bbox,
    scale: GRAPH_SCALE,
    nodes,
    edges,
  };

  // ---- relatório ----
  const nodeOf = (id: number) => coords.get(id)!;
  const meanCenter = (ids: number[]): LatLng => ({
    lat: ids.reduce((sum, id) => sum + nodeOf(id).lat, 0) / ids.length,
    lng: ids.reduce((sum, id) => sum + nodeOf(id).lng, 0) / ids.length,
  });

  const mainNodes = new Set(rawEdges.filter((e) => uf.find(e.a) === mainRoot).flatMap((e) => [e.a, e.b]));
  // Vias do OSM (e não só junções) por componente, para a contagem de ilhas.
  const waysByComponent = new Map<number, Set<number>>();
  const nodesByComponent = new Map<number, Set<number>>();
  for (const edge of rawEdges) {
    const root = uf.find(edge.a);
    (waysByComponent.get(root) ?? waysByComponent.set(root, new Set()).get(root)!).add(edge.wayId);
    const set = nodesByComponent.get(root) ?? nodesByComponent.set(root, new Set()).get(root)!;
    set.add(edge.a);
    set.add(edge.b);
  }
  const islands = ranked.slice(1).map(([root, meters]) => {
    const ids = [...nodesByComponent.get(root)!];
    const center = meanCenter(ids);
    let gap: number | null = null;
    for (const id of ids) for (const other of mainNodes) {
      const d = metersBetween(nodeOf(id), nodeOf(other));
      if (gap === null || d < gap) gap = d;
    }
    return { meters: Math.round(meters), ways: waysByComponent.get(root)!.size, center, insideCampus: insideBox(center, 0), gapMetersToMain: gap === null ? null : Math.round(gap * 10) / 10 };
  });

  // Componente de cada nó (inclusive os do meio de uma aresta): uma via privada que cruza o meio de uma via aberta liga as duas.
  const componentOfNode = new Map<number, number>();
  for (const edge of rawEdges) for (const id of edge.ids) componentOfNode.set(id, uf.find(edge.a));
  const privateReport = privateWays.map((way) => {
    const touched = new Set<number>();
    for (const id of way.nodeIds) {
      const component = componentOfNode.get(id);
      if (component !== undefined) touched.add(component);
    }
    const pts = way.nodeIds.map((id) => nodeOf(id));
    return {
      id: way.id,
      highway: way.highway,
      name: way.tags.name ?? null,
      service: way.tags.service ?? null,
      meters: Math.round(polylineMeters(pts)),
      componentsTouched: touched.size,
    };
  });

  let placeReport: BuildReport["places"] = null;
  let farPlaces: BuildReport["farPlaces"] = null;
  let unroutable: BuildReport["unroutablePlaces"] = null;
  if (places) {
    placeReport = [];
    for (const place of places) {
      if (place.latitude === null || place.longitude === null) continue;
      const point = { lat: place.latitude, lng: place.longitude };
      let best = { meters: Infinity, island: false };
      let bestMain = Infinity;
      for (const edge of rawEdges) {
        const polyline = edge.points;
        const isMain = uf.find(edge.a) === mainRoot;
        for (let i = 1; i < polyline.length; i++) {
          const d = nearestOnSegment(point, polyline[i - 1], polyline[i]).meters;
          if (d < best.meters) best = { meters: d, island: !isMain };
          if (isMain && d < bestMain) bestMain = d;
        }
      }
      placeReport.push({ slug: place.slug, status: place.status, snapMeters: Math.round(bestMain), nearestIsIsland: best.island });
    }
    const published = placeReport.filter((p) => p.status === "publicado");
    farPlaces = published.filter((p) => p.snapMeters > MAX_SNAP_METERS).sort((x, y) => y.snapMeters - x.snapMeters).map((p) => ({ slug: p.slug, snapMeters: p.snapMeters }));
    unroutable = published.filter((p) => !Number.isFinite(p.snapMeters)).map((p) => p.slug);
  }

  const kilometers = kept.reduce((sum, edge) => sum + edge.meters, 0) / 1000;
  const report: BuildReport = {
    generatedAt: options.generatedAt,
    waysTotal: allWays.length,
    byHighway,
    byStatus,
    missingNodes,
    selectedWays: okWays.length + privateWays.length,
    graph: { nodes: nodeIds.length, edges: edges.length, kilometers: Math.round(kilometers * 10) / 10, jsonBytes: JSON.stringify(graph).length },
    components: { total: ranked.length, mainKilometers: Math.round(((ranked[0]?.[1] ?? 0) / 1000) * 10) / 10, droppedIslands: !options.keepIslands },
    privateWays: privateReport,
    islands,
    places: placeReport,
    farPlaces,
    unroutablePlaces: unroutable,
  };
  return { graph, report };
}
