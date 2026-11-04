// UC13 — Cadastrar Administrador (regras do adminsService).
import assert from "node:assert/strict";
import { test } from "node:test";
import { IT_SECTOR } from "../src/app/data/mockAdmins";
import { AdminValidationError, createAdmin, isInstitutionalEmail, type NewAdmin } from "../src/app/services/adminsService";
import { login } from "../src/app/services/authService";

function input(email: string): NewAdmin {
  return { name: "Servidora de Teste", email, sector: "Biblioteca", permission: "editor", password: "provisoria123", sendCredentials: true };
}

test("isInstitutionalEmail aceita só o domínio @ufrpe.br", () => {
  assert.equal(isInstitutionalEmail("nome.sobrenome@ufrpe.br"), true);
  assert.equal(isInstitutionalEmail(" Nome@UFRPE.BR "), true);
  assert.equal(isInstitutionalEmail("nome@gmail.com"), false);
  assert.equal(isInstitutionalEmail("nome@notufrpe.br"), false);
  assert.equal(isInstitutionalEmail("nome@ufrpe.br.exemplo.com"), false);
});

test("fluxo principal: cadastro pela Coordenação de TI já nasce ativo e consegue entrar", async () => {
  const admin = await createAdmin(input("ativo.teste@ufrpe.br"), "Coordenação de TI", IT_SECTOR);
  assert.equal(admin.status, "ativo");
  const result = await login("ativo.teste@ufrpe.br", "provisoria123", false);
  assert.equal(result.ok, true);
});

test("RN-UC13.01: cadastro feito por outro setor fica aguardando aprovação", async () => {
  const admin = await createAdmin(input("aguardando.teste@ufrpe.br"), "PROAC", "Pró-Reitoria de Assuntos Comunitários");
  assert.equal(admin.status, "aguardando");
  assert.deepEqual(await login("aguardando.teste@ufrpe.br", "provisoria123", false), { ok: false, reason: "blocked" });
});

test("o e-mail é guardado em minúsculas e sem espaços", async () => {
  const admin = await createAdmin(input("  Maiusculas.Teste@UFRPE.br "), "Coordenação de TI", IT_SECTOR);
  assert.equal(admin.email, "maiusculas.teste@ufrpe.br");
});

test("FE-13.01: e-mail fora do domínio institucional é recusado no campo e-mail", async () => {
  await assert.rejects(createAdmin(input("fulano@gmail.com"), "Coordenação de TI", IT_SECTOR), (err) => {
    assert.ok(err instanceof AdminValidationError);
    assert.equal(err.field, "email");
    assert.equal(err.message, "O e-mail deve pertencer ao domínio institucional @ufrpe.br.");
    return true;
  });
});

test("e-mail já cadastrado não gera um segundo administrador", async () => {
  await assert.rejects(createAdmin(input("coord.ti@ufrpe.br"), "Coordenação de TI", IT_SECTOR), AdminValidationError);
});
