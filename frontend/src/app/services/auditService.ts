import { apiGet } from "../lib/api";

// Histórico de mudanças do painel (UC23), lido de /api/admin/audit-logs. Somente de inclusão: não há função para
// apagar logs (RN-03 do UC23). Todo o painel grava o histórico no servidor, na mesma transação da mudança.

// Identificador interno do tipo de registro (filtros, regras de desfazer). O texto exibido vem do dicionário
// (t.audit.entities), pela chave do servidor: ENTITY_KEYS.
export type AuditEntity = "Local" | "Serviço" | "Cardápio" | "Aviso" | "Acolhimento" | "Administrador" | "Curso";
// Valor de audit_logs.entity no servidor.
export type AuditEntityKey = "local" | "servico" | "cardapio" | "aviso" | "acolhimento" | "administrador" | "curso";
export type AuditAction = "criado" | "editado" | "deletado" | "restaurado";

export type AuditLog = {
  id: string;
  at: string; // ISO
  author: string;
  entity: AuditEntity;
  entityId: string;
  entityName: string;
  action: AuditAction;
  // Snapshots (Memento) do registro antes e depois da mudança; null quando não existia/deixou de existir.
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

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

const ENTITY_LABELS: Record<AuditEntityKey, AuditEntity> = {
  local: "Local",
  servico: "Serviço",
  cardapio: "Cardápio",
  aviso: "Aviso",
  acolhimento: "Acolhimento",
  administrador: "Administrador",
  curso: "Curso",
};

export const ENTITY_KEYS: Record<AuditEntity, AuditEntityKey> = {
  Local: "local",
  Serviço: "servico",
  Cardápio: "cardapio",
  Aviso: "aviso",
  Acolhimento: "acolhimento",
  Administrador: "administrador",
  Curso: "curso",
};

function fromServer(log: ServerLog): AuditLog {
  return {
    id: String(log.id),
    at: log.at,
    author: log.author,
    entity: ENTITY_LABELS[log.entity as AuditEntityKey] ?? "Local",
    entityId: log.entityId,
    entityName: log.entityName,
    action: log.action,
    before: log.before,
    after: log.after,
  };
}

// Mais recentes primeiro (o servidor já ordena). Sem servidor ou sem sessão, a chamada falha e a tela avisa
// (um 401 já leva ao login).
export async function listLogs(): Promise<AuditLog[]> {
  return (await apiGet<ServerLog[]>("/admin/audit-logs?limit=300")).map(fromServer);
}
