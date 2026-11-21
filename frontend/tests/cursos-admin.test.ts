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
  inputOf,
  splitPrerequisites,
  updateCourse,
  validateCourse,
  validateSubjects,
  type CourseDetail,
  type CourseInput,
  type SubjectInput,
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

const subject = (patch: Partial<SubjectInput> = {}): SubjectInput => ({
  key: -1,
  period: "1",
  code: "AGR101",
  name: "Introdução à Agronomia",
  syllabus: "",
  workloadHours: "60",
  credits: "4",
  nature: "OBRIGATORIA",
  prerequisites: "",
  ...patch,
});

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
    subjects: [],
  });
});

test("5c: a matriz vai no payload com números, período nulo nas optativas e pré-requisitos em lista", async () => {
  respond(200, { id: 9, name: "X", active: true });
  await updateCourse(9, {
    ...valid(),
    subjects: [
      subject({ code: " AGR101 ", syllabus: "  " }),
      subject({ key: -2, period: "", code: "AGR900", credits: "", nature: "OPTATIVA", prerequisites: " AGR101 , AGR102,, " }),
    ],
  });
  assert.deepEqual(sent().subjects, [
    { period: 1, code: "AGR101", name: "Introdução à Agronomia", syllabus: null, workloadHours: 60, credits: 4, nature: "OBRIGATORIA", prerequisites: [] },
    { period: null, code: "AGR900", name: "Introdução à Agronomia", syllabus: null, workloadHours: 60, credits: null, nature: "OPTATIVA", prerequisites: ["AGR101", "AGR102"] },
  ]);
});

test("5c: disciplina sem código, nome ou carga horária válida é recusada, e nada é enviado", async () => {
  respond(200, {});
  const errors = validateSubjects([subject({ code: " ", name: "", workloadHours: "0" }), subject({ code: "OK1" })]);
  assert.deepEqual(Object.keys(errors[0]).sort(), ["code", "name", "workloadHours"]);
  assert.equal(errors[1], undefined);
  await assert.rejects(
    createCourse({ ...valid(), subjects: [subject({ code: "" })] }),
    (error: unknown) => error instanceof CourseValidationError && Boolean(error.subjectErrors[0]?.code),
  );
  assert.equal(calls.length, 0);
});

test("5c: código repetido (sem diferenciar caixa), créditos e pré-requisitos fora do limite", () => {
  const errors = validateSubjects([
    subject({ code: "AGR101" }),
    subject({ key: -2, code: " agr101 " }),
    subject({ key: -3, code: "X", credits: "101", prerequisites: Array.from({ length: 31 }, (_, i) => `P${i}`).join(",") }),
  ]);
  assert.equal(errors[1]?.code, "Código repetido na matriz.");
  assert.ok(errors[2]?.credits);
  assert.ok(errors[2]?.prerequisites);
  assert.equal(errors[0], undefined);
});

test("5c: erro do servidor em subjects[i].campo volta na linha certa", async () => {
  respond(400, { detail: "Confira os campos.", fields: { "subjects[1].code": "O código da disciplina é obrigatório.", "subjects[0].desconhecido": "x" } });
  await assert.rejects(createCourse({ ...valid(), subjects: [subject(), subject({ key: -2, code: "B" })] }), (error: unknown) => {
    assert.ok(error instanceof CourseValidationError);
    assert.deepEqual(error.subjectErrors, { 1: { code: "O código da disciplina é obrigatório." } });
    return true;
  });
});

test("5c: o formulário carrega a matriz do curso (ementa e créditos não se perdem) e splitPrerequisites limpa a lista", () => {
  const detail = {
    id: 9, code: null, name: "Agronomia", level: "GRADUACAO", type: "BACHARELADO", modality: null, shift: null,
    durationSemesters: 10, totalWorkloadHours: 3600, mecGrade: null, capesGrade: null, description: null, active: true,
    departmentId: 3, departmentName: "D", departmentShortName: null, academicCenter: null,
    coordination: {
      coordinatorName: null, viceCoordinatorName: null, officeLocation: null, officeHours: null, attendanceMode: null,
      phone: null, extension: null, email: null, secondaryEmail: null,
    },
    subjects: [
      { id: 7, period: 2, code: "AGR201", name: "Solos", syllabus: "Ementa", workloadHours: 60, credits: 4, nature: "OBRIGATORIA", prerequisites: ["AGR101", "AGR102"] },
      { id: 8, period: null, code: "AGR900", name: "Optativa", syllabus: null, workloadHours: 30, credits: null, nature: "OPTATIVA", prerequisites: [] },
    ],
  } as unknown as CourseDetail;
  const { subjects } = inputOf(detail);
  assert.deepEqual(subjects[0], { key: 7, period: "2", code: "AGR201", name: "Solos", syllabus: "Ementa", workloadHours: "60", credits: "4", nature: "OBRIGATORIA", prerequisites: "AGR101, AGR102" });
  assert.equal(subjects[1].period, "");
  assert.equal(subjects[1].credits, "");
  assert.deepEqual(splitPrerequisites(" A , ,B,"), ["A", "B"]);
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

// CT-036.03 (FE-36.01): sem conexão, o pedido nem chega ao servidor. A falha precisa chegar ao CourseForm (que
// mostra "Não foi possível concluir a exclusão. O curso foi mantido sem alterações.") e nunca virar sucesso, como o 404.
// O lado do banco (transação desfeita) está em CourseDeleteFailureIntegrationTest.java.
test("CT-036.03: queda de conexão na exclusão propaga o erro em vez de contar como excluído", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
  await assert.rejects(deleteCourse(4));
});
