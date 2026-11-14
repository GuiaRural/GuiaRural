// UC39 — Mandar mensagem para o administrador: validação do formulário e o que o frontend envia para POST /api/messages.
// A validação definitiva é do servidor (MessageRequestDTO, com teste em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  ContactValidationError,
  MESSAGE_MAX_LENGTH,
  isValidPhone,
  sendMessage,
  validateMessage,
  type ContactMessage,
} from "../src/app/services/messagesService";

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

const VALID: ContactMessage = {
  name: " Ana Souza ",
  email: " ana@exemplo.com ",
  phone: " (81) 99999-9999 ",
  message: " Onde fica o RU? ",
};

test("mensagem completa não tem erros, com ou sem telefone", () => {
  assert.deepEqual(validateMessage(VALID), {});
  assert.deepEqual(validateMessage({ ...VALID, phone: "" }), {});
});

test("FE-39.01: nome, e-mail e mensagem são obrigatórios (só espaços conta como vazio)", () => {
  assert.deepEqual(validateMessage({ name: " ", email: "", phone: "", message: "   " }), {
    name: "required",
    email: "required",
    message: "required",
  });
});

test("e-mail precisa ter formato válido", () => {
  for (const email of ["ana", "ana@", "ana@exemplo", "ana @exemplo.com"]) {
    assert.equal(validateMessage({ ...VALID, email }).email, "invalidEmail", email);
  }
});

test("RN-UC39-03: mensagem com mais de 500 caracteres é recusada", () => {
  assert.deepEqual(validateMessage({ ...VALID, message: "a".repeat(MESSAGE_MAX_LENGTH) }), {});
  assert.equal(validateMessage({ ...VALID, message: "a".repeat(MESSAGE_MAX_LENGTH + 1) }).message, "tooLong");
});

test("RN-UC39-04: telefone com DDD, fixo ou celular, com ou sem pontuação e +55", () => {
  for (const phone of ["(81) 99999-9999", "81 3333-4444", "8199999999", "81999999999", "+55 81 98888-7777"]) {
    assert.equal(isValidPhone(phone), true, phone);
  }
});

test("RN-UC39-04: telefone sem DDD, com DDD inválido, com letras ou estrangeiro é recusado", () => {
  for (const phone of ["9999-9999", "(01) 3333-4444", "81 89999-9999", "81 9999-99999x", "abc", "+1 555 1234567"]) {
    assert.equal(isValidPhone(phone), false, phone);
  }
  assert.equal(validateMessage({ ...VALID, phone: "9999-9999" }).phone, "invalidPhone");
});

test("envia POST /api/messages com os nomes da API e os campos sem espaços nas pontas", async () => {
  respond(201, { id: 1 });
  await sendMessage(VALID);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/messages");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    nome: "Ana Souza",
    email: "ana@exemplo.com",
    telefone: "(81) 99999-9999",
    mensagem: "Onde fica o RU?",
  });
});

test("telefone vazio não é enviado", async () => {
  respond(201, { id: 1 });
  await sendMessage({ ...VALID, phone: "  " });
  assert.equal("telefone" in JSON.parse(String(calls[0].init.body)), false);
});

test("com campo inválido, nada é enviado", async () => {
  respond(201, { id: 1 });
  await assert.rejects(sendMessage({ ...VALID, email: "" }), ContactValidationError);
  assert.equal(calls.length, 0);
});

test("erro de campo vindo do servidor (400) volta no campo certo", async () => {
  respond(400, {
    detail: "Dados inválidos.",
    fields: { email: "Formato de e-mail inválido", mensagem: "A mensagem deve ter no máximo 500 caracteres", nome: "O nome é obrigatório" },
  });
  await assert.rejects(sendMessage(VALID), (error: unknown) => {
    assert.ok(error instanceof ContactValidationError);
    assert.deepEqual(error.errors, { email: "invalidEmail", message: "tooLong", name: "required" });
    return true;
  });
});

test("falha do servidor sobe como ApiError, para a tela oferecer nova tentativa", async () => {
  respond(500, { detail: "Erro interno" });
  await assert.rejects(sendMessage(VALID), (error: unknown) => error instanceof ApiError && error.status === 500);
});
