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
// Tokens encerrados pelo logout. Simula a invalidação feita pelo backend: um token revogado nunca volta a valer.
const REVOKED_KEY = "guiarural.revokedTokens";

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

export type LogoutResult = { offline: boolean };

// UC24 — Logout. A sessão local é sempre apagada; se a rede cair, o token é revogado localmente (pós-condição de falha).
export async function logout(): Promise<LogoutResult> {
  const session = getSession();
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  if (!offline) await delay(400);
  if (session) {
    const revoked = readJson<string[]>(REVOKED_KEY, []);
    writeJson(REVOKED_KEY, [...revoked.slice(-49), session.token]);
  }
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  notify();
  return { offline };
}

function isRevoked(token: string) {
  return readJson<string[]>(REVOKED_KEY, []).includes(token);
}

// Leitura compatível com useSyncExternalStore: devolve o mesmo objeto enquanto o conteúdo não muda.
let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

export function getSession(): Session | null {
  const found = readJson<Session | null>(SESSION_KEY, null, "session") ?? readJson<Session | null>(SESSION_KEY, null, "local");
  const stored = found && !isRevoked(found.token) ? found : null;
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
  // "storage": logout em outra aba. "pageshow": página restaurada pelo botão Voltar (RN-02 do UC24).
  window.addEventListener("storage", listener);
  window.addEventListener("pageshow", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("pageshow", listener);
  };
}
