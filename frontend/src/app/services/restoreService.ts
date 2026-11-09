import type { AuditLog } from "../data/mockAuditLogs";
import { restoreAdmin } from "./adminsService";
import { recordChange } from "./auditService";
import { restoreGuideTopic } from "./guidesAdminService";
import { restoreMenu } from "./menuService";
import { restorePlace } from "./placesService";
import { delay } from "../lib/storage";

// Serviços e avisos vêm do backend (/api/services, /api/avisos), que ainda não guarda snapshots para desfazer.
export function canRestore(log: AuditLog) {
  return log.entity !== "Serviço" && log.entity !== "Aviso";
}

// FA01 do UC23: volta o registro ao estado anterior à mudança e registra a restauração no histórico.
export async function restoreFromLog(log: AuditLog, author: string): Promise<void> {
  await delay(400);
  if (!canRestore(log)) throw new Error("Restauração de serviços e avisos ainda não é suportada pelo backend.");
  if (log.entity === "Local") restorePlace(log.entityId, log.before);
  if (log.entity === "Cardápio") restoreMenu(log.entityId, log.before);
  if (log.entity === "Acolhimento") await restoreGuideTopic(log.entityId, log.before);
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
