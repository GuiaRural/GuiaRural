// Fase 6 (RF04), cursos: o frontend pede o idioma ao servidor e a resposta traz o que a tela precisa para sinalizar
// tradução automática e texto em português. A resolução do idioma é do servidor (CourseService, com testes em Java).
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getCourse, getDepartmentCourses } from "../src/app/services/coursesService";

const calls: string[] = [];
const realFetch = globalThis.fetch;

function respond(body: unknown) {
  globalThis.fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  calls.length = 0;
});

test("o curso é pedido com o idioma da tela, separado do id", async () => {
  respond({ id: 12, name: "Computer Science", lang: "en", machineTranslated: true, translatedLangs: ["en"] });
  const course = await getCourse("12:en");
  assert.equal(calls[0], "/api/courses/12?lang=en");
  assert.equal(course.machineTranslated, true);
  assert.equal(course.lang, "en");
});

test("a lista do departamento também leva o idioma", async () => {
  respond({ departmentId: 3, programsOffered: 0, groups: [], coordinations: [] });
  await getDepartmentCourses("3:es");
  assert.equal(calls[0], "/api/departments/3/courses?lang=es");
});

test("trocar o idioma refaz a chamada com outro parâmetro", async () => {
  respond({ id: 12 });
  await getCourse("12:pt");
  await getCourse("12:es");
  assert.deepEqual(calls, ["/api/courses/12?lang=pt", "/api/courses/12?lang=es"]);
});
