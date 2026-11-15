// Gerador do grafo do campus (etapa 1 da rota pela malha viária): classificação das vias do OSM, compactação do
// grafo, ilhas, vias restritas e conferência dos locais. Sem rede: usa um trecho de OSM montado à mão.
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCampusGraph, classifyWay, FLAG_STEPS, GRAPH_SCALE, type OsmElement, type OsmWay } from "../scripts/campus-graph/build";
import { renderReport } from "../scripts/campus-graph/report";
import { metersBetween, nearestOnSegment } from "../src/app/lib/geo";

const LAT = -8.017;
const LNG = -34.949;
const node = (id: number, dLat: number, dLng: number): OsmElement => ({ type: "node", id, lat: LAT + dLat, lon: LNG + dLng });
const way = (id: number, nodes: number[], tags: Record<string, string> = { highway: "footway" }): OsmWay => ({ type: "way", id, nodes, tags });

// Principal: 1 —— 2 —— 3 —— 4 (leste), com 3 ligado a 5 (norte). Ilha: 10 —— 11, ao sul. A via privada 6 liga 4 à ilha.
const ELEMENTS: OsmElement[] = [
  node(1, 0, 0), node(2, 0, 0.001), node(3, 0, 0.002), node(4, 0, 0.003), node(5, 0.001, 0.002),
  node(10, -0.002, 0.003), node(11, -0.002, 0.004),
  node(20, -0.15, 0), node(21, -0.15, 0.001),
  way(100, [1, 2, 3, 4]),
  way(101, [3, 5]),
  way(102, [10, 11]),
  way(103, [4, 10], { highway: "service", access: "private" }),
  way(104, [1, 5], { highway: "trunk" }),
  way(105, [20, 21]),
  way(106, [5, 4], { highway: "steps" }),
];

const options = { generatedAt: "2026-01-01" };

test("classifica as vias: caminhável, restrita, e as que um pedestre não usa", () => {
  const none = { includePrivateWays: [], excludeWays: [] };
  assert.equal(classifyWay(way(1, [], { highway: "footway" }), none).status, "ok");
  assert.equal(classifyWay(way(1, [], { highway: "trunk" }), none).status, "excluded");
  assert.equal(classifyWay(way(1, [], { highway: "footway", foot: "no" }), none).status, "excluded");
  assert.equal(classifyWay(way(1, [], { highway: "service", area: "yes" }), none).status, "excluded");
  assert.equal(classifyWay(way(1, [], { highway: "service", access: "private" }), none).status, "private");
  // foot explícito vence o access restrito
  assert.equal(classifyWay(way(1, [], { highway: "service", access: "private", foot: "yes" }), none).status, "ok");
  // configuração: liberar uma restrita e barrar uma qualquer
  assert.equal(classifyWay(way(7, [], { highway: "service", access: "private" }), { includePrivateWays: [7], excludeWays: [] }).status, "ok");
  assert.equal(classifyWay(way(8, [], { highway: "footway" }), { includePrivateWays: [], excludeWays: [8] }).status, "excluded");
});

test("compacta o grafo: nós do meio viram pontos da aresta e as coordenadas são inteiras", () => {
  const { graph } = buildCampusGraph(ELEMENTS, null, options);
  // Cruzamentos e pontas do componente principal: 1, 3, 4, 5 (o 2 fica no meio da aresta 1-3).
  assert.equal(graph.nodes.length / 2, 4);
  assert.equal(graph.edges.length, 4); // 1-3, 3-4, 3-5 e a escada 5-4
  assert.ok(graph.nodes.every(Number.isInteger));
  const first = graph.edges.find((e) => e[4].length > 0)!;
  assert.equal(first[4].length, 2); // um ponto intermediário (lat, lng)
  assert.equal(first[4][0], Math.round((LAT + 0) * GRAPH_SCALE));
  assert.equal(first[4][1], Math.round((LNG + 0.001) * GRAPH_SCALE));
  // comprimento da aresta 1-3 = duas pernas de 0,001 grau de longitude
  const expected = metersBetween({ lat: LAT, lng: LNG }, { lat: LAT, lng: LNG + 0.001 }) * 2;
  assert.ok(Math.abs(first[2] - expected) < 0.2, `${first[2]} vs ${expected}`);
  assert.equal(graph.version, 1);
  assert.equal(graph.generatedAt, "2026-01-01");
});

test("a escada leva a bandeira de escada; via fora da área do campus não entra", () => {
  const { graph, report } = buildCampusGraph(ELEMENTS, null, options);
  assert.equal(graph.edges.filter((e) => e[3] === FLAG_STEPS).length, 1);
  // 7 vias com highway no total. A 105 fica a ~16 km do campus e a 104 (trunk) não é caminhável: sobram 5
  // candidatas (4 abertas e a privada).
  assert.equal(report.waysTotal, 7);
  assert.equal(report.selectedWays, 5);
});

