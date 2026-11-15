package br.com.guiarural.backend.services;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import br.com.guiarural.backend.services.service.ServiceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {
    @Mock
    private ServiceRepository repository;

    @Mock
    private AuditService auditService;

    // Os locais do serviço vêm daqui; sem stub, a consulta devolve lista vazia (serviço sem local).
    @Mock
    private PlaceRepository placeRepository;

    @InjectMocks
    private ServiceService service;

    private ServiceRequestDTO request(String name, Boolean active) {
        return new ServiceRequestDTO(name, "  Identificação estudantil  ", " Documentos ", " DCE ",
                List.of(" Separe os documentos. ", "   ", "Faça a solicitação."),
                " Declaração de vínculo ", "https://dce.example.org/carteira", "  ", null, active);
    }

    private ServiceEntity entity(Long id, String name, boolean active) {
        ServiceEntity entity = new ServiceEntity(id, name, "Descrição", null, active);
        entity.setCategory("Documentos");
        entity.setSector("DCE");
        entity.setSteps(new String[]{"Passo 1"});
        return entity;
    }

    @Test
    @DisplayName("Deve criar o serviço limpando espaços e descartando passos em branco")
    void shouldCreateServiceCleaningInput() {
        when(repository.save(any(ServiceEntity.class))).thenAnswer(call -> {
            ServiceEntity saved = call.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        ServiceResponseDTO created = service.create(request("  Carteira de Estudante  ", null));

        assertEquals(1L, created.id());
        assertEquals("Carteira de Estudante", created.name());
        assertEquals("Identificação estudantil", created.description());
        assertEquals("Documentos", created.category());
        assertEquals("DCE", created.sector());
        assertEquals(List.of("Separe os documentos.", "Faça a solicitação."), created.steps());
        assertEquals("Declaração de vínculo", created.requirements());
        assertEquals("https://dce.example.org/carteira", created.url());
        // Em branco vira nulo.
        assertNull(created.deadline());
        verify(auditService).record(AuditService.Entity.SERVICO, "1", "Carteira de Estudante",
                AuditService.Action.CRIADO, null, created);
    }

    @Test
    @DisplayName("Deve recusar quando todos os passos estão em branco")
    void shouldRejectWhenAllStepsBlank() {
        ServiceRequestDTO blankSteps = new ServiceRequestDTO("Nome", "Descrição", "Categoria", "Setor",
                List.of("  ", ""), null, null, null, null, null);

        assertThrows(BadRequestException.class, () -> service.create(blankSteps));
        verifyNoInteractions(auditService);
    }

    @Test
    @DisplayName("RN-19.02: serviço novo nasce publicado, salvo pedido em contrário")
    void shouldPublishNewServiceByDefault() {
        when(repository.save(any(ServiceEntity.class))).thenAnswer(call -> call.getArgument(0));

        assertTrue(service.create(request("Padrão", null)).active());
        assertFalse(service.create(request("Rascunho", false)).active());
    }

    @Test
    @DisplayName("Catálogo público lista só serviços publicados")
    void shouldListOnlyPublishedForThePublic() {
        when(repository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(entity(1L, "Xerox", true)));

        List<ServiceResponseDTO> result = service.findAll();

        assertEquals(1, result.size());
        assertEquals("Xerox", result.get(0).name());
        verify(repository, never()).findAll();
    }

    @Test
    @DisplayName("Painel lista todos, inclusive os despublicados")
    void shouldListEverythingForAdmin() {
        when(repository.findAllByOrderByIdAsc()).thenReturn(List.of(entity(1L, "Xerox", true), entity(2L, "Antigo", false)));

        List<ServiceResponseDTO> result = service.findAllForAdmin();

        assertEquals(2, result.size());
        assertFalse(result.get(1).active());
    }

    @Test
    @DisplayName("Serviço despublicado responde 404 na consulta pública")
    void shouldHideUnpublishedServiceFromThePublic() {
        when(repository.findByIdAndActiveTrue(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(2L));
    }

    @Test
    @DisplayName("Deve editar o serviço, manter o status quando não informado e auditar antes e depois")
    void shouldUpdateServiceKeepingStatus() {
        ServiceEntity existing = entity(1L, "Xerox Antiga", true);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        ServiceResponseDTO updated = service.update(1L, request("Xerox Nova", null));

        assertEquals("Xerox Nova", updated.name());
        assertTrue(updated.active());
        ArgumentCaptor<Object> before = ArgumentCaptor.forClass(Object.class);
        verify(auditService).record(eq(AuditService.Entity.SERVICO), eq("1"), eq("Xerox Nova"),
                eq(AuditService.Action.EDITADO), before.capture(), eq(updated));
        assertEquals("Xerox Antiga", ((ServiceResponseDTO) before.getValue()).name());
    }

    @Test
    @DisplayName("Deve despublicar o serviço quando a edição pede active=false")
    void shouldUnpublishOnRequest() {
        ServiceEntity existing = entity(1L, "Xerox", true);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        assertFalse(service.update(1L, request("Xerox", false)).active());
    }

    @Test
    @DisplayName("Deve lançar 404 ao editar ou excluir um serviço que não existe")
    void shouldThrowWhenServiceMissing() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(9L, request("x", null)));
        assertThrows(ResourceNotFoundException.class, () -> service.delete(9L));
        verifyNoInteractions(auditService);
    }

    @Test
    @DisplayName("Deve excluir o serviço e auditar com o estado que existia")
    void shouldDeleteService() {
        ServiceEntity existing = entity(1L, "Xerox", true);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.delete(1L);

        verify(repository).delete(existing);
        verify(auditService).record(eq(AuditService.Entity.SERVICO), eq("1"), eq("Xerox"),
                eq(AuditService.Action.DELETADO), any(ServiceResponseDTO.class), isNull());
    }
}
