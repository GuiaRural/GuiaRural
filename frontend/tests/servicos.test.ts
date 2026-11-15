// UC19 — Adicionar Serviço: o que o frontend envia para /api/services e como interpreta as respostas.
// As regras de validação definitivas são do servidor (ServiceService e ServiceRequestDTO, com teste em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  ServicoValidationError,
  createServico,
  deleteServico,
  categoriesOf,
  filterServicos,
  listServicos,
  listServicosPublicos,
  updateServico,
  validateServico,
  type Servico,
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

test("UC11: o serviço traz os locais publicados onde é prestado (ou lista vazia, se o servidor não mandar)", async () => {
  respond(200, [{ ...CREATED, places: [{ slug: "prae", name: "Prédio da PRAE" }] }, CREATED]);
  const lista = await listServicosPublicos();

  assert.deepEqual(lista[0].places, [{ slug: "prae", name: "Prédio da PRAE" }]);
  assert.deepEqual(lista[1].places, []);
});

test("UC11: a página pública lê /api/services (só os publicados) e converte os nulos", async () => {
  respond(200, [CREATED]);
  const lista = await listServicosPublicos();

  assert.equal(calls[0].url, "/api/services");
  assert.equal(lista.length, 1);
  assert.equal(lista[0].requirements, undefined);
});

// Um serviço já convertido pelo frontend (opcionais ausentes em vez de nulos).
const SERVICO: Servico = { ...CREATED, requirements: undefined, url: undefined, deadline: undefined, places: [] };

test("UC11: o filtro de categorias junta variações de caixa e acento e vem em ordem alfabética", () => {
  const servicos = [
    { ...SERVICO, id: 1, category: "Saúde" },
    { ...SERVICO, id: 2, category: "Documentos" },
    { ...SERVICO, id: 3, category: " saude " },
  ];
  assert.deepEqual(categoriesOf(servicos), ["Documentos", "Saúde"]);
});

test("UC11: a busca ignora acentos e caixa, exige todos os termos e respeita a categoria", () => {
  const servicos = [
    { ...SERVICO, id: 1, name: "Matrícula institucional", category: "Documentos", sector: "DRCA" },
    { ...SERVICO, id: 2, name: "Atendimento psicológico", category: "Saúde", sector: "PRAE", description: "Plantão de escuta" },
  ];
  assert.deepEqual(filterServicos(servicos, "MATRICULA", "").map((s) => s.id), [1]);
  assert.deepEqual(filterServicos(servicos, "prae plantao", "").map((s) => s.id), [2]);
  assert.deepEqual(filterServicos(servicos, "prae matricula", "").map((s) => s.id), []);
  assert.deepEqual(filterServicos(servicos, "", "saude").map((s) => s.id), [2]);
  assert.deepEqual(filterServicos(servicos, "  ", "").map((s) => s.id), [1, 2]);
});

test("UC20: editar envia PUT com os campos limpos e o status de publicação", async () => {
  respond(200, { ...CREATED, active: false });
  const servico = await updateServico(5, INPUT, false);

  assert.equal(calls[0].url, "/api/services/5");
  assert.equal(calls[0].init.method, "PUT");
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
    category: "Documentos",
    name: "Carteira de Estudante",
    sector: "DCE",
    description: "Identificação estudantil",
    steps: ["Separe os documentos.", "Solicite."],
    active: false,
  });
  assert.equal(servico.active, false);
});

test("UC20: editar com dado inválido não chama a API e o erro do servidor vai para o campo", async () => {
  respond(200, CREATED);
  await assert.rejects(updateServico(5, { ...INPUT, steps: ["  "] }, true), ServicoValidationError);
  assert.equal(calls.length, 0);

  respond(400, { fields: { url: "O link deve começar com https://." } });
  await assert.rejects(updateServico(5, INPUT, true), (error) => error instanceof ServicoValidationError && error.errors.url === "invalidUrl");
});

test("UC21: excluir envia DELETE, e serviço que já não existe (404) conta como excluído", async () => {
  respond(204);
  await deleteServico(5);
  assert.equal(calls[0].url, "/api/services/5");
  assert.equal(calls[0].init.method, "DELETE");

  respond(404, { detail: "Serviço não encontrado com ID: 5" });
  await deleteServico(5);
});

test("UC21: excluir sem permissão (403) ou com o servidor fora (500) falha para a tela avisar", async () => {
  respond(403, { detail: "Sem permissão para esta ação." });
  await assert.rejects(deleteServico(5), (error) => error instanceof ApiError && error.status === 403);
  respond(500);
  await assert.rejects(deleteServico(5), (error) => error instanceof ApiError && error.status === 500);
});
