// CT-040.02 a 040.04: filtro por categoria fixa do Guia de Recife.
import assert from "node:assert/strict";
import { test } from "node:test";
import { isSameFilter, matchesFilter } from "../src/app/lib/recifeFilter";

const spots = [
  { slug: "olinda", category: "historia-cultura" },
  { slug: "irb", category: "arte-museus" },
  { slug: "novo", category: null },
];

test("'Todas' mostra todos os lugares", () => {
  assert.equal(spots.filter((s) => matchesFilter(s, { kind: "all" })).length, 3);
});

test("uma categoria mostra só os lugares dela", () => {
  const result = spots.filter((s) => matchesFilter(s, { kind: "category", slug: "historia-cultura" }));
  assert.deepEqual(result.map((s) => s.slug), ["olinda"]);
});

test("categoria sem lugares fica vazia (mostra a mensagem de vazio, CT-040.04)", () => {
  assert.equal(spots.filter((s) => matchesFilter(s, { kind: "category", slug: "gastronomia" })).length, 0);
});

test("'Outros' pega só o lugar sem categoria", () => {
  assert.deepEqual(spots.filter((s) => matchesFilter(s, { kind: "other" })).map((s) => s.slug), ["novo"]);
});

test("isSameFilter compara tipo e slug", () => {
  assert.ok(isSameFilter({ kind: "all" }, { kind: "all" }));
  assert.ok(isSameFilter({ kind: "category", slug: "a" }, { kind: "category", slug: "a" }));
  assert.ok(!isSameFilter({ kind: "category", slug: "a" }, { kind: "category", slug: "b" }));
  assert.ok(!isSameFilter({ kind: "other" }, { kind: "all" }));
});
