import { MOCK_AUDIT_LOGS, type AuditLog } from "../data/mockAuditLogs";
import { delay } from "../lib/storage";

// Histórico somente de inclusão: não há função para apagar logs (RN-03 do UC23).
let logs: AuditLog[] = [...MOCK_AUDIT_LOGS];
let nextId = 1;

export function recordChange(entry: Omit<AuditLog, "id" | "at">): AuditLog {
  const log: AuditLog = { ...entry, id: `log-${Date.now()}-${nextId++}`, at: new Date().toISOString() };
  logs = [log, ...logs];
  return log;
}

export async function listLogs(): Promise<AuditLog[]> {
  await delay();
  return [...logs].sort((a, b) => b.at.localeCompare(a.at));
}

export function snapshot<T extends object>(value: T | null | undefined): Record<string, unknown> | null {
  if (!value) return null;
  const copy = { ...value } as Record<string, unknown>;
  // Fotos em base64 incham o histórico; o snapshot guarda só a indicação de que havia imagem.
  if ("photoDataUrl" in copy && copy.photoDataUrl) copy.photoDataUrl = "[imagem]";
  return copy;
}
