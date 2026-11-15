// UC13 — Cadastrar Administrador: o que o frontend envia para /api/admin/admins e como interpreta as respostas.
// As regras definitivas (status inicial, perfil geral, e-mail único) são do servidor (AdminServiceTest e
// AdminManagementIntegrationTest, em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  AdminValidationError,
  approveAdmin,
  createAdmin,
  isInstitutionalEmail,
  listAdmins,
  revokeAdmin,
  type NewAdmin,
} from "../src/app/services/adminsService";

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

function input(email: string): NewAdmin {
  return { name: " Servidora de Teste ", email, sector: "Biblioteca", permission: "editor", password: "senha-forte-123" };
}

const CREATED = { id: 7, name: "Servidora de Teste", email: "servidora@ufrpe.br", sector: "Biblioteca", permission: "editor", status: "aguardando" };

test("isInstitutionalEmail aceita só o domínio @ufrpe.br", () => {
  assert.equal(isInstitutionalEmail("nome.sobrenome@ufrpe.br"), true);
  assert.equal(isInstitutionalEmail(" Nome@UFRPE.BR "), true);
  assert.equal(isInstitutionalEmail("nome@gmail.com"), false);
  assert.equal(isInstitutionalEmail("nome@notufrpe.br"), false);
  assert.equal(isInstitutionalEmail("nome@ufrpe.br.exemplo.com"), false);
});

test("fluxo principal: envia nome limpo, e-mail em minúsculas e a senha, e devolve o status decidido pelo servidor", async () => {
  respond(201, CREATED);
  const admin = await createAdmin(input("  Servidora@UFRPE.br "));

  assert.equal(calls[0].url, "/api/admin/admins");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    name: "Servidora de Teste",
    email: "servidora@ufrpe.br",
    sector: "Biblioteca",
    permission: "editor",
    password: "senha-forte-123",
  });
  assert.equal(admin.status, "aguardando");
});

test("FE-13.01: e-mail fora do domínio institucional é recusado no campo e-mail, sem chamar a API", async () => {
  respond(201, CREATED);
  await assert.rejects(createAdmin(input("fulano@gmail.com")), (err) => {
    assert.ok(err instanceof AdminValidationError);
    assert.equal(err.field, "email");
    assert.equal(err.message, "O e-mail deve pertencer ao domínio institucional @ufrpe.br.");
    return true;
  });
  assert.equal(calls.length, 0);
});

test("e-mail já cadastrado (409) vira erro no campo e-mail", async () => {
  respond(409, { detail: "Já existe um administrador com este e-mail." });
  await assert.rejects(createAdmin(input("coord.ti@ufrpe.br")), (err) => {
    assert.ok(err instanceof AdminValidationError);
    assert.equal(err.field, "email");
    assert.equal(err.message, "Já existe um administrador com este e-mail.");
    return true;
  });
});

test("400 com erro por campo aponta o campo certo", async () => {
  respond(400, { detail: "Dados inválidos.", fields: { password: "A senha deve ter de 8 a 72 caracteres." } });
  await assert.rejects(createAdmin(input("servidora@ufrpe.br")), (err) => {
    assert.ok(err instanceof AdminValidationError);
    assert.equal(err.field, "password");
    return true;
  });
});

test("sem perfil geral (403) chega como ApiError para a tela avisar", async () => {
  respond(403);
  await assert.rejects(createAdmin(input("servidora@ufrpe.br")), (err) => err instanceof ApiError && err.status === 403);
});

test("aprovar e revogar enviam PATCH com o novo status", async () => {
  respond(200, { ...CREATED, status: "ativo" });
  await approveAdmin(7);
  assert.equal(calls[0].url, "/api/admin/admins/7");
  assert.equal(calls[0].init.method, "PATCH");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { status: "ativo" });

  respond(200, { ...CREATED, status: "revogado" });
  await revokeAdmin(7);
  assert.deepEqual(JSON.parse(String(calls[1].init.body)), { status: "revogado" });
});

test("recusa do servidor ao revogar (ex.: a própria conta) mantém a mensagem para a tela", async () => {
  respond(400, { detail: "Você não pode alterar o seu próprio acesso." });
  await assert.rejects(revokeAdmin(1), (err) => err instanceof ApiError && err.detail === "Você não pode alterar o seu próprio acesso.");
});

test("a lista vem do servidor", async () => {
  respond(200, [CREATED]);
  assert.equal((await listAdmins()).length, 1);
  assert.equal(calls[0].url, "/api/admin/admins");
});
