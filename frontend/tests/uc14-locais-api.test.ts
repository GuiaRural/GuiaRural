// UC14 a UC16 — Locais: o que o frontend envia para /api/places e /api/admin/places e como interpreta as respostas.
// As regras definitivas (publicar exige coordenadas, slug único e imutável etc.) são do servidor, com teste em Java
// (PlaceAdminIntegrationTest); aqui só o contrato do lado do navegador.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  PlaceValidationError,
  deletePlace,
  deletePlacePhoto,
  getPlaceForAdmin,
  getPublicPlaces,
  listAllPlaces,
  savePlace,
  setPlaceStatus,
  toInput,
  uploadPlacePhoto,
  type PlaceInput,
} from "../src/app/services/placesService";

type Call = { url: string; init: RequestInit };
const calls: Call[] = [];
const realFetch = globalThis.fetch;

// Cada chamada consome a próxima resposta da fila (a última se repete).
function respond(...replies: [number, unknown?][]) {
  let i = 0;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    const [status, body] = replies[Math.min(i++, replies.length - 1)];
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  calls.length = 0;
});

// Espelha PlaceResponseDTO.
function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: "ru",
    name: "Restaurante Universitário",
    shortName: "RU",
    category: "alimentacao",
    status: "publicado",
    latitude: -8.014052,
    longitude: -34.951108,
    coordinatesSource: "OpenStreetMap",
    address: "Próximo à quadra",
    hours: "11:00-14:00",
    description: "Refeições.",
    phone: null,
    email: null,
    contacts: [{ name: "Maria Souza", email: "maria@ufrpe.br" }, { name: "Secretaria", email: null }],
    services: [{ id: 7, name: "Almoço" }],
    courses: [{ id: 3, name: "Nutrição" }],
    photoUrl: "/api/places/ru/photo?v=123",
    ...overrides,
  };
}

const INPUT: PlaceInput = {
  name: "  Restaurante Universitário ",
  shortName: " RU ",
  category: "alimentacao",
  status: "publicado",
  position: { lat: -8.014052, lng: -34.951108 },
  address: "  ",
  hours: "11:00-14:00",
  description: " Refeições. ",
  contacts: [{ name: " Maria Souza ", email: " maria@ufrpe.br " }, { name: "Secretaria", email: "  " }],
  serviceIds: [7],
  courseIds: [3],
};

test("a lista pública mostra só locais publicados e georreferenciados, com os vínculos e a foto", async () => {
  respond([
    200,
    [
      dto(),
      dto({ slug: "rascunho", status: "rascunho" }),
      dto({ slug: "sem-posicao", latitude: null, longitude: null }),
      dto({ slug: "sem-extras", shortName: null, hours: null, contacts: [], services: [], courses: [], photoUrl: null }),
    ],
  ]);
  const places = await getPublicPlaces();

  assert.equal(calls[0].url, "/api/places");
  assert.deepEqual(places.map((p) => p.id), ["ru", "sem-extras"]);
  const [ru, bare] = places;
  assert.deepEqual(ru.position, { lat: -8.014052, lng: -34.951108 });
  assert.equal(ru.photoUrl, "/api/places/ru/photo?v=123");
  assert.deepEqual(ru.contacts, [{ name: "Maria Souza", email: "maria@ufrpe.br" }, { name: "Secretaria", email: undefined }]);
  assert.deepEqual(ru.services, [{ id: 7, name: "Almoço" }]);
  assert.deepEqual(ru.courses, [{ id: 3, name: "Nutrição" }]);
  // Sem sigla, o nome curto cai no nome; sem horário, texto vazio; sem foto, undefined.
  assert.equal(bare.shortName, bare.name);
  assert.equal(bare.hours, "");
  assert.equal(bare.photoUrl, undefined);
});

test("criar envia POST /api/places com os campos limpos e os vínculos por id", async () => {
  respond([201, dto()]);
  const saved = await savePlace(INPUT);

  assert.equal(calls[0].url, "/api/places");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    name: "Restaurante Universitário",
    shortName: "RU",
    category: "alimentacao",
    status: "publicado",
    latitude: -8.014052,
    longitude: -34.951108,
    coordinatesSource: null,
    address: null,
    hours: "11:00-14:00",
    description: "Refeições.",
    serviceIds: [7],
    courseIds: [3],
    contacts: [{ name: "Maria Souza", email: "maria@ufrpe.br" }, { name: "Secretaria", email: null }],
  });
  assert.equal(saved.id, "ru");
});

test("editar envia PUT no slug do local, sem repetir o identificador no corpo", async () => {
  respond([200, dto()]);
  await savePlace({ ...INPUT, id: "ru" });

  assert.equal(calls[0].url, "/api/places/ru");
  assert.equal(calls[0].init.method, "PUT");
  assert.equal("slug" in JSON.parse(String(calls[0].init.body)), false);
});

