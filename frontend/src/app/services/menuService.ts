import { MOCK_MENUS, type Menu } from "../data/mockMenus";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

let menus: Menu[] = [...MOCK_MENUS];

export const SHIFT_LABELS: Record<Menu["shift"], string> = { almoco: "Almoço", jantar: "Jantar" };

const REQUIRED: (keyof Omit<Menu, "id">)[] = ["date", "shift", "main", "vegetarian"];

export class MenuValidationError extends Error {
  constructor(
    message: string,
    readonly fields: (keyof Menu)[],
  ) {
    super(message);
  }
}

function sortMenus(list: Menu[]) {
  return [...list].sort((a, b) => a.date.localeCompare(b.date) || a.shift.localeCompare(b.shift));
}

export async function listMenus(): Promise<Menu[]> {
  await delay();
  return sortMenus(menus);
}

// Segunda a domingo da semana corrente, para a página pública "Cardápio da semana".
export async function getWeekMenus(reference = new Date()): Promise<Menu[]> {
  await delay(150);
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - ((reference.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  return sortMenus(menus.filter((m) => days.includes(m.date)));
}

export async function createMenu(input: Omit<Menu, "id">, author: string): Promise<Menu> {
  await delay(400);
  // RN-01: campos obrigatórios.
  const missing = REQUIRED.filter((f) => !String(input[f] ?? "").trim());
  if (missing.length) {
    throw new MenuValidationError("Preencha todos os campos obrigatórios para continuar.", missing);
  }
  // RN-03: um cardápio por dia e turno.
  if (menus.some((m) => m.date === input.date && m.shift === input.shift)) {
    throw new MenuValidationError("Já existe um cardápio cadastrado para este dia e turno.", ["date", "shift"]);
  }
  // RN-02: no backend, a gravação é uma única transação; aqui o registro entra inteiro ou não entra.
  const menu: Menu = { ...input, id: `m${Date.now()}` };
  menus = [...menus, menu];
  recordChange({
    author,
    entity: "Cardápio",
    entityId: menu.id,
    entityName: `Cardápio — ${SHIFT_LABELS[menu.shift].toLowerCase()} de ${formatMenuDate(menu.date)}`,
    action: "criado",
    before: null,
    after: snapshot(menu),
  });
  return menu;
}

export function restoreMenu(id: string, previous: Record<string, unknown> | null) {
  const current = menus.find((m) => m.id === id);
  if (!previous) {
    menus = menus.filter((m) => m.id !== id);
    return;
  }
  const restored = { ...(current ?? {}), ...previous } as Menu;
  menus = current ? menus.map((m) => (m.id === id ? restored : m)) : [...menus, restored];
}

export function formatMenuDate(iso: string, locale = "pt-BR", options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, options);
}
