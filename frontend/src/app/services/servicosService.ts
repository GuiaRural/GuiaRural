import { MOCK_SERVICOS } from "../data/mockServicos";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

// Ponto único de acesso aos serviços estudantis (UC19 a UC21, UC11).
// O backend (/api/services) ainda só guarda nome, descrição, referência do local e ativo; os demais
// campos do formulário não têm onde ser salvos. Por isso os dados vêm do mock, em memória (voltam ao
// original ao recarregar a página). Com o backend ampliado, troque cada função pela chamada indicada.

export type Servico = {
  id: number;
  // Texto livre por decisão do time, até existir uma lista oficial de categorias.
  category: string;
  name: string;
  sector: string;
  description: string;
  // "Como solicitar": passo a passo, na ordem em que o estudante deve seguir.
  steps: string[];
  requirements?: string;
  url?: string;
  // Só para serviços disponíveis por um período (ex.: "Inscrições até 28/02").
  deadline?: string;
  // RN-19.02: todo serviço novo nasce publicado.
  active: boolean;
};

// Campos que o administrador preenche no formulário.
export type ServicoInput = Omit<Servico, "id" | "active">;

export type ServicoField = keyof ServicoInput;
export type ServicoFieldError = "required" | "tooLong" | "invalidUrl";

// Mesmo limite do ServiceRequestDTO do backend.
export const NAME_MAX_LENGTH = 100;

const REQUIRED: ServicoField[] = ["category", "name", "sector", "description"];

export class ServicoValidationError extends Error {
  constructor(readonly errors: Partial<Record<ServicoField, ServicoFieldError>>) {
    super("Serviço com campos inválidos.");
  }
}

// RN-19.01: devolve só os campos com problema; objeto vazio quando está tudo certo.
export function validateServico(input: ServicoInput): Partial<Record<ServicoField, ServicoFieldError>> {
  const errors: Partial<Record<ServicoField, ServicoFieldError>> = {};
  for (const field of REQUIRED) {
    if (!String(input[field]).trim()) errors[field] = "required";
  }
  if (!errors.name && input.name.trim().length > NAME_MAX_LENGTH) errors.name = "tooLong";
  if (!input.steps.some((s) => s.trim())) errors.steps = "required";
  // Links externos só por HTTPS (RNF02).
  const url = input.url?.trim();
  if (url && !/^https:\/\/\S+\.\S+$/.test(url)) errors.url = "invalidUrl";
  return errors;
}

let servicos: Servico[] = [...MOCK_SERVICOS];
let nextId = MOCK_SERVICOS.length + 1;

// API: apiGet<Servico[]>("/services")
export async function listServicos(): Promise<Servico[]> {
  await delay();
  return [...servicos];
}

// API: apiPost<Servico>("/services", input)
export async function createServico(input: ServicoInput, author: string): Promise<Servico> {
  await delay(400);
  const errors = validateServico(input);
  if (Object.keys(errors).length) throw new ServicoValidationError(errors);

  const optional = (value?: string) => value?.trim() || undefined;
  const servico: Servico = {
    id: nextId++,
    category: input.category.trim(),
    name: input.name.trim(),
    sector: input.sector.trim(),
    description: input.description.trim(),
    steps: input.steps.map((s) => s.trim()).filter(Boolean),
    requirements: optional(input.requirements),
    url: optional(input.url),
    deadline: optional(input.deadline),
    active: true,
  };
  servicos = [...servicos, servico];
  recordChange({
    author,
    entity: "Serviço",
    entityId: String(servico.id),
    entityName: servico.name,
    action: "criado",
    before: null,
    after: snapshot(servico),
  });
  return servico;
}
