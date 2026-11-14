import { ApiError, apiPost } from "../lib/api";

// UC39 — Mandar mensagem para o administrador (página pública /contato, sem login).
// Usa POST /api/messages como ele é hoje: e-mail obrigatório e telefone opcional, em campos separados
// (o protótipo tem um campo único "Telefone/E-mail", mas a API exige e-mail).

export type ContactMessage = {
  name: string;
  email: string;
  // Opcional; se preenchido, precisa ter DDD (RN-UC39-04).
  phone: string;
  message: string;
};

export type ContactField = keyof ContactMessage;
export type ContactFieldError = "required" | "tooLong" | "invalidEmail" | "invalidPhone";
export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

// RN-UC39-03; mesmo limite do MessageRequestDTO do backend.
export const MESSAGE_MAX_LENGTH = 500;
// Tamanho das colunas nome e email no banco (a API não limita antes de gravar).
export const TEXT_MAX_LENGTH = 255;

export class ContactValidationError extends Error {
  constructor(readonly errors: ContactErrors) {
    super("Mensagem com campos inválidos.");
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Telefone brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular, começando com 9 depois do DDD).
// Aceita a pontuação comum, como "(81) 99999-9999" ou "+55 81 3333-4444".
export function isValidPhone(phone: string): boolean {
  const text = phone.trim();
  if (!/^[\d\s()+-]+$/.test(text)) return false;
  let digits = text.replace(/\D/g, "");
  if (text.startsWith("+")) {
    if (!digits.startsWith("55")) return false;
    digits = digits.slice(2);
  }
  // DDDs brasileiros não têm o dígito 0 (vão de 11 a 99).
  if (!/^[1-9]{2}/.test(digits)) return false;
  if (digits.length === 11) return digits[2] === "9";
  return digits.length === 10;
}

// FE-39.01 e RN-UC39-04: devolve só os campos com problema; objeto vazio quando está tudo certo.
export function validateMessage(input: ContactMessage): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const message = input.message.trim();

  if (!name) errors.name = "required";
  else if (name.length > TEXT_MAX_LENGTH) errors.name = "tooLong";

  if (!email) errors.email = "required";
  else if (email.length > TEXT_MAX_LENGTH) errors.email = "tooLong";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "invalidEmail";

  if (phone && !isValidPhone(phone)) errors.phone = "invalidPhone";

  if (!message) errors.message = "required";
  else if (message.length > MESSAGE_MAX_LENGTH) errors.message = "tooLong";

  return errors;
}

// A API usa os nomes em português.
const API_FIELDS: Record<string, ContactField> = { nome: "name", email: "email", telefone: "phone", mensagem: "message" };

// O servidor valida de novo; os erros por campo voltam em `fields` (ex.: { email: "Formato de e-mail inválido" }).
function fieldErrorsOf(error: ApiError): ContactErrors {
  const errors: ContactErrors = {};
  for (const [key, text] of Object.entries(error.fields ?? {})) {
    const field = API_FIELDS[key];
    if (!field) continue;
    if (field === "email" && /formato/i.test(text)) errors.email = "invalidEmail";
    else errors[field] = /no máximo/.test(text) ? "tooLong" : "required";
  }
  return errors;
}

// Valida no navegador e envia. Campo recusado pelo servidor volta como ContactValidationError;
// falha de rede ou do servidor sobe como está, para a tela oferecer nova tentativa.
export async function sendMessage(input: ContactMessage): Promise<void> {
  const errors = validateMessage(input);
  if (Object.keys(errors).length) throw new ContactValidationError(errors);
  try {
    await apiPost<unknown>("/messages", {
      nome: input.name.trim(),
      email: input.email.trim(),
      telefone: input.phone.trim() || undefined,
      mensagem: input.message.trim(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const fieldErrors = fieldErrorsOf(error);
      if (Object.keys(fieldErrors).length) throw new ContactValidationError(fieldErrors);
    }
    throw error;
  }
}
