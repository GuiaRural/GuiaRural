import { MOCK_AUDIT_LOGS, type AuditAction, type AuditEntity, type AuditLog } from "../data/mockAuditLogs";
import { apiGet } from "../lib/api";
import { delay } from "../lib/storage";

// Histórico somente de inclusão: não há função para apagar logs (RN-03 do UC23).
// Avisos, serviços, cardápio, locais, administradores e tópicos do guia são auditados no servidor (/api/admin/audit-logs); o que
// sobra em memória são os registros de exemplo de MOCK_AUDIT_LOGS (removidos junto com o desfazer da Fase 3).
let logs: AuditLog[] = [...MOCK_AUDIT_LOGS];
let nextId = 1;

export function recordChange(entry: Omit<AuditLog, "id" | "at">): AuditLog {
  const log: AuditLog = { ...entry, id: `log-${Date.now()}-${nextId++}`, at: new Date().toISOString() };
  logs = [log, ...logs];
  return log;
}

// Espelha AuditLogResponseDTO.
type ServerLog = {
  id: number;
  at: string;
  author: string;
  entity: string;
  entityId: string;
  entityName: string;
  action: AuditAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

const ENTITY_LABELS: Record<string, AuditEntity> = {
  local: "Local",
  servico: "Serviço",
  cardapio: "Cardápio",
  aviso: "Aviso",
  acolhimento: "Acolhimento",
  administrador: "Administrador",
};

// O id de um log do servidor leva este prefixo, para não se confundir com os locais.
const SERVER_PREFIX = "srv-";

export const isServerLog = (log: AuditLog) => log.id.startsWith(SERVER_PREFIX);
export const serverLogId = (log: AuditLog) => log.id.slice(SERVER_PREFIX.length);

function fromServer(log: ServerLog): AuditLog {
  return {
    id: `${SERVER_PREFIX}${log.id}`,
    at: log.at,
    author: log.author,
    entity: ENTITY_LABELS[log.entity] ?? "Local",
    entityId: log.entityId,
    entityName: log.entityName,
    action: log.action,
    before: log.before,
    after: log.after,
  };
}

export async function listLogs(): Promise<AuditLog[]> {
  await delay();
  let remote: AuditLog[] = [];
  try {
    remote = (await apiGet<ServerLog[]>("/admin/audit-logs?limit=300")).map(fromServer);
  } catch {
    // Servidor fora do ar ou sem sessão (um 401 já leva ao login): mostra só o que está em memória.
  }
  return [...remote, ...logs].sort((a, b) => b.at.localeCompare(a.at));
}

export function snapshot<T extends object>(value: T | null | undefined): Record<string, unknown> | null {
  if (!value) return null;
  const copy = { ...value } as Record<string, unknown>;
  // Fotos em base64 incham o histórico; o snapshot guarda só a indicação de que havia imagem.
  if ("photoDataUrl" in copy && copy.photoDataUrl) copy.photoDataUrl = "[imagem]";
  return copy;
}
