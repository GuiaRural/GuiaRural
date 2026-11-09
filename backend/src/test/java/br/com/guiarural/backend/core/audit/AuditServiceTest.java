package br.com.guiarural.backend.core.audit;

import br.com.guiarural.backend.login.model.AdminPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import tools.jackson.databind.json.JsonMapper;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {
    @Mock
    private AuditLogRepository repository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void login(AdminPrincipal admin) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(admin, null, admin.authorities()));
    }

    @Test
    @DisplayName("Deve gravar autor, entidade, ação e os estados antes e depois")
    void shouldRecordWhoChangedWhat() {
        login(new AdminPrincipal(7L, "Equipe de Comunicação", "equipe@ufrpe.br", "Comunicação", "editor"));

        new AuditService(repository, jsonMapper).record(AuditService.Entity.AVISO, "12", "Manutenção",
                AuditService.Action.EDITADO, Map.of("nome", "Antes"), Map.of("nome", "Depois"));

        ArgumentCaptor<AuditLogEntity> saved = ArgumentCaptor.forClass(AuditLogEntity.class);
        verify(repository).save(saved.capture());
        AuditLogEntity log = saved.getValue();
        assertEquals(7L, log.getAdminId());
        assertEquals("Equipe de Comunicação", log.getAuthor());
        assertEquals("aviso", log.getEntity());
        assertEquals("12", log.getEntityId());
        assertEquals("Manutenção", log.getEntityName());
        assertEquals("editado", log.getAction());
        assertEquals("{\"nome\":\"Antes\"}", log.getBeforeState());
        assertEquals("{\"nome\":\"Depois\"}", log.getAfterState());
    }

    @Test
    @DisplayName("Deve deixar nulo o estado que não existia (criação e exclusão)")
    void shouldLeaveMissingStateNull() {
        login(new AdminPrincipal(7L, "Equipe", "equipe@ufrpe.br", "Comunicação", "geral"));
        AuditService service = new AuditService(repository, jsonMapper);

        service.record(AuditService.Entity.ACOLHIMENTO, "cpf", "CPF", AuditService.Action.CRIADO, null, Map.of("a", 1));
        service.record(AuditService.Entity.ACOLHIMENTO, "cpf", "CPF", AuditService.Action.DELETADO, Map.of("a", 1), null);

        ArgumentCaptor<AuditLogEntity> saved = ArgumentCaptor.forClass(AuditLogEntity.class);
        verify(repository, org.mockito.Mockito.times(2)).save(saved.capture());
        assertNull(saved.getAllValues().get(0).getBeforeState());
        assertNull(saved.getAllValues().get(1).getAfterState());
    }

    @Test
    @DisplayName("Deve recusar registrar uma escrita sem administrador autenticado")
    void shouldRefuseWithoutAuthenticatedAdmin() {
        AuditService service = new AuditService(repository, jsonMapper);

        assertThrows(IllegalStateException.class, () ->
                service.record(AuditService.Entity.AVISO, "1", "x", AuditService.Action.CRIADO, null, Map.of()));
        verifyNoInteractions(repository);
    }
}
