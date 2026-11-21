// Filtro da página /cursos (CT-008.02): roda no cliente, sobre as listas que a página já carregou.
// Um departamento aparece se o nome, a sigla ou o centro casarem com o termo, ou se algum curso dele casar.

type DepartmentLike = { id: number; name: string; shortName: string | null; academicCenter: string | null };
type CourseLike = { id: number; departmentId: number; name: string };

export type CatalogMatch<D, C> = { department: D; courses: C[] };

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

// `courses` traz só os cursos que casaram com o termo (vazio quando o departamento casou pelo próprio nome).
export function filterCatalog<D extends DepartmentLike, C extends CourseLike>(
  departments: D[],
  courses: C[],
  query: string,
): CatalogMatch<D, C>[] {
  const q = normalize(query);
  if (!q) return departments.map((department) => ({ department, courses: [] }));
  const has = (value: string | null) => value !== null && normalize(value).includes(q);
  return departments
    .map((department) => ({
      department,
      ownMatch: has(department.name) || has(department.shortName) || has(department.academicCenter),
      courses: courses.filter((c) => c.departmentId === department.id && has(c.name)),
    }))
    .filter((m) => m.ownMatch || m.courses.length > 0)
    .map(({ department, courses: matched }) => ({ department, courses: matched }));
}
