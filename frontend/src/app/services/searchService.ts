import { apiGet } from "../lib/api";

// Backend: GET /api/search (locais, departamentos e cursos, já ordenados e limitados pelo servidor).
export type Suggestion = {
  type: "PLACE" | "DEPARTMENT" | "COURSE";
  id: number;
  slug: string | null;
  name: string;
  // curso: nome do departamento; local: categoria; departamento: null.
  detail: string | null;
};

// RN-UC38-01: a lista suspensa mostra só os resultados mais relevantes (mesmo limite do backend).
export const MAX_SUGGESTIONS = 8;

// Os locais já vêm de placesService (a mesma lista /api/places que o mapa usa, filtrada no navegador);
// por isso daqui só entram departamentos e cursos, e o resultado do tipo PLACE é descartado.
export async function searchDepartmentsAndCourses(query: string): Promise<Suggestion[]> {
  const found = await apiGet<Suggestion[]>(`/search?q=${encodeURIComponent(query.trim())}`);
  return found.filter((s) => s.type !== "PLACE");
}

export function suggestionHref(s: Suggestion) {
  return s.type === "COURSE" ? `/cursos/${s.id}` : `/departamentos/${s.id}`;
}
