import type { Permission } from "./adminsService";
import { ApiError, SESSION_EXPIRED_EVENT, apiGet, apiPost } from "../lib/api";
import { setFlash } from "../lib/flash";
import { readJson, removeKey, writeJson } from "../lib/storage";

// Quem está logado, como o painel mostra. A sessão de verdade fica no servidor, num cookie HttpOnly que o
// JavaScript não enxerga; isto é só uma cópia dos dados de exibição (nome, perfil) para o painel abrir sem esperar.
// Nada aqui dá acesso: sem o cookie, toda chamada de escrita ou de dados internos responde 401.
export type Session = {
  adminId: number;
  name: string;
  email: string;
  sector: string;
  permission: Permission;
};

const SESSION_KEY = "guiarural.adminSession";

// Espelha SessionDTO (/api/auth/login e /api/auth/me).
type SessionDto = Session;

export type LoginResult =
  | { ok: true; session: Session }
  // unavailable: o servidor não respondeu (rede, erro 5xx); o usuário não errou nada.
  | { ok: false; reason: "domain" | "invalid" | "blocked" | "rate_limited" | "unavailable" };

const REASONS = ["domain", "invalid", "blocked", "rate_limited"] as const;

export async function login(email: string, password: string, remember: boolean): Promise<LoginResult> {
  try {
    const session = await apiPost<SessionDto>("/auth/login", { email: email.trim(), password, remember });
    // "Manter conectado" guarda a cópia entre reinícios do navegador; caso contrário, só na aba.
    removeKey(SESSION_KEY, "local");
    removeKey(SESSION_KEY, "session");
    writeJson(SESSION_KEY, session, remember ? "local" : "session");
    notify();
    return { ok: true, session };
  } catch (error) {
    if (error instanceof ApiError) {
      const reason = REASONS.find((r) => r === error.reason);
      if (reason) return { ok: false, reason };
      // 400 sem motivo conhecido: o servidor rejeitou o formato do e-mail ou da senha.
      if (error.status === 400) return { ok: false, reason: "invalid" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

export type LogoutResult = { offline: boolean };

// UC24 — Logout. A cópia local é sempre apagada; se o servidor não confirmar o encerramento, a tela avisa
// (pós-condição de falha), porque a sessão dele ainda pode existir até expirar.
export async function logout(): Promise<LogoutResult> {
  let confirmed = typeof navigator === "undefined" || navigator.onLine;
  if (confirmed) {
    try {
      await apiPost<void>("/auth/logout", {});
    } catch (error) {
      // 401 = já estava deslogado no servidor: nada a confirmar.
      confirmed = error instanceof ApiError && error.status === 401;
    }
  }
  clearLocalSession();
  return { offline: !confirmed };
}

// Pergunta ao servidor se a sessão ainda vale (o cookie pode ter expirado, ou o servidor reiniciado).
// Falha de rede não desloga ninguém: só um 401 do servidor encerra a sessão local.
export async function verifySession(): Promise<void> {
  try {
    const fresh = await apiGet<SessionDto>("/auth/me");
    // Atualiza nome e perfil caso tenham mudado desde o login.
    const area = readJson<Session | null>(SESSION_KEY, null, "session") ? "session" : "local";
    writeJson(SESSION_KEY, fresh, area);
    notify();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) expireSession();
  }
}

function clearLocalSession() {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  notify();
}

function expireSession() {
  if (!getSession()) return;
  clearLocalSession();
  setFlash("Sua sessão expirou. Faça login novamente para continuar.");
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
  // "storage": logout em outra aba. "pageshow": página restaurada pelo botão Voltar (RN-02 do UC24).
  window.addEventListener("storage", listener);
  window.addEventListener("pageshow", listener);
  // Qualquer chamada à API que volte 401 encerra a sessão local e leva ao login.
  window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("pageshow", listener);
    window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  };
}
