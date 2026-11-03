// UC14 — Adicionar Local: validação do horário de funcionamento (lib/hours).
import assert from "node:assert/strict";
import { test } from "node:test";
import { isOpenNow, isValidHours } from "../src/app/lib/hours";

test("aceita um intervalo e intervalos separados por vírgula", () => {
  assert.equal(isValidHours("07:00-18:00"), true);
  assert.equal(isValidHours("11:00-14:00, 17:30-19:30"), true);
  assert.equal(isValidHours("00:00-23:59"), true);
  assert.equal(isValidHours("08:00–17:00"), true); // traço longo, comum ao colar de documentos
});

test("recusa abertura igual ou depois do fechamento", () => {
  assert.equal(isValidHours("18:00-07:00"), false);
  assert.equal(isValidHours("08:00-08:00"), false);
});

test("recusa formatos incompletos", () => {
  assert.equal(isValidHours("8h-18h"), false);
  assert.equal(isValidHours("07:00"), false);
  assert.equal(isValidHours("07:00-18:00,"), false);
});

test("recusa hora acima de 23 e minuto acima de 59", () => {
  assert.equal(isValidHours("25:00-26:00"), false);
  assert.equal(isValidHours("07:99-18:00"), false);
});

// 2026-11-04 é quarta-feira; 13:00 UTC = 10:00 em Recife (UTC−3).
const WEDNESDAY_10H_RECIFE = new Date("2026-11-04T13:00:00Z");
const SATURDAY_10H_RECIFE = new Date("2026-11-07T13:00:00Z");

test("isOpenNow usa o horário de Recife em dias úteis", () => {
  assert.equal(isOpenNow("07:00-18:00", WEDNESDAY_10H_RECIFE), true);
  assert.equal(isOpenNow("11:00-14:00, 17:30-19:30", WEDNESDAY_10H_RECIFE), false);
  assert.equal(isOpenNow("07:00-18:00", SATURDAY_10H_RECIFE), false);
});
