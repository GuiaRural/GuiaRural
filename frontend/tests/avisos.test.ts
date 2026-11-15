// Avisos do campus: o que o frontend valida e envia para /api/avisos ao publicar.
// As regras definitivas são do servidor (AvisoRequestDTO, com teste de integração em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  AvisoValidationError,
  DESCRICAO_MAX_LENGTH,
  NOME_MAX_LENGTH,
  createAviso,
  updateAviso,
  validateAviso,
} from "../src/app/services/avisosService";

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

test("título e descrição são obrigatórios e têm limite de tamanho", () => {
  assert.deepEqual(validateAviso({ nome: "  ", descricao: "" }), { nome: "required", descricao: "required" });
  assert.deepEqual(validateAviso({ nome: "x".repeat(NOME_MAX_LENGTH + 1), descricao: "y".repeat(DESCRICAO_MAX_LENGTH + 1) }), {
    nome: "tooLong",
    descricao: "tooLong",
  });
  assert.deepEqual(validateAviso({ nome: "x".repeat(NOME_MAX_LENGTH), descricao: "ok" }), {});
});

test("com erro de validação local não chama a API", async () => {
  respond(201, {});
  await assert.rejects(createAviso({ nome: "", descricao: "texto" }), AvisoValidationError);
  assert.equal(calls.length, 0);
});

test("publicar envia título e descrição sem espaços nas pontas e devolve o aviso criado", async () => {
  const criado = { id: 9, nome: "Manutenção", descricao: "Sábado", data: "2026-11-09T10:00:00" };
  respond(201, criado);

  assert.deepEqual(await createAviso({ nome: "  Manutenção ", descricao: " Sábado  " }), criado);
  assert.equal(calls[0].url, "/api/avisos");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { nome: "Manutenção", descricao: "Sábado" });
});

test("400 do servidor com erros por campo vira AvisoValidationError no campo certo", async () => {
  respond(400, { detail: "Dados inválidos.", fields: { nome: "O nome não pode ter mais que 255 caracteres.", descricao: "A descrição é obrigatória" } });

  await assert.rejects(createAviso({ nome: "a", descricao: "b" }), (error) => {
    assert.ok(error instanceof AvisoValidationError);
    assert.deepEqual(error.errors, { nome: "tooLong", descricao: "required" });
    return true;
  });
});

test("403 (perfil sem permissão) chega como ApiError para a tela explicar", async () => {
  respond(403, { detail: "Sem permissão para esta ação." });
  await assert.rejects(createAviso({ nome: "a", descricao: "b" }), (error) => error instanceof ApiError && error.status === 403);
});

test("editar envia PUT com título e descrição limpos e devolve o aviso atualizado", async () => {
  const atualizado = { id: 9, nome: "Manutenção adiada", descricao: "Domingo", data: "2026-11-09T10:00:00" };
  respond(200, atualizado);

  assert.deepEqual(await updateAviso(9, { nome: " Manutenção adiada ", descricao: "Domingo " }), atualizado);
  assert.equal(calls[0].url, "/api/avisos/9");
  assert.equal(calls[0].init.method, "PUT");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { nome: "Manutenção adiada", descricao: "Domingo" });
});

test("editar com campo em branco não chama a API, e aviso que não existe mais (404) chega como ApiError", async () => {
  respond(200, {});
  await assert.rejects(updateAviso(9, { nome: "  ", descricao: "texto" }), AvisoValidationError);
  assert.equal(calls.length, 0);

  respond(404, { detail: "Aviso não encontrado" });
  await assert.rejects(updateAviso(9, { nome: "a", descricao: "b" }), (error) => error instanceof ApiError && error.status === 404);
});
