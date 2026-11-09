import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

// Ponto único de acesso aos avisos do campus (/api/avisos). Os tipos espelham os DTOs do backend.
// O backend ainda não tem login: criar, editar e excluir estão abertos até a autenticação do painel existir.

export type Aviso = {
  id: number;
  nome: string;
  descricao: string;
  // Data de publicação, definida pelo backend (ex.: "2026-09-24T10:00:00").
  data: string;
};

// Campos que o administrador preenche ao criar ou editar um aviso.
export type AvisoInput = Pick<Aviso, "nome" | "descricao">;

// Mais recentes primeiro (o backend não garante ordem).
export async function listAvisos(): Promise<Aviso[]> {
  const avisos = await apiGet<Aviso[]>("/avisos");
  return [...avisos].sort((a, b) => b.data.localeCompare(a.data));
}

export function createAviso(input: AvisoInput): Promise<Aviso> {
  return apiPost<Aviso>("/avisos", input);
}

export function updateAviso(id: number, input: AvisoInput): Promise<Aviso> {
  return apiPut<Aviso>(`/avisos/${id}`, input);
}

// Aviso inexistente falha com 404 (FE-18.01).
export function deleteAviso(id: number): Promise<void> {
  return apiDelete(`/avisos/${id}`);
}