test("ilha fica de fora do arquivo e entra no relatório com a folga até o componente principal", () => {
  const { graph, report } = buildCampusGraph(ELEMENTS, null, options);
  assert.equal(report.components.total, 2);
  assert.equal(report.islands.length, 1);
  assert.equal(report.islands[0].ways, 1);
  assert.equal(report.islands[0].insideCampus, true);
  // folga: do nó 10 ao nó 4 = 0,002 grau de latitude (~221 m)
  const gap = metersBetween({ lat: LAT, lng: LNG + 0.003 }, { lat: LAT - 0.002, lng: LNG + 0.003 });
  assert.ok(Math.abs(report.islands[0].gapMetersToMain! - gap) < 0.2);
  assert.equal(graph.nodes.length / 2, 4);
  // com keepIslands as duas partes vão para o arquivo
  const all = buildCampusGraph(ELEMENTS, null, { ...options, keepIslands: true });
  assert.equal(all.graph.nodes.length / 2, 6);
});

test("via restrita é listada com quantos componentes liga e só entra se a configuração liberar", () => {
  const { report } = buildCampusGraph(ELEMENTS, null, options);
  assert.equal(report.privateWays.length, 1);
  assert.equal(report.privateWays[0].id, 103);
  assert.equal(report.privateWays[0].componentsTouched, 2);
  assert.equal(report.byStatus.private, 1);

  const released = buildCampusGraph(ELEMENTS, null, { ...options, includePrivateWays: [103] });
  assert.equal(released.report.components.total, 1);
  assert.equal(released.report.privateWays.length, 0);
  assert.equal(released.graph.nodes.length / 2, 6);
});

test("excludeWays tira uma via do grafo", () => {
  const { graph } = buildCampusGraph(ELEMENTS, null, { ...options, excludeWays: [101, 106] });
  // sem 3-5 e sem a escada, o nó 5 sai e o 3 deixa de ser cruzamento: sobram só as pontas 1 e 4
  assert.equal(graph.nodes.length / 2, 2);
  assert.equal(graph.edges.length, 1);
});

test("a saída é determinística (mesma entrada, mesmo JSON, mesmo com os elementos embaralhados)", () => {
  const a = JSON.stringify(buildCampusGraph(ELEMENTS, null, options).graph);
  const b = JSON.stringify(buildCampusGraph([...ELEMENTS].reverse(), null, options).graph);
  assert.equal(a, b);
});

test("confere os locais: distância até a via do componente principal e locais longe", () => {
  const places = [
    { slug: "perto", status: "publicado", latitude: LAT + 0.0002, longitude: LNG + 0.0005 },
    { slug: "longe", status: "publicado", latitude: LAT - 0.0006, longitude: LNG + 0.0005 },
    { slug: "na-ilha", status: "publicado", latitude: LAT - 0.002, longitude: LNG + 0.0035 },
    { slug: "rascunho", status: "rascunho", latitude: LAT + 0.01, longitude: LNG },
    { slug: "sem-coordenada", status: "publicado", latitude: null, longitude: null },
  ];
  const { report } = buildCampusGraph(ELEMENTS, places, options);
  assert.equal(report.places!.length, 4); // sem coordenada fica de fora
  const bySlug = Object.fromEntries(report.places!.map((p) => [p.slug, p]));
  assert.ok(Math.abs(bySlug.perto.snapMeters - 22) <= 1);
  assert.equal(bySlug.perto.nearestIsIsland, false);
  assert.equal(bySlug["na-ilha"].nearestIsIsland, true);
  assert.deepEqual(report.farPlaces!.map((p) => p.slug), ["na-ilha", "longe"]);
});

test("sem locais, o relatório diz que não conferiu; o Markdown traz as seções", () => {
  const { report } = buildCampusGraph(ELEMENTS, null, options);
  assert.equal(report.places, null);
  const md = renderReport(report, "frontend/public/campus-graph.json");
  assert.match(md, /# Relatório do grafo de caminhada do campus/);
  assert.match(md, /\| \[103\]\(https:\/\/www\.openstreetmap\.org\/way\/103\)/);
  assert.match(md, /Não verificado: nenhum arquivo ou URL de locais/);
  assert.match(md, /\*\*sim\*\*/); // ilha dentro do campus
});

test("nearestOnSegment: distância, ponto mais próximo e limites do segmento", () => {
  const a = { lat: LAT, lng: LNG };
  const b = { lat: LAT, lng: LNG + 0.002 };
  const above = nearestOnSegment({ lat: LAT + 0.0002, lng: LNG + 0.001 }, a, b);
  assert.ok(Math.abs(above.meters - metersBetween({ lat: LAT, lng: LNG }, { lat: LAT + 0.0002, lng: LNG })) < 0.1);
  assert.ok(Math.abs(above.t - 0.5) < 1e-6);
  // além da ponta: fica na ponta
  const beyond = nearestOnSegment({ lat: LAT, lng: LNG + 0.003 }, a, b);
  assert.equal(beyond.t, 1);
  assert.ok(Math.abs(beyond.meters - metersBetween(b, { lat: LAT, lng: LNG + 0.003 })) < 0.1);
  // segmento de comprimento zero
  assert.equal(nearestOnSegment({ lat: LAT, lng: LNG }, a, a).t, 0);
});
