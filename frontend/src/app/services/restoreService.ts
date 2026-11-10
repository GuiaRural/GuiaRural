import type { AuditLog } from "../data/mockAuditLogs";
import { restoreAdmin } from "./adminsService";
import { isServerLog, recordChange, serverLogId } from "./auditService";
import { apiPost } from "../lib/api";
import { resetGuideCache } from "./guidesAdminService";
import { delay } from "../lib/storage";

// Entidades que já vêm da API: o desfazer depende do backend saber restaurar o tipo.
const SERVER_ENTITIES: AuditLog["entity"][] = ["Local", "Serviço", "Aviso", "Acolhimento", "Cardápio"];

// Mudanças auditadas no servidor só podem ser desfeitas quando o backend sabe restaurar o tipo (hoje, só
// acolhimento). Locais, serviços, avisos e cardápio vêm da API, que ainda não restaura; o resto usa dados de exemplo em memória.
export function canRestore(log: AuditLog) {
  if (isServerLog(log)) return log.entity === "Acolhimento";
  return !SERVER_ENTITIES.includes(log.entity);
}

// FA01 do UC23: volta o registro ao estado anterior à mudança e registra a restauração no histórico.
export async function restoreFromLog(log: AuditLog, author: string): Promise<void> {
  if (!canRestore(log)) throw new Error("Esta mudança ainda não pode ser desfeita.");
  if (isServerLog(log)) {
    // O servidor aplica o estado anterior e grava a restauração no histórico por conta própria.
    await apiPost<void>(`/admin/audit-logs/${serverLogId(log)}/restore`, {});
    resetGuideCache();
    return;
  }
  await delay(400);
  if (log.entity === "Administrador") restoreAdmin(log.entityId, log.before);
  recordChange({
    author,
    entity: log.entity,
    entityId: log.entityId,
    entityName: log.entityName,
    action: "restaurado",
    before: log.after,
    after: log.before,
  });
}
