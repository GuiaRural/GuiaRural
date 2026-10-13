export type Place = {
  id: string;
  name: string;
  category: "administrativo" | "departamento" | "alimentacao" | "biblioteca" | "saude";
};

// Dados fictícios até a integração com a API (Spring Boot). Não representam o catálogo oficial.
export const MOCK_PLACES: Place[] = [
  { id: "reitoria", name: "Prédio Central (Reitoria)", category: "administrativo" },
  { id: "ceagri-1", name: "CEAGRI I", category: "departamento" },
  { id: "biblioteca", name: "Biblioteca Central", category: "biblioteca" },
  { id: "dc", name: "Departamento de Computação", category: "departamento" },
  { id: "agronomia", name: "Departamento de Agronomia", category: "departamento" },
  { id: "medvet", name: "Departamento de Medicina Veterinária", category: "departamento" },
  { id: "ru", name: "Restaurante Universitário", category: "alimentacao" },
  { id: "hovet", name: "Hospital Veterinário", category: "saude" },
];

export const MOCK_RECENT_IDS = ["reitoria", "ceagri-1", "biblioteca", "dc"];
