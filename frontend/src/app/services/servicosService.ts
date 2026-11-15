import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

// Ponto único de acesso aos serviços estudantis (UC19 a UC21, UC11). Os tipos espelham os DTOs de /api/services.
// Cadastrar exige login (a API recusa sem sessão); o autor e o histórico ficam por conta do servidor.

// Local publicado onde o serviço é prestado; o slug leva à página do local (/locais/<slug>).
export type ServicoPlace = { slug: string; name: string };

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
  // O vínculo com o local é feito no formulário de local (painel), não aqui: o serviço só o recebe do servidor.
  places: ServicoPlace[];
};

// Campos que o administrador preenche no formulário.
export type ServicoInput = Omit<Servico, "id" | "active" | "places">;

export type ServicoField = keyof ServicoInput;
export type ServicoFieldError = "required" | "tooLong" | "invalidUrl";

// Mesmo limite do ServiceRequestDTO do backend.
export const NAME_MAX_LENGTH = 100;

const REQUIRED: ServicoField[] = ["category", "name", "sector", "description"];
const FIELDS: ServicoField[] = ["category", "name", "sector", "description", "steps", "requirements", "url", "deadline"];

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

// Espelha ServiceResponseDTO: campos opcionais vazios chegam nulos.
type ServicoDto = {
  id: number;
  category: string;
  name: string;
  sector: string;
  description: string;
  steps: string[];
  requirements: string | null;
  url: string | null;
  deadline: string | null;
  active: boolean;
  places?: ServicoPlace[];
};

function fromDto(dto: ServicoDto): Servico {
  return {
    id: dto.id,
    category: dto.category,
    name: dto.name,
    sector: dto.sector,
    description: dto.description,
    steps: dto.steps,
    requirements: dto.requirements ?? undefined,
    url: dto.url ?? undefined,
    deadline: dto.deadline ?? undefined,
    active: dto.active,
    places: dto.places ?? [],
  };
}

// O painel lista todos os serviços, inclusive os despublicados (a lista pública, /api/services, mostra só os ativos).
export async function listServicos(): Promise<Servico[]> {
  return (await apiGet<ServicoDto[]>("/admin/services")).map(fromDto);
}

// UC11 — página pública /servicos: só os publicados, em ordem alfabética (o servidor filtra os despublicados).
export async function listServicosPublicos(): Promise<Servico[]> {
  return (await apiGet<ServicoDto[]>("/services")).map(fromDto);
}

// Busca sem diferença de maiúsculas nem acentos ("matricula" acha "Matrícula").
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

// Categorias são texto livre: a lista do filtro sai dos próprios serviços, sem repetir variações de caixa ou acento.
export function categoriesOf(servicos: Servico[]): string[] {
  const byKey = new Map<string, string>();
  for (const s of servicos) {
    const key = normalize(s.category);
    if (key && !byKey.has(key)) byKey.set(key, s.category.trim());
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// `category` vazio = todas. A busca olha nome, descrição, setor e categoria.
export function filterServicos(servicos: Servico[], query: string, category: string): Servico[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const categoryKey = normalize(category);
  return servicos.filter((s) => {
    if (categoryKey && normalize(s.category) !== categoryKey) return false;
    const haystack = normalize(`${s.name} ${s.description} ${s.sector} ${s.category}`);
    return terms.every((term) => haystack.includes(term));
  });
}

// O servidor valida de novo; os erros por campo voltam em `fields` (ex.: "steps", "url", "steps[0]").
function fieldErrorsOf(error: ApiError): Partial<Record<ServicoField, ServicoFieldError>> {
  const errors: Partial<Record<ServicoField, ServicoFieldError>> = {};
  for (const [key, message] of Object.entries(error.fields ?? {})) {
    const field = key.replace(/\[\d+\]$/, "") as ServicoField;
    if (!FIELDS.includes(field)) continue;
    errors[field] = field === "url" ? "invalidUrl" : /caracteres|no máximo/.test(message) ? "tooLong" : "required";
  }
  return errors;
}

// Campos limpos, sem passos em branco; opcionais vazios ficam de fora.
function payloadOf(input: ServicoInput) {
  const optional = (value?: string) => value?.trim() || undefined;
  return {
    category: input.category.trim(),
    name: input.name.trim(),
    sector: input.sector.trim(),
    description: input.description.trim(),
    steps: input.steps.map((s) => s.trim()).filter(Boolean),
    requirements: optional(input.requirements),
    url: optional(input.url),
    deadline: optional(input.deadline),
  };
}

// Valida no cliente e, se o servidor recusar por campo, devolve o erro no campo certo.
async function send(input: ServicoInput, request: () => Promise<ServicoDto>): Promise<Servico> {
  const errors = validateServico(input);
  if (Object.keys(errors).length) throw new ServicoValidationError(errors);
  try {
    return fromDto(await request());
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const fieldErrors = fieldErrorsOf(error);
      if (Object.keys(fieldErrors).length) throw new ServicoValidationError(fieldErrors);
    }
    throw error;
  }
}

// RN-19.02: o servidor publica o serviço novo.
export function createServico(input: ServicoInput): Promise<Servico> {
  return send(input, () => apiPost<ServicoDto>("/services", payloadOf(input)));
}

// UC20 — Editar Serviço. `active` publica ou despublica; o servidor registra antes e depois no histórico.
export function updateServico(id: number, input: ServicoInput, active: boolean): Promise<Servico> {
  return send(input, () => apiPut<ServicoDto>(`/services/${id}`, { ...payloadOf(input), active }));
}

// UC21 — Deletar Serviço. Já excluído em outra aba (404) é tratado como sucesso: o resultado desejado já existe.
export async function deleteServico(id: number): Promise<void> {
  try {
    await apiDelete(`/services/${id}`);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
}
