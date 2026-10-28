package br.com.guiarural.backend.notices;

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

        assertThrows(RuntimeException.class, () -> avisoService.buscarPorId(2L));
    }
}
