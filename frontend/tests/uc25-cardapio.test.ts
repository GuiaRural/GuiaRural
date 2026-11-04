// UC25 — Criar cardápio do RU (regras do menuService).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Menu } from "../src/app/data/mockMenus";
import { createMenu, listMenus, MenuValidationError } from "../src/app/services/menuService";

// Data longe da semana corrente, para não colidir com os cardápios de demonstração.
const DATE = "2030-03-12";

function menu(overrides: Partial<Omit<Menu, "id">> = {}): Omit<Menu, "id"> {
  return {
    date: DATE,
    shift: "almoco",
    main: "Galinha guisada",
    vegetarian: "Feijoada vegana",
    sides: "Arroz e feijão",
    salad: "Alface",
    dessert: "Fruta",
    drink: "Suco",
    ...overrides,
  };
}

test("fluxo principal: cardápio válido é criado e aparece na listagem", async () => {
  const created = await createMenu(menu(), "Nutrição / RU");
  assert.ok(created.id);
  const all = await listMenus();
  assert.ok(all.some((m) => m.id === created.id));
});

test("RN-01 / FE01: campos obrigatórios em branco apontam cada campo pendente", async () => {
  await assert.rejects(createMenu(menu({ date: "", main: "   ", vegetarian: "" }), "Nutrição / RU"), (err) => {
    assert.ok(err instanceof MenuValidationError);
    assert.deepEqual([...err.fields].sort(), ["date", "main", "vegetarian"]);
    return true;
  });
});

test("RN-01: acompanhamentos, salada, sobremesa e bebida são opcionais", async () => {
  const created = await createMenu(menu({ date: "2030-03-13", sides: "", salad: "", dessert: "", drink: "" }), "Nutrição / RU");
  assert.equal(created.date, "2030-03-13");
});

test("RN-03 / FE01: não aceita um segundo cardápio no mesmo dia e turno", async () => {
  await createMenu(menu({ date: "2030-03-14", shift: "jantar" }), "Nutrição / RU");
  await assert.rejects(createMenu(menu({ date: "2030-03-14", shift: "jantar", main: "Outro prato" }), "Nutrição / RU"), (err) => {
    assert.ok(err instanceof MenuValidationError);
    assert.deepEqual(err.fields, ["date", "shift"]);
    return true;
  });
});

test("RN-03: o mesmo dia aceita almoço e jantar separados", async () => {
  await createMenu(menu({ date: "2030-03-15", shift: "almoco" }), "Nutrição / RU");
  const dinner = await createMenu(menu({ date: "2030-03-15", shift: "jantar" }), "Nutrição / RU");
  assert.equal(dinner.shift, "jantar");
});
