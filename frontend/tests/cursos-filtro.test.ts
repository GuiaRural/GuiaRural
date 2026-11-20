// CT-008.02: filtro de cursos e departamentos da página /cursos (no cliente, sobre as listas já carregadas).
import assert from "node:assert/strict";
import { test } from "node:test";
import { filterCatalog } from "../src/app/lib/catalogFilter";

const departments = [
  { id: 1, name: "Departamento de Computação", shortName: "DC", academicCenter: null },
  { id: 2, name: "Departamento de Zootecnia", shortName: "DZ", academicCenter: "Ciências Agrárias" },
];
const courses = [
  { id: 10, departmentId: 1, name: "Bacharelado em Sistemas de Informação" },
  { id: 11, departmentId: 1, name: "Licenciatura em Computação" },
  { id: 20, departmentId: 2, name: "Bacharelado em Zootecnia" },
];

test("sem termo, lista todos os departamentos sem destacar cursos", () => {
  const result = filterCatalog(departments, courses, "   ");
  assert.deepEqual(result.map((m) => m.department.id), [1, 2]);
  assert.ok(result.every((m) => m.courses.length === 0));
});

test("casa o nome do curso, sem acento nem maiúscula, e mostra o curso sob o departamento", () => {
  const result = filterCatalog(departments, courses, "sistemas de informacao");
  assert.equal(result.length, 1);
  assert.equal(result[0].department.id, 1);
  assert.deepEqual(result[0].courses.map((c) => c.id), [10]);
});

test("casa a sigla e o centro acadêmico do departamento", () => {
  assert.deepEqual(filterCatalog(departments, courses, "dz").map((m) => m.department.id), [2]);
  assert.deepEqual(filterCatalog(departments, courses, "agrarias").map((m) => m.department.id), [2]);
});

test("termo sem correspondência devolve lista vazia (a tela mostra \"Nenhum curso encontrado.\")", () => {
  assert.deepEqual(filterCatalog(departments, courses, "dasdegvvfxc"), []);
});
