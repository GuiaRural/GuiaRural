import type { AuditLog } from "../data/mockAuditLogs";
import { restoreAdmin } from "./adminsService";
import { isServerLog, recordChange, serverLogId } from "./auditService";
import { apiPost } from "../lib/api";
import { resetGuideCache } from "./guidesAdminService";
import { restoreMenu } from "./menuService";
import { restorePlace } from "./placesService";
import { delay } from "../lib/storage";

// Mudanças auditadas no servidor só podem ser desfeitas quando o backend sabe restaurar o tipo (hoje, só
// acolhimento). Serviços e avisos vêm da API, que ainda não restaura; o resto usa dados de exemplo em memória.
export function canRestore(log: AuditLog) {
  if (isServerLog(log)) return log.entity === "Acolhimento";
  return log.entity !== "Serviço" && log.entity !== "Aviso" && log.entity !== "Acolhimento";
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
  if (log.entity === "Local") restorePlace(log.entityId, log.before);
  if (log.entity === "Cardápio") restoreMenu(log.entityId, log.before);
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
