import type { Permission, Sector } from "../data/mockAdmins";
import { delay, readJson, removeKey, writeJson } from "../lib/storage";
import { checkPassword, findAdminByEmail, isInstitutionalEmail } from "./adminsService";

export type Session = {
  adminId: string;
  name: string;
  email: string;
  sector: Sector;
  permission: Permission;
  token: string;
};

const SESSION_KEY = "guiarural.adminSession";

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; reason: "domain" | "invalid" | "blocked" };

export async function login(email: string, password: string, remember: boolean): Promise<LoginResult> {
  await delay(500);
  // RN-UC12-01
  if (!isInstitutionalEmail(email)) return { ok: false, reason: "domain" };
  const admin = findAdminByEmail(email);
  if (!admin || !checkPassword(email, password)) return { ok: false, reason: "invalid" };
  // RN-UC12-02: só contas "Ativo" entram.
  if (admin.status !== "ativo") return { ok: false, reason: "blocked" };

  const session: Session = {
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    sector: admin.sector,
    permission: admin.permission,
    token: crypto.randomUUID(),
  };
  // "Manter conectado" guarda a sessão entre reinícios do navegador; caso contrário, só na aba.
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  writeJson(SESSION_KEY, session, remember ? "local" : "session");
  notify();
  return { ok: true, session };
}

export function logout() {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  notify();
}

// Leitura compatível com useSyncExternalStore: devolve o mesmo objeto enquanto o conteúdo não muda.
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function getSession(): Session | null {
  const stored = readJson<Session | null>(SESSION_KEY, null, "session") ?? readJson<Session | null>(SESSION_KEY, null, "local");
  const raw = stored ? JSON.stringify(stored) : null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = stored;
  }
  return cachedSession;
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
