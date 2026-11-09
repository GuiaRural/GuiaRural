package br.com.guiarural.backend.services.service;

import br.com.guiarural.backend.core.audit.AuditService;
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
    private final AuditService auditService;

    public ServiceService(ServiceRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional
    public ServiceResponseDTO create(ServiceRequestDTO dto) {
        ServiceEntity entity = new ServiceEntity();
        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setLocationReference(dto.locationReference());
        entity.setActive(dto.active());

        ServiceEntity savedEntity = repository.save(entity);
        ServiceResponseDTO created = mapToResponseDTO(savedEntity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(savedEntity.getId()), created.name(),
                AuditService.Action.CRIADO, null, created);
        return created;
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
        ServiceResponseDTO before = mapToResponseDTO(entity);

        entity.setName(dto.name());
        entity.setDescription(dto.description());
        entity.setLocationReference(dto.locationReference());
        entity.setActive(dto.active());

        ServiceEntity updatedEntity = repository.save(entity);
        ServiceResponseDTO after = mapToResponseDTO(updatedEntity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(id), after.name(),
                AuditService.Action.EDITADO, before, after);
        return after;
    }

    @Transactional
    public void delete(Long id) {
        ServiceEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Serviço não encontrado com ID: " + id));
        ServiceResponseDTO before = mapToResponseDTO(entity);
        repository.delete(entity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(id), before.name(),
                AuditService.Action.DELETADO, before, null);
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
