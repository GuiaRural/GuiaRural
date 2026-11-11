package br.com.guiarural.backend.core.audit;

import br.com.guiarural.backend.login.model.AdminPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.Locale;

// Registra quem mudou o quê (RNF06). Roda dentro da transação da própria escrita: se o histórico não puder
// ser gravado, a mudança também não é, então nunca existe alteração sem registro.
@Service
public class AuditService {
    // Mesmos valores do check de audit_logs.entity.
    public enum Entity {
        LOCAL, SERVICO, CARDAPIO, AVISO, ACOLHIMENTO, ADMINISTRADOR, CURSO;

        String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    public enum Action {
        CRIADO, EDITADO, DELETADO, RESTAURADO;

        String value() {
            return name().toLowerCase(Locale.ROOT);
        }
    }

    private final AuditLogRepository repository;
    private final JsonMapper jsonMapper;

    public AuditService(AuditLogRepository repository, JsonMapper jsonMapper) {
        this.repository = repository;
        this.jsonMapper = jsonMapper;
    }

    // before/after são os estados do registro (qualquer objeto serializável); nulos quando não existiam.
    @Transactional(propagation = Propagation.MANDATORY)
    public void record(Entity entity, String entityId, String entityName, Action action, Object before, Object after) {
        AdminPrincipal admin = currentAdmin();
        repository.save(new AuditLogEntity(
                admin.id(),
                admin.name(),
                entity.value(),
                entityId,
                entityName,
                action.value(),
                before == null ? null : jsonMapper.writeValueAsString(before),
                after == null ? null : jsonMapper.writeValueAsString(after)
        ));
    }

    private AdminPrincipal currentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AdminPrincipal admin) {
            return admin;
        }
        // Escrita sem administrador identificado não pode acontecer: as rotas de escrita exigem login.
        throw new IllegalStateException("Escrita sem administrador autenticado.");
    }
}
