// UC25 a UC27 — cardápio do RU: o que o frontend envia para /api/menus e como interpreta as respostas.
// As regras definitivas são do servidor (MenuService e MenuRequestDTO, com teste em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  MenuValidationError,
  createMenu,
  deleteMenu,
  getMenuById,
  getWeekMenus,
  listMenus,
  updateMenu,
  type MenuInput,
} from "../src/app/services/menuService";

type Call = { url: string; init: RequestInit };
const calls: Call[] = [];
const realFetch = globalThis.fetch;

function respond(status: number, body?: unknown) {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  calls.length = 0;
});

function menu(overrides: Partial<MenuInput> = {}): MenuInput {
  return {
    date: "2030-03-12",
    shift: "almoco",
    main: " Galinha guisada ",
    vegetarian: "Feijoada vegana",
    sides: "Arroz e feijão",
    salad: "  ",
    dessert: "",
    drink: "Suco",
    ...overrides,
  };
}

const CREATED = {
  id: 4,
  date: "2030-03-12",
  shift: "almoco",
  main: "Galinha guisada",
  vegetarian: "Feijoada vegana",
  sides: "Arroz e feijão",
  salad: null,
  dessert: null,
  drink: "Suco",
};

test("fluxo principal: criar envia os campos limpos, sem opcionais vazios, e converte a resposta", async () => {
  respond(201, CREATED);
  const created = await createMenu(menu());

  assert.equal(calls[0].url, "/api/menus");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    date: "2030-03-12",
    shift: "almoco",
    main: "Galinha guisada",
    vegetarian: "Feijoada vegana",
    sides: "Arroz e feijão",
    drink: "Suco",
  });
  assert.equal(created.id, 4);
  assert.equal(created.salad, "", "opcional nulo vira string vazia para o formulário");
});

test("RN-01 / FE01: campos obrigatórios em branco apontam cada campo pendente e não chamam a API", async () => {
  respond(201, CREATED);
  await assert.rejects(createMenu(menu({ date: "", main: "   ", vegetarian: "" })), (err) => {
    assert.ok(err instanceof MenuValidationError);
    assert.deepEqual([...err.fields].sort(), ["date", "main", "vegetarian"]);
    return true;
  });
  assert.equal(calls.length, 0);
});

test("RN-03 / FE01: dia e turno já cadastrados (409) viram erro nos campos de data e turno", async () => {
  respond(409, { detail: "Já existe um cardápio cadastrado para este dia e turno." });
  await assert.rejects(createMenu(menu()), (err) => {
    assert.ok(err instanceof MenuValidationError);
    assert.deepEqual(err.fields, ["date", "shift"]);
    assert.equal(err.message, "Já existe um cardápio cadastrado para este dia e turno.");
    return true;
  });
});

test("400 do servidor com erros por campo vai para o campo certo", async () => {
  respond(400, { fields: { vegetarian: "A opção vegetariana é obrigatória." } });
  await assert.rejects(createMenu(menu()), (err) => err instanceof MenuValidationError && err.fields.join() === "vegetarian");
});

test("sem permissão (403) ou servidor fora (500) chega como ApiError para a tela avisar", async () => {
  respond(403);
  await assert.rejects(createMenu(menu()), (err) => err instanceof ApiError && err.status === 403);
});

test("UC26: editar envia PUT para o cardápio certo", async () => {
  respond(200, { ...CREATED, main: "Peixe" });
  const updated = await updateMenu(4, menu({ main: "Peixe" }));

  assert.equal(calls[0].url, "/api/menus/4");
  assert.equal(calls[0].init.method, "PUT");
  assert.equal(updated.main, "Peixe");
});

test("UC27: excluir envia DELETE, e cardápio que já não existe (404) conta como excluído", async () => {
  respond(204);
  await deleteMenu(4);
  assert.equal(calls[0].url, "/api/menus/4");
  assert.equal(calls[0].init.method, "DELETE");

  respond(404);
  await deleteMenu(4);

  respond(500);
  await assert.rejects(deleteMenu(4), ApiError);
});

test("a página pública pede só a semana de segunda a domingo", async () => {
  respond(200, [CREATED]);
  // Quarta-feira, 13/11/2030.
  const week = await getWeekMenus(new Date(2030, 10, 13));

  assert.equal(calls[0].url, "/api/menus?from=2030-11-11&to=2030-11-17");
  assert.equal(week.length, 1);
});

test("domingo pertence à semana que começou na segunda anterior", async () => {
  respond(200, []);
  await getWeekMenus(new Date(2030, 10, 17));
  assert.equal(calls[0].url, "/api/menus?from=2030-11-11&to=2030-11-17");
});

test("o painel lista todos e buscar um id inexistente devolve nulo", async () => {
  respond(200, [CREATED]);
  assert.equal((await listMenus()).length, 1);
  assert.equal(calls[0].url, "/api/menus");

  respond(404);
  assert.equal(await getMenuById(99), null);
});
