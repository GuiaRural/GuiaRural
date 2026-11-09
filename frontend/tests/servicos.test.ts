// UC19 — Adicionar Serviço: o que o frontend envia para /api/services e como interpreta as respostas.
// As regras de validação definitivas são do servidor (ServiceService e ServiceRequestDTO, com teste em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  ServicoValidationError,
  createServico,
  listServicos,
  validateServico,
  type ServicoInput,
} from "../src/app/services/servicosService";

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

const INPUT: ServicoInput = {
  category: " Documentos ",
  name: " Carteira de Estudante ",
  sector: " DCE ",
  description: " Identificação estudantil ",
  steps: [" Separe os documentos. ", "   ", "Solicite."],
  requirements: "  ",
  url: "",
  deadline: undefined,
};

const CREATED = {
  id: 5,
  category: "Documentos",
  name: "Carteira de Estudante",
  sector: "DCE",
  description: "Identificação estudantil",
  steps: ["Separe os documentos.", "Solicite."],
  requirements: null,
  url: null,
  deadline: null,
  active: true,
};

test("RN-19.01: campos obrigatórios, tamanho do nome, passo e link HTTPS são checados antes de enviar", () => {
  const errors = validateServico({ ...INPUT, category: "", name: "x".repeat(101), steps: ["  "], url: "http://inseguro.org" });
  assert.deepEqual(errors, { category: "required", name: "tooLong", steps: "required", url: "invalidUrl" });
  assert.deepEqual(validateServico(INPUT), {});
});

test("enviar com erro de validação local não chama a API", async () => {
  respond(201, CREATED);
  await assert.rejects(createServico({ ...INPUT, name: "" }), ServicoValidationError);
  assert.equal(calls.length, 0);
});

test("cadastrar envia os campos limpos, sem passos em branco nem opcionais vazios", async () => {
  respond(201, CREATED);
  await createServico(INPUT);

  assert.equal(calls[0].url, "/api/services");
  assert.equal(calls[0].init.method, "POST");
  // JSON.stringify descarta os undefined: requirements, url e deadline vazios não vão no corpo.
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    category: "Documentos",
    name: "Carteira de Estudante",
    sector: "DCE",
    description: "Identificação estudantil",
    steps: ["Separe os documentos.", "Solicite."],
  });
});

test("a resposta do servidor vira um Servico, com opcionais nulos como ausentes", async () => {
  respond(201, CREATED);
  const servico = await createServico(INPUT);

  assert.equal(servico.id, 5);
  assert.equal(servico.active, true);
  assert.equal(servico.requirements, undefined);
  assert.equal(servico.url, undefined);
  assert.equal(servico.deadline, undefined);
});

test("400 do servidor com erros por campo vira ServicoValidationError no campo certo", async () => {
  respond(400, { detail: "Dados inválidos.", fields: { "steps[0]": "Cada passo pode ter até 500 caracteres.", url: "O link deve começar com https://.", sector: "O setor responsável é obrigatório." } });

  await assert.rejects(createServico(INPUT), (error) => {
    assert.ok(error instanceof ServicoValidationError);
    assert.deepEqual(error.errors, { steps: "tooLong", url: "invalidUrl", sector: "required" });
    return true;
  });
});

test("403 (perfil sem permissão) e 401 (sem sessão) chegam como ApiError para a tela explicar", async () => {
  respond(403, { detail: "Sem permissão para esta ação." });
  await assert.rejects(createServico(INPUT), (error) => error instanceof ApiError && error.status === 403);
  respond(401, { detail: "Autenticação necessária." });
  await assert.rejects(createServico(INPUT), (error) => error instanceof ApiError && error.status === 401);
});

test("a lista do painel vem de /api/admin/services (inclui despublicados) e converte os nulos", async () => {
  respond(200, [CREATED, { ...CREATED, id: 6, name: "Antigo", active: false, requirements: "Documento", url: "https://x.org", deadline: "Até 10/02" }]);
  const lista = await listServicos();

  assert.equal(calls[0].url, "/api/admin/services");
  assert.equal(lista.length, 2);
  assert.equal(lista[1].active, false);
  assert.equal(lista[1].requirements, "Documento");
  assert.equal(lista[1].deadline, "Até 10/02");
});
