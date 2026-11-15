import { ApiError, apiDelete, apiGet, apiPost, apiPut, isNotFound } from "../lib/api";

// Ponto único de acesso ao cardápio do RU (UC25 a UC27). Os tipos espelham os DTOs de /api/menus.
// Ler é público; criar, editar e excluir exigem login, e o histórico (UC23) é gravado pelo servidor.

export type Shift = "almoco" | "jantar";

export type Menu = {
  id: number;
  date: string; // AAAA-MM-DD
  shift: Shift;
  main: string;
  vegetarian: string;
  // Opcionais: string vazia quando não informados.
  sides: string;
  salad: string;
  dessert: string;
  drink: string;
};

export type MenuInput = Omit<Menu, "id">;

export const SHIFT_LABELS: Record<Shift, string> = { almoco: "Almoço", jantar: "Jantar" };

// RN-01: obrigatórios do formulário (o servidor confere de novo).
const REQUIRED: (keyof MenuInput)[] = ["date", "shift", "main", "vegetarian"];
const FIELDS: (keyof MenuInput)[] = ["date", "shift", "main", "vegetarian", "sides", "salad", "dessert", "drink"];

export class MenuValidationError extends Error {
  constructor(
    message: string,
    readonly fields: (keyof MenuInput)[],
  ) {
    super(message);
  }
}

// Espelha MenuResponseDTO: opcionais vazios chegam nulos.
type MenuDto = {
  id: number;
  date: string;
  shift: Shift;
  main: string;
  vegetarian: string | null;
  sides: string | null;
  salad: string | null;
  dessert: string | null;
  drink: string | null;
};

function fromDto(dto: MenuDto): Menu {
  return {
    id: dto.id,
    date: dto.date,
    shift: dto.shift,
    main: dto.main,
    vegetarian: dto.vegetarian ?? "",
    sides: dto.sides ?? "",
    salad: dto.salad ?? "",
    dessert: dto.dessert ?? "",
    drink: dto.drink ?? "",
  };
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Painel: todos os cardápios, do mais antigo ao mais recente (o servidor ordena por data e turno).
export async function listMenus(): Promise<Menu[]> {
  return (await apiGet<MenuDto[]>("/menus")).map(fromDto);
}

// Segunda a domingo da semana de `reference`, para a página pública "Cardápio da semana".
export async function getWeekMenus(reference = new Date()): Promise<Menu[]> {
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - ((reference.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return (await apiGet<MenuDto[]>(`/menus?from=${isoDate(monday)}&to=${isoDate(sunday)}`)).map(fromDto);
}

// Cardápio inexistente (ou id que não é número) volta nulo, para a tela dizer "não encontrado".
export async function getMenuById(id: number | string): Promise<Menu | null> {
  try {
    return fromDto(await apiGet<MenuDto>(`/menus/${encodeURIComponent(String(id))}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

// Campos limpos; opcionais vazios ficam de fora (o servidor grava nulo).
function payloadOf(input: MenuInput) {
  const optional = (value: string) => value.trim() || undefined;
  return {
    date: input.date,
    shift: input.shift,
    main: input.main.trim(),
    vegetarian: input.vegetarian.trim(),
    sides: optional(input.sides),
    salad: optional(input.salad),
    dessert: optional(input.dessert),
    drink: optional(input.drink),
  };
}

function validate(input: MenuInput) {
  const missing = REQUIRED.filter((f) => !String(input[f] ?? "").trim());
  if (missing.length) throw new MenuValidationError("Preencha todos os campos obrigatórios para continuar.", missing);
}

// 400 com erros por campo e 409 (RN-03: dia e turno já cadastrados) viram erro no formulário; o resto sobe para a tela.
async function send(input: MenuInput, request: () => Promise<MenuDto>): Promise<Menu> {
  validate(input);
  try {
    return fromDto(await request());
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new MenuValidationError(error.detail ?? "Já existe um cardápio cadastrado para este dia e turno.", ["date", "shift"]);
    }
    if (error instanceof ApiError && error.status === 400) {
      const fields = Object.keys(error.fields ?? {}).filter((f): f is keyof MenuInput => FIELDS.includes(f as keyof MenuInput));
      if (fields.length) throw new MenuValidationError("Revise os campos destacados.", fields);
    }
    throw error;
  }
}

// UC25 — Criar cardápio.
export function createMenu(input: MenuInput): Promise<Menu> {
  return send(input, () => apiPost<MenuDto>("/menus", payloadOf(input)));
}

// UC26 — Editar cardápio.
export function updateMenu(id: number, input: MenuInput): Promise<Menu> {
  return send(input, () => apiPut<MenuDto>(`/menus/${id}`, payloadOf(input)));
}

// UC27 — Deletar cardápio. Já excluído em outra aba (404) conta como sucesso: o resultado desejado já existe.
export async function deleteMenu(id: number): Promise<void> {
  try {
    await apiDelete(`/menus/${id}`);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
}

export function formatMenuDate(iso: string, locale = "pt-BR", options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, options);
}
