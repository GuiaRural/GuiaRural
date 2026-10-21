package br.com.guiarural.backend.services;

import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import br.com.guiarural.backend.services.service.ServiceService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceServiceTest {
    @Mock
    private ServiceRepository repository;

    @InjectMocks
    private ServiceService service;

    @Test
    @DisplayName("Deve criar um serviço do prédio com sucesso")
    void shouldCreateBuildingServiceSuccessfully() {
        ServiceRequestDTO requestDTO = new ServiceRequestDTO(
                "Xerox",
                "Serviço de cópias e impressões",
                "Bloco A, Térreo, Sala 02",
                true
        );

        ServiceEntity savedEntity = new ServiceEntity(
                1L,
                "Xerox",
                "Serviço de cópias e impressões",
                "Bloco A, Térreo, Sala 02",
                true
        );

        when(repository.save(any(ServiceEntity.class))).thenReturn(savedEntity);

        ServiceResponseDTO responseDTO = service.create(requestDTO);

        assertNotNull(responseDTO);
        assertEquals(1L, responseDTO.id());
        assertEquals("Xerox", responseDTO.name());
        assertEquals("Serviço de cópias e impressões", responseDTO.description());
        assertEquals("Bloco A, Térreo, Sala 02", responseDTO.locationReference());
        assertTrue(responseDTO.active());

        verify(repository, times(1)).save(any(ServiceEntity.class));
    }

    @Test
    @DisplayName("Deve listar todos os serviços do prédio com sucesso")
    void shouldFindAllBuildingServicesSuccessfully() {
        List<ServiceEntity> entities = List.of(
                new ServiceEntity(1L, "Xerox", "Impressões", "Bloco A", true),
                new ServiceEntity(2L, "Achados e Perdidos", "Guarda de pertences", "Bloco B", true)
        );

        when(repository.findAll()).thenReturn(entities);

        List<ServiceResponseDTO> result = service.findAll();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Xerox", result.get(0).name());
        assertEquals("Achados e Perdidos", result.get(1).name());

        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve editar um serviço existente com sucesso")
    void shouldUpdateBuildingServiceSuccessfully() {
        Long serviceId = 1L;
        ServiceEntity existingEntity = new ServiceEntity(
                serviceId,
                "Xerox Antiga",
                "Descrição Antiga",
                "Bloco A",
                true
        );

        ServiceRequestDTO updateDTO = new ServiceRequestDTO(
                "Xerox Atualizada",
                "Descrição Nova",
                "Bloco A, Sala 05",
                true
        );

        ServiceEntity updatedEntity = new ServiceEntity(
                serviceId,
                "Xerox Atualizada",
                "Descrição Nova",
                "Bloco A, Sala 05",
                true
        );

        when(repository.findById(serviceId)).thenReturn(Optional.of(existingEntity));
        when(repository.save(any(ServiceEntity.class))).thenReturn(updatedEntity);

        ServiceResponseDTO responseDTO = service.update(serviceId, updateDTO);

        assertNotNull(responseDTO);
        assertEquals(serviceId, responseDTO.id());
        assertEquals("Xerox Atualizada", responseDTO.name());
        assertEquals("Descrição Nova", responseDTO.description());
        assertEquals("Bloco A, Sala 05", responseDTO.locationReference());

        verify(repository, times(1)).findById(serviceId);
        verify(repository, times(1)).save(existingEntity);
    }

    @Test
    @DisplayName("Deve deletar um serviço existente por ID com sucesso")
    void shouldDeleteBuildingServiceSuccessfully() {
        Long serviceId = 1L;

        when(repository.existsById(serviceId)).thenReturn(true);
        doNothing().when(repository).deleteById(serviceId);

        assertDoesNotThrow(() -> service.delete(serviceId));

        verify(repository, times(1)).existsById(serviceId);
        verify(repository, times(1)).deleteById(serviceId);
    }
}
