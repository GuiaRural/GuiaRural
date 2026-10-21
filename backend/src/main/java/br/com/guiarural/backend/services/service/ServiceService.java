package br.com.guiarural.backend.services.service;

import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceService {
   private final ServiceRepository repository;

    public ServiceService(ServiceRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ServiceResponseDTO create(ServiceRequestDTO dto) {
        ServiceEntity entity = new ServiceEntity();
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setLocationReference(dto.locationReference());
        entity.setActive(dto.active());

        ServiceEntity savedEntity = repository.save(entity);
        return mapToResponseDTO(savedEntity);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponseDTO findById(Long id) {
        ServiceEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço não encontrado com ID: " + id));
        return mapToResponseDTO(entity);
    }

    @Transactional
    public ServiceResponseDTO update(Long id, ServiceRequestDTO dto) {
        ServiceEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço não encontrado com ID: " + id));

        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setLocationReference(dto.locationReference());
        entity.setActive(dto.active());

        ServiceEntity updatedEntity = repository.save(entity);
        return mapToResponseDTO(updatedEntity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Serviço não encontrado com ID: " + id);
        }
        repository.deleteById(id);
    }

    private ServiceResponseDTO mapToResponseDTO(ServiceEntity entity) {
        return new ServiceResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLocationReference(),
                entity.getActive()
        );
    } 
}
