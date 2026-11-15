// Roteamento a pé pela malha do campus (etapa 2 de docs/plano-rota-malha-viaria.md): formato do grafo, encaixe do
// ponto na via, A* e uma conferência contra o grafo real. Os grafos pequenos são montados à mão, sem rede.
//
// A parte "grafo real" lê frontend/public/campus-graph.json e as coordenadas de tests/fixtures/campus-places.json
// (locais publicados em 15/11/2026, sem os de teste). Se o grafo ou os locais mudarem muito, reconferir os limites.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { metersBetween, type LatLng } from "../src/app/lib/geo";
import { FLAG_STEPS, GRAPH_SCALE, InvalidGraphError, parseGraph, type CampusGraph } from "../src/app/lib/routing/format";
import { buildNetwork, pointsBetween, snapToNetwork } from "../src/app/lib/routing/network";
import { findRoute } from "../src/app/lib/routing/router";

const LAT = -8.017;
const LNG = -34.949;
const at = (dLat: number, dLng: number): LatLng => ({ lat: LAT + dLat, lng: LNG + dLng });
const q = (value: number) => Math.round(value * GRAPH_SCALE);

type EdgeSpec = { a: number; b: number; flags?: number; middle?: LatLng[] };

// Monta o JSON do grafo como o gerador faria: coordenadas inteiras e comprimento medido sobre elas.
function makeGraph(nodes: LatLng[], edges: EdgeSpec[]): CampusGraph {
  const round = (p: LatLng): LatLng => ({ lat: q(p.lat) / GRAPH_SCALE, lng: q(p.lng) / GRAPH_SCALE });
  return {
    version: 1,
    generatedAt: "2026-01-01",
    source: "teste",
    bbox: [-8.03, -34.96, -8.0, -34.94],
    scale: GRAPH_SCALE,
    nodes: nodes.flatMap((p) => [q(p.lat), q(p.lng)]),
    edges: edges.map(({ a, b, flags = 0, middle = [] }) => {
      const points = [nodes[a], ...middle, nodes[b]].map(round);
      let meters = 0;
      for (let i = 1; i < points.length; i++) meters += metersBetween(points[i - 1], points[i]);
      return [a, b, Math.round(meters * 10) / 10, flags, middle.flatMap((p) => [q(p.lat), q(p.lng)])];
    }),
  };
}

const A = at(0, 0);
const B = at(0, 0.001);
const C = at(0.001, 0.001);
const near = (a: number, b: number) => Math.abs(a - b) <= 1;

test("L: o caminho segue as vias (maior que a linha reta) e começa e termina nos pontos pedidos", () => {
  const network = buildNetwork(makeGraph([A, B, C], [{ a: 0, b: 1 }, { a: 1, b: 2 }]));
  const origin = at(0.00005, 0);
  const destination = at(0.001, 0.00105);
  const route = findRoute(network, origin, destination)!;
  const expected = metersBetween(A, B) + metersBetween(B, C);
  assert.ok(near(route.networkMeters, expected), `${route.networkMeters} vs ${expected}`);
  assert.ok(route.meters > metersBetween(origin, destination) * 1.3);
  assert.deepEqual(route.points[0], origin);
  assert.deepEqual(route.points[route.points.length - 1], destination);
  assert.ok(route.accessMeters.start > 4 && route.accessMeters.start < 7);
  assert.ok(near(route.meters, route.networkMeters + route.accessMeters.start + route.accessMeters.end));
  assert.equal(route.stepsMeters, 0);
});

test("origem e destino no meio de uma via: só entra a parte da via usada", () => {
  const network = buildNetwork(makeGraph([A, B, C], [{ a: 0, b: 1 }, { a: 1, b: 2 }]));
  const midAB = at(0, 0.0005);
  const midBC = at(0.0005, 0.001);
  const route = findRoute(network, at(0.0001, 0.0005), at(0.0005, 0.0011))!;
  const expected = metersBetween(midAB, B) + metersBetween(B, midBC);
  assert.ok(near(route.networkMeters, expected), `${route.networkMeters} vs ${expected}`);
  assert.ok(route.network.some((p) => p.lat === B.lat && p.lng === B.lng), "passa pelo cruzamento B");
});

test("origem e destino na mesma via: vai direto, sem dar a volta nos cruzamentos", () => {
  const network = buildNetwork(makeGraph([A, B, C], [{ a: 0, b: 1 }, { a: 1, b: 2 }]));
  const route = findRoute(network, at(0.00004, 0.00025), at(-0.00004, 0.00075))!;
  assert.ok(near(route.networkMeters, metersBetween(at(0, 0.00025), at(0, 0.00075))));
  assert.equal(route.network.length, 2);
  // e na ordem contrária
  const back = findRoute(network, at(-0.00004, 0.00075), at(0.00004, 0.00025))!;
  assert.ok(near(back.meters, route.meters));
});