test("sem coordenadas, latitude e longitude vão nulas (rascunho)", async () => {
  respond([201, dto({ status: "rascunho", latitude: null, longitude: null })]);
  await savePlace({ ...INPUT, status: "rascunho", position: null });

  const body = JSON.parse(String(calls[0].init.body));
  assert.equal(body.latitude, null);
  assert.equal(body.longitude, null);
});

test("400 e 409 do servidor viram PlaceValidationError com a mensagem; outros erros passam como ApiError", async () => {
  respond([400, { detail: "Para publicar o local, informe a latitude e a longitude." }]);
  await assert.rejects(savePlace(INPUT), (error) => error instanceof PlaceValidationError && /latitude e a longitude/.test(error.message));

  respond([409, { detail: 'Já existe um local com o identificador "ru".' }]);
  await assert.rejects(savePlace(INPUT), (error) => error instanceof PlaceValidationError && /Já existe/.test(error.message));

  // Validação de campo (400 sem detail): usa a primeira mensagem de `fields`.
  respond([400, { fields: { name: "O nome do local é obrigatório." } }]);
  await assert.rejects(savePlace(INPUT), (error) => error instanceof PlaceValidationError && /obrigatório/.test(error.message));

  respond([403, { detail: "Sem permissão para esta ação." }]);
  await assert.rejects(savePlace(INPUT), (error) => error instanceof ApiError && error.status === 403);
});

test("ativar e desativar relê o local e reenvia tudo, mudando só o status e mantendo os vínculos", async () => {
  respond([200, dto({ status: "publicado" })], [200, dto({ status: "inativo" })]);
  await setPlaceStatus("ru", "inativo");

  assert.equal(calls[0].url, "/api/admin/places/ru");
  assert.equal(calls[1].url, "/api/places/ru");
  assert.equal(calls[1].init.method, "PUT");
  const body = JSON.parse(String(calls[1].init.body));
  assert.equal(body.status, "inativo");
  assert.deepEqual(body.serviceIds, [7]);
  assert.deepEqual(body.courseIds, [3]);
  assert.equal(body.contacts[0].email, "maria@ufrpe.br");
});

test("toInput devolve o local ao formato do formulário", async () => {
  respond([200, dto()]);
  const place = await getPlaceForAdmin("ru");
  assert.ok(place);
  const input = toInput(place);

  assert.equal(input.id, "ru");
  assert.deepEqual(input.serviceIds, [7]);
  assert.deepEqual(input.courseIds, [3]);
  assert.equal(input.coordinatesSource, "OpenStreetMap");
});

test("o painel lista todos pelo /api/admin/places e um slug inexistente devolve nulo", async () => {
  respond([200, [dto(), dto({ slug: "rascunho", status: "rascunho", latitude: null, longitude: null })]]);
  const all = await listAllPlaces();
  assert.equal(calls[0].url, "/api/admin/places");
  assert.deepEqual(all.map((p) => p.status), ["publicado", "rascunho"]);

  respond([404, { detail: "Local não encontrado: x" }]);
  assert.equal(await getPlaceForAdmin("x"), null);
});

test("excluir envia DELETE; local que já não existe (404) conta como excluído e outros erros sobem", async () => {
  respond([204]);
  await deletePlace("ru");
  assert.equal(calls[0].url, "/api/places/ru");
  assert.equal(calls[0].init.method, "DELETE");

  respond([404, { detail: "Local não encontrado: ru" }]);
  await deletePlace("ru");

  respond([500, { detail: "erro" }]);
  await assert.rejects(deletePlace("ru"), (error) => error instanceof ApiError && error.status === 500);
});

test("a foto vai por PUT multipart, sem Content-Type fixado, e o servidor devolve o local com a nova URL", async () => {
  respond([200, dto({ photoUrl: "/api/places/ru/photo?v=999" })]);
  const file = new File([new Uint8Array([1, 2, 3])], "fachada.png", { type: "image/png" });
  const place = await uploadPlacePhoto("ru", file);

  assert.equal(calls[0].url, "/api/places/ru/photo");
  assert.equal(calls[0].init.method, "PUT");
  assert.ok(calls[0].init.body instanceof FormData);
  assert.equal((calls[0].init.body as FormData).get("file") instanceof File, true);
  // O navegador define o boundary do multipart: um Content-Type fixado aqui quebraria o envio.
  assert.equal((calls[0].init.headers as Record<string, string>)["Content-Type"], undefined);
  assert.equal(place.photoUrl, "/api/places/ru/photo?v=999");

  respond([400, { detail: "O arquivo precisa ser uma imagem JPG ou PNG válida." }]);
  await assert.rejects(uploadPlacePhoto("ru", file), (error) => error instanceof PlaceValidationError && /imagem/.test(error.message));
});

test("remover a foto envia DELETE em /photo", async () => {
  respond([200, dto({ photoUrl: null })]);
  await deletePlacePhoto("ru");

  assert.equal(calls[0].url, "/api/places/ru/photo");
  assert.equal(calls[0].init.method, "DELETE");
});
