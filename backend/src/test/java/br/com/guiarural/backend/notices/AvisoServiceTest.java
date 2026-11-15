package br.com.guiarural.backend.notices;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.guiarural.backend.notices.dto.AvisoRequestDTO;
import br.com.guiarural.backend.notices.dto.AvisoResponseDTO;
import br.com.guiarural.backend.notices.model.AvisoEntity;
import br.com.guiarural.backend.notices.repository.AvisoRepository;
import br.com.guiarural.backend.notices.service.AvisoService;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvisoServiceTest {

    @Mock
    private AvisoRepository avisoRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AvisoService avisoService;

    private AvisoEntity avisoMock;

    @BeforeEach
    void setUp() {
        avisoMock = new AvisoEntity("Manutenção", "Falta de energia amanhã");
        avisoMock.setId(1L);
        avisoMock.setData(LocalDateTime.now());
    }

    @Test
    void criarAviso_DeveRetornarAvisoCriado() {
        AvisoRequestDTO request = new AvisoRequestDTO("Manutenção", "Falta de energia amanhã");
        when(avisoRepository.save(any(AvisoEntity.class))).thenReturn(avisoMock);

        AvisoResponseDTO response = avisoService.criarAviso(request);

        assertNotNull(response);
        assertEquals("Manutenção", response.nome());
        assertEquals("Falta de energia amanhã", response.descricao());
        verify(avisoRepository, times(1)).save(any(AvisoEntity.class));
        verify(auditService).record(AuditService.Entity.AVISO, "1", "Manutenção", AuditService.Action.CRIADO, null, response);
    }

    @Test
    void buscarPorId_DeveRetornarAvisoSeExistir() {
        when(avisoRepository.findById(1L)).thenReturn(Optional.of(avisoMock));

        AvisoResponseDTO response = avisoService.buscarPorId(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
    }

    @Test
    void buscarPorId_DeveLancarExcecaoSeNaoExistir() {
        when(avisoRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> avisoService.buscarPorId(2L));
    }

    @Test
    void atualizarAviso_DeveAuditarOAntesEODepois() {
        when(avisoRepository.findById(1L)).thenReturn(Optional.of(avisoMock));
        when(avisoRepository.save(avisoMock)).thenReturn(avisoMock);

        AvisoResponseDTO response = avisoService.atualizarAviso(1L, new AvisoRequestDTO("Novo título", "Nova descrição"));

        assertEquals("Novo título", response.nome());
        verify(auditService).record(eq(AuditService.Entity.AVISO), eq("1"), eq("Novo título"),
                eq(AuditService.Action.EDITADO), argThat(antes -> ((AvisoResponseDTO) antes).nome().equals("Manutenção")), eq(response));
    }

    @Test
    void deletarAviso_DeveRemoverEAuditar() {
        when(avisoRepository.findById(1L)).thenReturn(Optional.of(avisoMock));

        avisoService.deletarAviso(1L);

        verify(avisoRepository).delete(avisoMock);
        verify(auditService).record(eq(AuditService.Entity.AVISO), eq("1"), eq("Manutenção"),
                eq(AuditService.Action.DELETADO), any(AvisoResponseDTO.class), isNull());
    }

    @Test
    void deletarAviso_NaoDeveAuditarQuandoNaoExiste() {
        when(avisoRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> avisoService.deletarAviso(2L));

        verifyNoInteractions(auditService);
    }
}
