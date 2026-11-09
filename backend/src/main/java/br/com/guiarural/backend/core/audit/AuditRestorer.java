package br.com.guiarural.backend.core.audit;

// Quem sabe desfazer uma mudança de um tipo de registro (UC23). Cada módulo que audita e permite desfazer
// implementa esta interface; o AuditController escolhe o certo pela entidade do log.
public interface AuditRestorer {
    AuditService.Entity entity();

    // Devolve o registro ao estado anterior à mudança descrita pelo log e registra a restauração.
    void restore(AuditLogEntity log);
}
