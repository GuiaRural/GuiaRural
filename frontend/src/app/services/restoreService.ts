import { ApiError, apiPost } from "../lib/api";
import type { AuditLog } from "./auditService";
import { resetGuideCache } from "./guidesAdminService";
import { resetPublicCache } from "./placesService";

// O servidor sabe desfazer todas as entidades do painel, menos administradores (D5): conta se aprova ou revoga
// pela tela de Administradores.
export function canRestore(log: AuditLog) {
  return log.entity !== "Administrador";
}

// FA01 do UC23: o servidor volta o registro ao estado anterior à mudança e grava a restauração no histórico.
// Recusas (ex.: já existe cardápio no mesmo dia e turno, o registro já foi excluído) chegam com a mensagem do servidor.
export async function restoreFromLog(log: AuditLog): Promise<void> {
  if (!canRestore(log)) throw new Error("Mudanças em administradores não podem ser desfeitas.");
  try {
    await apiPost<void>(`/admin/audit-logs/${log.id}/restore`, {});
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new Error("Seu perfil não permite desfazer mudanças.");
    }
    if (error instanceof ApiError && error.detail) throw new Error(error.detail);
    throw new Error("Não foi possível restaurar a versão anterior.");
  }
  if (log.entity === "Acolhimento") resetGuideCache();
  // A página do local mostra os serviços dele: desfazer em qualquer dos dois muda o que o mapa lê.
  if (log.entity === "Local" || log.entity === "Serviço") resetPublicCache();
}