test("com dois caminhos, escolhe o mais curto, e a ida e a volta dão a mesma distância", () => {
  const D = at(0.003, 0);
  const network = buildNetwork(makeGraph([A, B, C, D], [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 0, b: 3 }, { a: 3, b: 2 }]));
  const go = findRoute(network, A, C)!;
  assert.ok(go.network.some((p) => p.lat === B.lat && p.lng === B.lng));
  assert.ok(!go.network.some((p) => p.lat === D.lat && p.lng === D.lng));
  assert.ok(near(go.networkMeters, metersBetween(A, B) + metersBetween(B, C)));
  const back = findRoute(network, C, A)!;
  assert.ok(near(back.meters, go.meters));
});

test("a geometria da via (pontos do meio) entra no desenho e no comprimento", () => {
  const bulge = at(0.0004, 0.0005);
  const network = buildNetwork(makeGraph([A, B], [{ a: 0, b: 1, middle: [bulge] }]));
  const route = findRoute(network, A, B)!;
  assert.ok(route.network.some((p) => Math.abs(p.lat - bulge.lat) < 1e-5 && Math.abs(p.lng - bulge.lng) < 1e-5));
  assert.ok(route.networkMeters > metersBetween(A, B) * 1.1);
  // a edge gravada manda no total
  assert.ok(near(route.networkMeters, metersBetween(A, bulge) + metersBetween(bulge, B)));
});

test("partes desconectadas não têm rota; origem ou destino longe de qualquer via também não", () => {
  const far1 = at(0.01, 0);
  const far2 = at(0.01, 0.001);
  const network = buildNetwork(makeGraph([A, B, far1, far2], [{ a: 0, b: 1 }, { a: 2, b: 3 }]));
  assert.equal(findRoute(network, A, far1), null);
  // 300 m da via mais próxima: acima do limite padrão (150 m)
  const lonely = at(0.003, 0.0005);
  assert.equal(findRoute(network, A, lonely), null);
  assert.equal(snapToNetwork(network, lonely, 150), null);
  // com o limite maior e uma via que chega lá, acha
  const connected = buildNetwork(makeGraph([A, B, at(0.003, 0.001)], [{ a: 0, b: 1 }, { a: 1, b: 2 }]));
  assert.equal(findRoute(connected, A, at(0.003, 0.0024)), null);
  assert.notEqual(findRoute(connected, A, at(0.003, 0.0024), { maxSnapMeters: 200 }), null);
});

test("escada: o trecho em escada é somado só quando o caminho passa por ela", () => {
  const network = buildNetwork(makeGraph([A, B, C], [{ a: 0, b: 1 }, { a: 1, b: 2, flags: FLAG_STEPS }]));
  const through = findRoute(network, A, C)!;
  assert.ok(near(through.stepsMeters, metersBetween(B, C)));
  const around = findRoute(network, A, B)!;
  assert.equal(around.stepsMeters, 0);
});

test("encaixe: escolhe a via mais próxima e diz a distância e a posição", () => {
  const network = buildNetwork(makeGraph([A, B, C], [{ a: 0, b: 1 }, { a: 1, b: 2 }]));
  const snap = snapToNetwork(network, at(0.0002, 0.0007))!;
  assert.equal(snap.edge, 0);
  assert.ok(Math.abs(snap.meters - metersBetween(at(0, 0.0007), at(0.0002, 0.0007))) < 0.5);
  assert.ok(near(snap.pos, metersBetween(A, at(0, 0.0007))));
  assert.equal(snapToNetwork(network, at(0.0002, 0.0007), 10), null);
  // perto do cruzamento B, a via B-C é a mais próxima
  assert.equal(snapToNetwork(network, at(0.0006, 0.0012))!.edge, 1);
});

test("pointsBetween respeita o sentido percorrido, inclusive de b para a", () => {
  const network = buildNetwork(makeGraph([A, B], [{ a: 0, b: 1, middle: [at(0.0003, 0.0005)] }]));
  const edge = network.edges[0];
  const forward = pointsBetween(edge, 0, edge.meters);
  const backward = pointsBetween(edge, edge.meters, 0);
  assert.equal(forward.length, 3);
  assert.deepEqual(backward, [...forward].reverse());
});

