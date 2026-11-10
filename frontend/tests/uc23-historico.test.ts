// UC23 — Visualizar logs de mudanças e desfazer (FA01): o histórico vem inteiro do servidor e o desfazer é pedido a
// /api/admin/audit-logs/{id}/restore. As regras de cada restauração são do servidor (RestoreIntegrationTest, em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { listLogs, type AuditLog } from "../src/app/services/auditService";
import { canRestore, restoreFromLog } from "../src/app/services/restoreService";

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

const SERVER_LOG = {
  id: 12,
  at: "2030-03-12T10:00:00Z",
  author: "Nutrição / RU",
  entity: "cardapio",
  entityId: "4",
  entityName: "Cardápio — almoço de 12/03/2030",
  action: "editado",
  before: { main: "Frango" },
  after: { main: "Peixe" },
};

function log(entity: AuditLog["entity"]): AuditLog {
  return { id: "12", at: SERVER_LOG.at, author: "x", entity, entityId: "4", entityName: "y", action: "editado", before: {}, after: {} };
}

test("o histórico vem do servidor, com o nome legível da entidade", async () => {
  respond(200, [SERVER_LOG, { ...SERVER_LOG, id: 13, entity: "administrador" }]);
  const logs = await listLogs();

  assert.equal(calls[0].url, "/api/admin/audit-logs?limit=300");
  assert.equal(logs.length, 2, "sem registros de exemplo misturados");
  assert.equal(logs[0].id, "12");
  assert.equal(logs[0].entity, "Cardápio");
  assert.equal(logs[1].entity, "Administrador");
});

test("sem servidor, a lista falha para a tela avisar (em vez de mostrar só dados de exemplo)", async () => {
  respond(500);
  await assert.rejects(listLogs());
});

test("todas as entidades do painel podem ser desfeitas, menos administradores (D5)", () => {
  for (const entity of ["Local", "Serviço", "Cardápio", "Aviso", "Acolhimento"] as const) {
    assert.equal(canRestore(log(entity)), true, entity);
  }
  assert.equal(canRestore(log("Administrador")), false);
});

test("FA01: desfazer pede ao servidor a restauração do log", async () => {
  respond(204);
  await restoreFromLog(log("Cardápio"));
  assert.equal(calls[0].url, "/api/admin/audit-logs/12/restore");
  assert.equal(calls[0].init.method, "POST");
});

test("a recusa do servidor chega com a mensagem dele (ex.: já existe cardápio no dia e turno)", async () => {
  respond(409, { detail: "Já existe um cardápio cadastrado para este dia e turno." });
  await assert.rejects(restoreFromLog(log("Cardápio")), { message: "Já existe um cardápio cadastrado para este dia e turno." });

  respond(403);
  await assert.rejects(restoreFromLog(log("Aviso")), { message: "Seu perfil não permite desfazer mudanças." });
});

test("administrador não chega a chamar a API", async () => {
  respond(204);
  await assert.rejects(restoreFromLog(log("Administrador")));
  assert.equal(calls.length, 0);
});
