import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

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

// Mesmos limites do AvisoRequestDTO do backend.
export const NOME_MAX_LENGTH = 255;
export const DESCRICAO_MAX_LENGTH = 2000;

export type AvisoField = keyof AvisoInput;
export type AvisoFieldError = "required" | "tooLong";

export class AvisoValidationError extends Error {
  constructor(readonly errors: Partial<Record<AvisoField, AvisoFieldError>>) {
    super("Aviso com campos inválidos.");
  }
}

// Devolve só os campos com problema; objeto vazio quando está tudo certo.
export function validateAviso(input: AvisoInput): Partial<Record<AvisoField, AvisoFieldError>> {
  const errors: Partial<Record<AvisoField, AvisoFieldError>> = {};
  if (!input.nome.trim()) errors.nome = "required";
  else if (input.nome.trim().length > NOME_MAX_LENGTH) errors.nome = "tooLong";
  if (!input.descricao.trim()) errors.descricao = "required";
  else if (input.descricao.trim().length > DESCRICAO_MAX_LENGTH) errors.descricao = "tooLong";
  return errors;
}

// O aviso nasce publicado, com a data definida pelo servidor.
export async function createAviso(input: AvisoInput): Promise<Aviso> {
  const errors = validateAviso(input);
  if (Object.keys(errors).length) throw new AvisoValidationError(errors);
  try {
    return await apiPost<Aviso>("/avisos", { nome: input.nome.trim(), descricao: input.descricao.trim() });
  } catch (error) {
    // O servidor valida de novo; os erros por campo voltam em `fields`.
    if (error instanceof ApiError && error.status === 400 && error.fields) {
      const fieldErrors: Partial<Record<AvisoField, AvisoFieldError>> = {};
      for (const [field, message] of Object.entries(error.fields)) {
        if (field === "nome" || field === "descricao") fieldErrors[field] = /caracteres/.test(message) ? "tooLong" : "required";
      }
      if (Object.keys(fieldErrors).length) throw new AvisoValidationError(fieldErrors);
    }
    throw error;
  }
}

export function updateAviso(id: number, input: AvisoInput): Promise<Aviso> {
  return apiPut<Aviso>(`/avisos/${id}`, input);
}

// Aviso inexistente falha com 404 (FE-18.01).
export function deleteAviso(id: number): Promise<void> {
  return apiDelete(`/avisos/${id}`);
}