test("o formato do arquivo é conferido: versão, pares de coordenadas e índices", () => {
  const good = makeGraph([A, B], [{ a: 0, b: 1 }]);
  assert.doesNotThrow(() => parseGraph(structuredClone(good)));
  const bad = (change: (g: Record<string, unknown>) => void) => {
    const copy = structuredClone(good) as unknown as Record<string, unknown>;
    change(copy);
    assert.throws(() => parseGraph(copy), InvalidGraphError);
  };
  bad((g) => (g.version = 2));
  bad((g) => (g.scale = 1000));
  bad((g) => (g.nodes = [1, 2, 3]));
  bad((g) => (g.edges = [[0, 5, 10, 0, []]]));
  bad((g) => (g.edges = [[0, 1, 0, 0, []]]));
  bad((g) => (g.edges = [[0, 1, 10, 0, [1]]]));
  assert.throws(() => parseGraph(null), InvalidGraphError);
  assert.throws(() => buildNetwork({}), InvalidGraphError);
});

// ---- grafo real do campus ----

type FixturePlace = { slug: string; latitude: number; longitude: number };
const graphPath = new URL("../public/campus-graph.json", import.meta.url);
const places = JSON.parse(readFileSync(new URL("./fixtures/campus-places.json", import.meta.url), "utf-8")) as FixturePlace[];
const realNetwork = buildNetwork(JSON.parse(readFileSync(graphPath, "utf-8")));
const point = (p: FixturePlace): LatLng => ({ lat: p.latitude, lng: p.longitude });
const origin = places.find((p) => p.slug === "reitoria")!;

test("grafo real: carrega e a rede tem o tamanho esperado do campus", () => {
  assert.ok(realNetwork.nodes.length > 300 && realNetwork.nodes.length < 2000, String(realNetwork.nodes.length));
  assert.ok(realNetwork.edges.length > 400);
  assert.ok(realNetwork.adjacency.every((list) => list.length > 0), "todo nó tem ao menos uma aresta");
});

test("grafo real: todo local publicado tem rota a pé desde a Reitoria, e ela é maior que a linha reta", () => {
  const unroutable: string[] = [];
  const ratios: number[] = [];
  for (const place of places) {
    if (place.slug === origin.slug) continue;
    const route = findRoute(realNetwork, point(origin), point(place));
    if (!route) {
      unroutable.push(place.slug);
      continue;
    }
    const straight = metersBetween(point(origin), point(place));
    // a rota nunca é menor que a linha reta (menos a folga de encaixe) e não pode ser absurdamente maior
    assert.ok(route.meters >= straight - 3, `${place.slug}: rota ${route.meters} < reta ${straight}`);
    assert.ok(route.meters <= straight * 4 + 100, `${place.slug}: rota ${route.meters} muito maior que a reta ${straight}`);
    assert.ok(route.networkMeters > 0 || straight < 30, place.slug);
    ratios.push(route.meters / Math.max(straight, 1));
  }
  assert.deepEqual(unroutable, []);
  assert.ok(ratios.length >= 30);
});

test("grafo real: ida e volta dão a mesma distância (±1 m)", () => {
  for (let i = 0; i < places.length - 1; i += 2) {
    const a = point(places[i]);
    const b = point(places[i + 1]);
    const go = findRoute(realNetwork, a, b);
    const back = findRoute(realNetwork, b, a);
    assert.ok(go && back, `${places[i].slug} <-> ${places[i + 1].slug}`);
    assert.ok(Math.abs(go.meters - back.meters) <= 1, `${places[i].slug}: ${go.meters} vs ${back.meters}`);
  }
});

test("grafo real: o A* acha o mesmo caminho mais curto que o Dijkstra puro", () => {
  let pairs = 0;
  for (let i = 0; i < places.length; i++) {
    for (const j of [(i + 7) % places.length, (i + 19) % places.length]) {
      if (i === j) continue;
      const a = point(places[i]);
      const b = point(places[j]);
      const astar = findRoute(realNetwork, a, b)!;
      const dijkstra = findRoute(realNetwork, a, b, { useHeuristic: false })!;
      assert.ok(Math.abs(astar.meters - dijkstra.meters) < 0.01, `${places[i].slug} -> ${places[j].slug}: ${astar.meters} vs ${dijkstra.meters}`);
      pairs++;
    }
  }
  assert.ok(pairs > 50);
});

test("grafo real: cada rota leva poucos milissegundos (limite folgado para máquina lenta)", () => {
  const started = performance.now();
  let routes = 0;
  for (const place of places) {
    if (place === origin) continue;
    findRoute(realNetwork, point(origin), point(place));
    routes++;
  }
  const average = (performance.now() - started) / routes;
  console.log(`# ${routes} rotas pela malha real, ${average.toFixed(2)} ms em média`);
  assert.ok(average < 25, `média de ${average.toFixed(1)} ms por rota`);
});

test("grafo real: ponto fora do campus não tem rota pela malha", () => {
  assert.equal(findRoute(realNetwork, point(origin), { lat: -8.05, lng: -34.9 }), null);
});
