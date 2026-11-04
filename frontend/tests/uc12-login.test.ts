// UC12 — Fazer Login (regras do authService com os administradores de demonstração).
import assert from "node:assert/strict";
import { test } from "node:test";
import { login } from "../src/app/services/authService";

const PASSWORD = "guiarural123";

test("fluxo principal: administrador ativo entra e recebe a sessão", async () => {
  const result = await login("coord.ti@ufrpe.br", PASSWORD, false);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.session.email, "coord.ti@ufrpe.br");
    assert.equal(result.session.permission, "geral");
    assert.ok(result.session.token);
  }
});

test("o e-mail é comparado sem diferenciar maiúsculas e espaços", async () => {
  const result = await login("  Coord.TI@UFRPE.br ", PASSWORD, false);
  assert.equal(result.ok, true);
});

test("RN-UC12-01: e-mail fora do domínio @ufrpe.br é recusado", async () => {
  assert.deepEqual(await login("coord.ti@gmail.com", PASSWORD, false), { ok: false, reason: "domain" });
});

test("FE-12.01: senha incorreta não autentica", async () => {
  assert.deepEqual(await login("coord.ti@ufrpe.br", "senha-errada", false), { ok: false, reason: "invalid" });
});

test("FE-12.01: e-mail institucional sem cadastro não autentica", async () => {
  assert.deepEqual(await login("ninguem@ufrpe.br", PASSWORD, false), { ok: false, reason: "invalid" });
});

test("FE-12.02 / RN-UC12-02: conta aguardando aprovação fica bloqueada", async () => {
  assert.deepEqual(await login("secretaria.dc@ufrpe.br", PASSWORD, false), { ok: false, reason: "blocked" });
});
