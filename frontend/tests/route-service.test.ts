// Facade de rotas (etapa 3 de docs/plano-rota-malha-viaria.md): carrega o grafo do próprio site, calcula pela malha
// e cai para a linha reta marcada como estimativa quando a rede não ajuda. O roteador em si é testado em routing.test.ts.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, test } from "node:test";
import { metersBetween, walkingMinutes, type LatLng } from "../src/app/lib/geo";
import { GRAPH_URL, NO_ROUTE, computeRoute, getRoute, resetRouteCache, routeKey } from "../src/app/services/routeService";

type FixturePlace = { slug: string; latitude: number; longitude: number };
const places = JSON.parse(readFileSync(new URL("./fixtures/campus-places.json", import.meta.url), "utf-8")) as FixturePlace[];
const graphText = readFileSync(new URL("../public/campus-graph.json", import.meta.url), "utf-8");
const at = (slug: string): LatLng => {
  const place = places.find((p) => p.slug === slug)!;
  return { lat: place.latitude, lng: place.longitude };
};

const realFetch = globalThis.fetch;
let graphRequests = 0;

function serve(handler: () => Response) {
  globalThis.fetch = (async (url: string | URL | Request) => {
    assert.equal(String(url), GRAPH_URL);
    graphRequests++;
    return handler();
  }) as typeof fetch;
}
const okGraph = () => new Response(graphText, { status: 200, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  resetRouteCache();
  graphRequests = 0;
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("calcula pela malha: linha cheia pelas vias, tracejado no acesso e distância maior que a reta", async () => {
  serve(okGraph);
  const origin = at("reitoria");
  const destination = at("biblioteca");
  const route = await computeRoute(origin, destination);
  assert.equal(route.source, "network");
  assert.ok(route.solid.length > 2);
  assert.ok(route.meters > metersBetween(origin, destination));
  assert.equal(route.minutes, walkingMinutes(route.meters));
  assert.deepEqual(route.points[0], origin);
  assert.deepEqual(route.points[route.points.length - 1], destination);
  // cada trecho tracejado liga o ponto pedido à ponta da linha cheia
  for (const leg of route.dashed) assert.equal(leg.length, 2);
  assert.ok(route.dashed.every((leg) => leg.some((p) => p === origin || p === destination)));
  assert.ok(Number.isInteger(route.meters) && Number.isInteger(route.stepsMeters));
});

test("carrega o grafo uma vez por sessão, mesmo com várias rotas ao mesmo tempo", async () => {
  serve(okGraph);
  await Promise.all([computeRoute(at("reitoria"), at("biblioteca")), computeRoute(at("reitoria"), at("dc")), computeRoute(at("dc"), at("biblioteca"))]);
  await computeRoute(at("biblioteca"), at("reitoria"));
  assert.equal(graphRequests, 1);
});

test("sem o arquivo do grafo (404): estimativa em linha reta, toda tracejada", async () => {
  serve(() => new Response("não achei", { status: 404 }));
  const origin = at("reitoria");
  const destination = at("biblioteca");
  const route = await computeRoute(origin, destination);
  assert.equal(route.source, "straight");
  assert.deepEqual(route.solid, []);
  assert.deepEqual(route.dashed, [[origin, destination]]);
  assert.equal(route.meters, Math.round(metersBetween(origin, destination)));
  assert.equal(route.minutes, walkingMinutes(route.meters));
  assert.equal(route.stepsMeters, 0);
});

test("grafo corrompido ou de outra versão: estimativa em linha reta, sem quebrar a tela", async () => {
  serve(() => new Response(JSON.stringify({ version: 2, nodes: [], edges: [] }), { status: 200 }));
  assert.equal((await computeRoute(at("reitoria"), at("biblioteca"))).source, "straight");
  resetRouteCache();
  serve(() => new Response("isto não é json", { status: 200 }));
  assert.equal((await computeRoute(at("reitoria"), at("biblioteca"))).source, "straight");
});

test("falha de rede não fica gravada: a próxima rota tenta de novo e passa a usar a malha", async () => {
  globalThis.fetch = (async () => {
    graphRequests++;
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  assert.equal((await computeRoute(at("reitoria"), at("biblioteca"))).source, "straight");
  serve(okGraph);
  assert.equal((await computeRoute(at("reitoria"), at("biblioteca"))).source, "network");
});

test("ponto longe das vias (fora do campus): estimativa em linha reta mesmo com o grafo carregado", async () => {
  serve(okGraph);
  const route = await computeRoute(at("reitoria"), { lat: -8.05, lng: -34.9 });
  assert.equal(route.source, "straight");
  assert.equal(graphRequests, 1);
});

test("a chave de texto leva origem e destino e volta como rota; chave vazia ou inválida não tem rota", async () => {
  serve(okGraph);
  const origin = at("reitoria");
  const destination = at("biblioteca");
  const key = routeKey(origin, destination);
  assert.match(key, /^-?\d+\.\d{6},-?\d+\.\d{6}>-?\d+\.\d{6},-?\d+\.\d{6}$/);
  const route = (await getRoute(key))!;
  assert.equal(route.source, "network");
  // a chave tem 6 casas (~0,1 m): a rota é a mesma que a das coordenadas originais, com folga de centímetros
  const direct = await computeRoute(origin, destination);
  assert.ok(Math.abs(route.meters - direct.meters) <= 1);
  assert.equal(await getRoute(NO_ROUTE), null);
  assert.equal(await getRoute("lixo"), null);
  assert.equal(graphRequests, 1);
});
