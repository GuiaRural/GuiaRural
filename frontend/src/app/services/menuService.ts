import { MOCK_MENUS, type Menu } from "../data/mockMenus";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

const STORAGE_KEY = "ru_menus";

// Carrega os dados persistidos no localStorage ou usa o MOCK_MENUS inicial
function loadMenusFromStorage(): Menu[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Em caso de erro de parse, mantém o fallback original
      }
    }
  }
  return [...MOCK_MENUS];
}

// Salva a lista no localStorage e atualiza a variável local
function saveMenusToStorage(list: Menu[]) {
  menus = list;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

let menus: Menu[] = loadMenusFromStorage();

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
  menus = loadMenusFromStorage();
  return sortMenus(menus);
}

// Segunda a domingo da semana corrente, para a página pública "Cardápio da semana".
export async function getWeekMenus(reference = new Date()): Promise<Menu[]> {
  await delay(150);
  menus = loadMenusFromStorage();
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - ((reference.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  return sortMenus(menus.filter((m) => days.includes(m.date)));
}

// Procura um cardápio pelo ID
export async function getMenuById(id: string): Promise<Menu | null> {
  const currentMenus = await listMenus();
  return currentMenus.find((m) => m.id === id) || null;
}

export async function createMenu(input: Omit<Menu, "id">, author: string): Promise<Menu> {
  await delay(400);
  menus = loadMenusFromStorage();
  
  // RN-01: campos obrigatórios.
  const missing = REQUIRED.filter((f) => !String(input[f] ?? "").trim());
  if (missing.length) {
    throw new MenuValidationError("Preencha todos os campos obrigatórios para continuar.", missing);
  }

  // RN-03: um cardápio por dia e turno.
  if (menus.some((m) => m.date === input.date && m.shift === input.shift)) {
    throw new MenuValidationError("Já existe um cardápio cadastrado para este dia e turno.", ["date", "shift"]);
  }

  // RN-02: gravação completa do registro.
  const menu: Menu = { ...input, id: `m${Date.now()}` };
  const updatedList = [...menus, menu];
  saveMenusToStorage(updatedList);

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

// UC26 — Atualizar cardápio existente
export async function updateMenu(
  id: string,
  fields: Omit<Menu, "id">,
  author: string
): Promise<Menu> {
  await delay(300);
  menus = loadMenusFromStorage();

  // CT-026.02: Validação dos campos obrigatórios
  const missing: (keyof Omit<Menu, "id">)[] = [];
  if (!fields.date) missing.push("date");
  if (!fields.shift) missing.push("shift");
  if (!fields.main?.trim()) missing.push("main");
  if (!fields.vegetarian?.trim()) missing.push("vegetarian");

  if (missing.length > 0) {
    throw new MenuValidationError(
      "Preencha todos os campos obrigatórios para continuar.",
      missing
    );
  }

  // Verificar se a alteração de data/turno não conflita com OUTRO cardápio existente
  const conflict = menus.find((m) => m.id !== id && m.date === fields.date && m.shift === fields.shift);
  if (conflict) {
    throw new MenuValidationError("Já existe outro cardápio cadastrado para este dia e turno.", ["date", "shift"]);
  }

  const index = menus.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error("Cardápio não encontrado.");
  }

  const beforeMenu = menus[index];
  const updatedMenu: Menu = { id, ...fields };

  const updatedList = [...menus];
  updatedList[index] = updatedMenu;
  saveMenusToStorage(updatedList);

  // Registo do Log de Mudança (UC23 / CT-026.01)
  recordChange({
    author,
    entity: "Cardápio",
    entityId: updatedMenu.id,
    entityName: `Cardápio — ${SHIFT_LABELS[updatedMenu.shift].toLowerCase()} de ${formatMenuDate(updatedMenu.date)}`,
    action: "editado",
    before: snapshot(beforeMenu),
    after: snapshot(updatedMenu),
  });

  return updatedMenu;
}

export function restoreMenu(id: string, previous: Record<string, unknown> | null) {
  menus = loadMenusFromStorage();
  const current = menus.find((m) => m.id === id);
  if (!previous) {
    const filtered = menus.filter((m) => m.id !== id);
    saveMenusToStorage(filtered);
    return;
  }
  const restored = { ...(current ?? {}), ...previous } as Menu;
  const updatedList = current ? menus.map((m) => (m.id === id ? restored : m)) : [...menus, restored];
  saveMenusToStorage(updatedList);
}

export function formatMenuDate(iso: string, locale = "pt-BR", options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, options);
}