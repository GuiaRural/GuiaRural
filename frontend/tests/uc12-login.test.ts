// UC12 — Fazer Login: como o frontend interpreta as respostas do backend (/api/auth/login) e protege as escritas.
// As regras em si (domínio, senha, conta ativa, limite de tentativas) são do servidor e têm teste em Java.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { apiDelete, apiGet, apiPost } from "../src/app/lib/api";
import { login } from "../src/app/services/authService";

type Call = { url: string; init: RequestInit };
const calls: Call[] = [];
const realFetch = globalThis.fetch;

function respond(status: number, body?: unknown) {
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(status === 204 || body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  calls.length = 0;
  delete (globalThis as { document?: unknown }).document;
});

const SESSION = { adminId: 7, name: "Equipe", email: "equipe@ufrpe.br", sector: "Comunicação", permission: "editor" };

test("fluxo principal: login correto devolve a sessão enviada pelo servidor", async () => {
  respond(200, SESSION);
  const result = await login("  equipe@ufrpe.br ", "senha", true);
  assert.deepEqual(result, { ok: true, session: SESSION });
  assert.equal(calls[0].url, "/api/auth/login");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { email: "equipe@ufrpe.br", password: "senha", remember: true });
});

test("RN-UC12-01: o motivo domain do servidor vira a mensagem de domínio", async () => {
  respond(400, { detail: "Não foi possível entrar.", reason: "domain" });
  assert.deepEqual(await login("a@gmail.com", "x", false), { ok: false, reason: "domain" });
});

test("FE-12.01: 401 vira credenciais inválidas", async () => {
  respond(401, { reason: "invalid" });
  assert.deepEqual(await login("a@ufrpe.br", "errada", false), { ok: false, reason: "invalid" });
});

test("FE-12.02 / RN-UC12-02: 403 com motivo blocked vira conta bloqueada", async () => {
  respond(403, { reason: "blocked" });
  assert.deepEqual(await login("a@ufrpe.br", "senha", false), { ok: false, reason: "blocked" });
});

test("429 vira limite de tentativas", async () => {
  respond(429, { reason: "rate_limited" });
  assert.deepEqual(await login("a@ufrpe.br", "senha", false), { ok: false, reason: "rate_limited" });
});

test("erro do servidor ou rede fora do ar não é culpa do usuário: unavailable", async () => {
  respond(500);
  assert.deepEqual(await login("a@ufrpe.br", "senha", false), { ok: false, reason: "unavailable" });
  globalThis.fetch = (async () => {
    throw new TypeError("fetch failed");
  }) as typeof fetch;
  assert.deepEqual(await login("a@ufrpe.br", "senha", false), { ok: false, reason: "unavailable" });
});

test("RNF02: escritas levam o token CSRF do cookie no cabeçalho X-XSRF-TOKEN", async () => {
  (globalThis as { document?: unknown }).document = { cookie: "outro=1; XSRF-TOKEN=abc%3D123; mais=2" };
  respond(201, { id: 1 });
  await apiPost("/avisos", { nome: "a", descricao: "b" });
  respond(204);
  await apiDelete("/avisos/1");
  for (const call of calls) {
    assert.equal((call.init.headers as Record<string, string>)["X-XSRF-TOKEN"], "abc=123");
    assert.equal(call.init.credentials, "same-origin");
  }
});

test("leituras não enviam o token CSRF", async () => {
  (globalThis as { document?: unknown }).document = { cookie: "XSRF-TOKEN=abc" };
  respond(200, []);
  await apiGet("/avisos");
  assert.equal((calls[0].init.headers as Record<string, string>)["X-XSRF-TOKEN"], undefined);
});
