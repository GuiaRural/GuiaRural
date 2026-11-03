import { MOCK_AVISOS } from "../data/mockAvisos";
import { ApiError } from "../lib/api";
import { delay } from "../lib/storage";

// Ponto único de acesso aos avisos do campus. Os tipos espelham os DTOs do backend (/api/avisos).
// Por enquanto os dados vêm do mock, em memória (voltam ao original ao recarregar a página).
// Com o backend pronto, troque cada função pela chamada indicada no comentário e apague o mock.

export type Aviso = {
  id: number;
  nome: string;
  descricao: string;
  // Data de publicação, definida pelo backend (ex.: "2026-09-24T10:00:00").
  data: string;
};

// Campos que o administrador preenche ao criar ou editar um aviso.
export type AvisoInput = Pick<Aviso, "nome" | "descricao">;

let avisos: Aviso[] = [...MOCK_AVISOS];
let nextId = MOCK_AVISOS.length + 1;

// API: apiGet<Aviso[]>("/avisos"). Mais recentes primeiro.
export async function listAvisos(): Promise<Aviso[]> {
  await delay();
  return [...avisos].sort((a, b) => b.data.localeCompare(a.data));
}

// API: apiPost<Aviso>("/avisos", input)
export async function createAviso(input: AvisoInput): Promise<Aviso> {
  await delay();
  const aviso: Aviso = { ...input, id: nextId++, data: new Date().toISOString().slice(0, 19) };
  avisos = [...avisos, aviso];
  return aviso;
}

// API: apiPut<Aviso>(`/avisos/${id}`, input)
export async function updateAviso(id: number, input: AvisoInput): Promise<Aviso> {
  await delay();
  const current = avisos.find((a) => a.id === id);
  if (!current) throw new ApiError(404);
  const updated = { ...current, ...input };
  avisos = avisos.map((a) => (a.id === id ? updated : a));
  return updated;
}

// API: apiDelete(`/avisos/${id}`). Aviso inexistente falha como no backend (FE-18.01).
export async function deleteAviso(id: number): Promise<void> {
  await delay();
  if (!avisos.some((a) => a.id === id)) throw new ApiError(404);
  avisos = avisos.filter((a) => a.id !== id);
}
