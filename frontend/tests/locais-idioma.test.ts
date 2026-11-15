// Fase 6 (RF04), locais, departamentos e busca: o frontend pede o idioma ao servidor, guarda uma lista por idioma e
// a busca também casa com o nome em português. A resolução do idioma é do servidor (testes em Java).
import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getDepartment, getDepartments } from "../src/app/services/coursesService";
import { getDefaultOrigin, getPlace, getPublicPlaces, resetPublicCache, searchPlaces } from "../src/app/services/placesService";
import { searchDepartmentsAndCourses } from "../src/app/services/searchService";

const calls: string[] = [];
const realFetch = globalThis.fetch;

const place = (slug: string, name: string, lang: string) => ({
  slug, name, shortName: null, category: "biblioteca", status: "publicado", latitude: -8.01, longitude: -34.95,
  coordinatesSource: null, address: null, hours: null, description: null, contacts: [], services: [], courses: [],
  photoUrl: null, lang, machineTranslated: lang === "en", translatedLangs: ["en"],
});

function serve(handler: (url: string) => unknown) {
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(JSON.stringify(handler(String(url))), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

const placesByLanguage = (url: string) =>
  url.endsWith("lang=en")
    ? [place("biblioteca", "Central Library", "en"), place("reitoria", "Central Building", "pt")]
    : [place("biblioteca", "Biblioteca Central", "pt"), place("reitoria", "Prédio Central", "pt")];

beforeEach(() => resetPublicCache());

afterEach(() => {
  globalThis.fetch = realFetch;
  calls.length = 0;
});

test("a lista de locais é pedida com o idioma e guardada por idioma", async () => {
  serve(placesByLanguage);
  const en = await getPublicPlaces("en");
  const pt = await getPublicPlaces("pt");
  await getPublicPlaces("en");
  assert.deepEqual(calls, ["/api/places?lang=en", "/api/places?lang=pt"]);
  assert.equal(en[0].name, "Central Library");
  assert.equal(en[0].lang, "en");
  assert.equal(en[0].machineTranslated, true);
  assert.equal(pt[0].name, "Biblioteca Central");
});

test("o local da página vem no idioma da chave", async () => {
  serve(placesByLanguage);
  assert.equal((await getPlace("biblioteca:en"))?.name, "Central Library");
  assert.equal((await getPlace("biblioteca:pt"))?.name, "Biblioteca Central");
  assert.equal(await getPlace("inexistente:en"), null);
});

test("a busca de locais acha pelo nome traduzido e também pelo português, mostrando o nome do idioma da tela", async () => {
  serve(placesByLanguage);
  assert.deepEqual((await searchPlaces("central lib", "en")).map((p) => p.name), ["Central Library"]);
  assert.deepEqual((await searchPlaces("biblioteca", "en")).map((p) => p.name), ["Central Library"]);
  // Em português só a lista em português é usada.
  calls.length = 0;
  assert.deepEqual((await searchPlaces("biblioteca", "pt")).map((p) => p.name), ["Biblioteca Central"]);
  assert.deepEqual(calls, []);
  assert.deepEqual(await searchPlaces("bi", "en"), []);
});

test("a origem padrão sai do idioma carregado e cai para o português", async () => {
  serve(placesByLanguage);
  await getPublicPlaces("pt");
  assert.equal(getDefaultOrigin("en")?.name, "Prédio Central");
  await getPublicPlaces("en");
  assert.equal(getDefaultOrigin("en")?.name, "Central Building");
});

test("departamentos e sugestões da busca levam o idioma", async () => {
  serve(() => []);
  await getDepartments("es");
  await getDepartments();
  await getDepartment("3:en");
  await searchDepartmentsAndCourses("comput", "en");
  assert.deepEqual(calls, ["/api/departments?lang=es", "/api/departments?lang=pt", "/api/departments/3?lang=en", "/api/search?q=comput&lang=en"]);
});
