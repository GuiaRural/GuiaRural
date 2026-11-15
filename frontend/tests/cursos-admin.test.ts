// Cursos no painel (UC35, UC36): o que o frontend valida e envia para /api/courses.
// As regras definitivas são do servidor (CourseRequestDTO e CourseService, com testes em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError } from "../src/app/lib/api";
import {
  CourseValidationError,
  createCourse,
  deleteCourse,
  emptyCourseInput,
  updateCourse,
  validateCourse,
  type CourseInput,
} from "../src/app/services/coursesService";

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

const valid = (): CourseInput => ({
  ...emptyCourseInput(),
  departmentId: "3",
  name: "  Bacharelado em Ciência da Computação  ",
  level: "GRADUACAO",
  type: "BACHARELADO",
});

const sent = () => JSON.parse(String(calls[0].init.body));

test("RN-UC35-01: nome em branco não pode ser salvo", () => {
  assert.deepEqual(Object.keys(validateCourse({ ...valid(), name: "   " })), ["name"]);
});

test("departamento, nível e tipo são obrigatórios", () => {
  const errors = validateCourse({ ...emptyCourseInput(), name: "Curso" });
  assert.deepEqual(Object.keys(errors).sort(), ["departmentId", "level", "type"]);
});

test("D14: nível e tipo precisam combinar", () => {
  assert.ok(validateCourse({ ...valid(), level: "GRADUACAO", type: "STRICTO_SENSU" }).type);
  assert.ok(validateCourse({ ...valid(), level: "POS", type: "LICENCIATURA" }).type);
  assert.deepEqual(validateCourse({ ...valid(), level: "POS", type: "STRICTO_SENSU" }), {});
});

test("números fora do limite são recusados; vazios são aceitos", () => {
  const errors = validateCourse({ ...valid(), durationSemesters: "31", mecGrade: "6", capesGrade: "8", totalWorkloadHours: "1.5" });
  assert.deepEqual(Object.keys(errors).sort(), ["capesGrade", "durationSemesters", "mecGrade", "totalWorkloadHours"]);
  assert.deepEqual(validateCourse({ ...valid(), durationSemesters: "8", mecGrade: "5", capesGrade: "7", totalWorkloadHours: "3200" }), {});
});

test("e-mails com formato inválido e textos longos demais são recusados", () => {
  const errors = validateCourse({ ...valid(), email: "sem-arroba", secondaryEmail: "a@b.c", extension: "12345678901" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "extension"]);
});

test("cadastro: envia POST /api/courses com campos limpos e vazios como nulo", async () => {
  respond(201, { id: 9, name: "Bacharelado em Ciência da Computação", active: true });
  await createCourse({ ...valid(), durationSemesters: "8", mecGrade: "4", coordinatorName: "  ", code: " 142 " });
  assert.equal(calls[0].url, "/api/courses");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(sent(), {
    departmentId: 3,
    name: "Bacharelado em Ciência da Computação",
    level: "GRADUACAO",
    type: "BACHARELADO",
    code: "142",
    modality: null,
    shift: null,
    durationSemesters: 8,
    totalWorkloadHours: null,
    mecGrade: 4,
    capesGrade: null,
    description: null,
    active: true,
    coordinatorName: null,
    viceCoordinatorName: null,
    officeLocation: null,
    officeHours: null,
    attendanceMode: null,
    phone: null,
    extension: null,
    email: null,
    secondaryEmail: null,
  });
});

test("edição: envia PUT /api/courses/{id} e leva o `active` escolhido", async () => {
  respond(200, { id: 9, name: "X", active: false });
  await updateCourse(9, { ...valid(), active: false });
  assert.equal(calls[0].url, "/api/courses/9");
  assert.equal(calls[0].init.method, "PUT");
  assert.equal(sent().active, false);
});

test("FE-35.01: com campo inválido nada é enviado ao servidor", async () => {
  respond(200, {});
  await assert.rejects(createCourse({ ...valid(), name: "" }), CourseValidationError);
  assert.equal(calls.length, 0);
});

test("400 do servidor: o erro volta no campo certo e a regra geral vai para o resumo", async () => {
  respond(400, { detail: "Confira os campos.", fields: { email: "E-mail inválido.", desconhecido: "x" } });
  await assert.rejects(createCourse(valid()), (error: unknown) => {
    assert.ok(error instanceof CourseValidationError);
    assert.deepEqual(error.errors, { email: "E-mail inválido." });
    assert.equal(error.summary, "Confira os campos.");
    return true;
  });
});

test("falha que não é 400 (ex.: 500) chega como ApiError, sem virar erro de campo", async () => {
  respond(500);
  await assert.rejects(createCourse(valid()), (error: unknown) => error instanceof ApiError && error.status === 500);
});

test("UC36: exclui com DELETE; 404 conta como sucesso; outra falha propaga", async () => {
  respond(204);
  await deleteCourse(4);
  assert.equal(calls[0].url, "/api/courses/4");
  assert.equal(calls[0].init.method, "DELETE");

  respond(404);
  await deleteCourse(4);

  respond(500);
  await assert.rejects(deleteCourse(4), (error: unknown) => error instanceof ApiError && error.status === 500);
});
