import { ApiError, apiGet, apiPatch, apiPost } from "../lib/api";

// Ponto único de acesso às mensagens para a equipe (UC39), via /api/messages. Enviar é público (sem login, sem conta);
// listar e marcar como lida são do painel e exigem login (marcar exige o perfil "geral" ou "editor").

// Mesmos limites do MessageRequestDTO do backend.
export const NOME_MAX_LENGTH = 100;
export const CONTATO_MAX_LENGTH = 150;
export const MENSAGEM_MAX_LENGTH = 1000;

// Mesma regra do backend: e-mail (algo@dominio.tld) ou telefone (8 a 15 dígitos, com + ( ) - . e espaços opcionais).
const CONTACT_PATTERN = /^(?:[^@\s]+@[^@\s]+\.[^@\s]+|\+?(?:[\s().-]*\d){8,15}[\s().-]*)$/;

// Nome e contato são opcionais; só a mensagem é obrigatória.
export type MessageInput = { nome: string; contato: string; mensagem: string };
export type MessageField = keyof MessageInput;
export type MessageFieldError = "required" | "tooLong" | "invalid";
export type MessageFieldErrors = Partial<Record<MessageField, MessageFieldError>>;

export class MessageValidationError extends Error {
  constructor(readonly errors: MessageFieldErrors) {
    super("Mensagem com campos inválidos.");
  }
}

// Devolve só os campos com problema; objeto vazio quando está tudo certo.
export function validateMessage(input: MessageInput): MessageFieldErrors {
  const errors: MessageFieldErrors = {};
  const nome = input.nome.trim();
  const contato = input.contato.trim();
  const mensagem = input.mensagem.trim();
  if (nome.length > NOME_MAX_LENGTH) errors.nome = "tooLong";
  if (contato.length > CONTATO_MAX_LENGTH) errors.contato = "tooLong";
  else if (contato && !CONTACT_PATTERN.test(contato)) errors.contato = "invalid";
  if (!mensagem) errors.mensagem = "required";
  else if (mensagem.length > MENSAGEM_MAX_LENGTH) errors.mensagem = "tooLong";
  return errors;
}

// Valida no cliente e, se o servidor recusar por campo, devolve o erro no campo certo. 429 (muitas mensagens em
// pouco tempo) sobe como ApiError para a tela avisar.
export async function sendMessage(input: MessageInput): Promise<void> {
  const errors = validateMessage(input);
  if (Object.keys(errors).length) throw new MessageValidationError(errors);
  try {
    await apiPost<void>("/messages", {
      nome: input.nome.trim(),
      contato: input.contato.trim(),
      mensagem: input.mensagem.trim(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && error.fields) {
      const fieldErrors: MessageFieldErrors = {};
      for (const [field, message] of Object.entries(error.fields)) {
        if (field === "nome") fieldErrors.nome = "tooLong";
        else if (field === "contato") fieldErrors.contato = /caracteres/.test(message) ? "tooLong" : "invalid";
        else if (field === "mensagem") fieldErrors.mensagem = /caracteres/.test(message) ? "tooLong" : "required";
      }
      if (Object.keys(fieldErrors).length) throw new MessageValidationError(fieldErrors);
    }
    throw error;
  }
}

// Visão do painel. Espelha MessageResponseDTO; datas em ISO (ex.: "2026-11-21T17:54:04.123Z").
export type Message = {
  id: number;
  nome: string | null;
  contato: string | null;
  mensagem: string;
  createdAt: string;
  read: boolean;
  readAt: string | null;
};

// Mais recentes primeiro (o servidor já ordena; a ordenação aqui garante a regra mesmo se mudar).
export async function listMessages(): Promise<Message[]> {
  const messages = await apiGet<Message[]>("/messages");
  return [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

export function setMessageRead(id: number, read: boolean): Promise<Message> {
  return apiPatch<Message>(`/messages/${id}`, { read });
}
