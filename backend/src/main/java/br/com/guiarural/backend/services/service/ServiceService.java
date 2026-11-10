package br.com.guiarural.backend.services.service;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.services.dto.ServicePlaceDTO;
import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ServiceService {
    private final ServiceRepository repository;
    private final PlaceRepository placeRepository;
    private final AuditService auditService;

    public ServiceService(ServiceRepository repository, PlaceRepository placeRepository, AuditService auditService) {
        this.repository = repository;
        this.placeRepository = placeRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ServiceResponseDTO create(ServiceRequestDTO dto) {
        ServiceEntity entity = new ServiceEntity();
        apply(entity, dto);
        // RN-19.02: todo serviço novo nasce publicado, a não ser que se peça o contrário.
        entity.setActive(dto.active() == null || dto.active());

        ServiceEntity savedEntity = repository.save(entity);
        ServiceResponseDTO created = mapToResponseDTO(savedEntity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(savedEntity.getId()), created.name(),
                AuditService.Action.CRIADO, null, created);
        return created;
    }

    // Catálogo público: só o que está publicado.
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> findAll() {
        return mapAll(repository.findByActiveTrueOrderByNameAsc());
    }

    // Painel administrativo: todos, inclusive os despublicados.
    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> findAllForAdmin() {
        return mapAll(repository.findAllByOrderByIdAsc());
    }

    @Transactional(readOnly = true)
    public ServiceResponseDTO findById(Long id) {
        ServiceEntity entity = repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + id));
        return mapToResponseDTO(entity);
    }

    @Transactional
    public ServiceResponseDTO update(Long id, ServiceRequestDTO dto) {
        ServiceEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + id));
        ServiceResponseDTO before = mapToResponseDTO(entity);

        apply(entity, dto);
        if (dto.active() != null) {
            entity.setActive(dto.active());
        }

        ServiceEntity updatedEntity = repository.save(entity);
        ServiceResponseDTO after = mapToResponseDTO(updatedEntity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(id), after.name(),
                AuditService.Action.EDITADO, before, after);
        return after;
    }

    @Transactional
    public void delete(Long id) {
        ServiceEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + id));
        ServiceResponseDTO before = mapToResponseDTO(entity);
        repository.delete(entity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(id), before.name(),
                AuditService.Action.DELETADO, before, null);
    }

    // Copia os campos do formulário, sem espaços nas pontas; opcional em branco vira nulo.
    private void apply(ServiceEntity entity, ServiceRequestDTO dto) {
        entity.setName(dto.name().trim());
        entity.setDescription(dto.description().trim());
        entity.setCategory(dto.category().trim());
        entity.setSector(dto.sector().trim());
        String[] steps = dto.steps().stream()
                .filter(step -> step != null && !step.isBlank())
                .map(String::trim)
                .toArray(String[]::new);
        if (steps.length == 0) {
            throw new BadRequestException("Informe pelo menos um passo de \"Como solicitar\".");
        }
        entity.setSteps(steps);
        entity.setRequirements(blankToNull(dto.requirements()));
        entity.setUrl(blankToNull(dto.url()));
        entity.setDeadline(blankToNull(dto.deadline()));
        entity.setLocationReference(blankToNull(dto.locationReference()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ServiceResponseDTO mapToResponseDTO(ServiceEntity entity) {
        return mapAll(List.of(entity)).get(0);
    }

    // Os locais de todos os serviços da lista vêm numa consulta só (só os publicados: o mapa não mostra os demais).
    private List<ServiceResponseDTO> mapAll(List<ServiceEntity> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        Map<Long, List<ServicePlaceDTO>> placesByService = placeRepository
                .findPublishedPlacesByServiceIds(entities.stream().map(ServiceEntity::getId).toList()).stream()
                .collect(Collectors.groupingBy(PlaceRepository.ServicePlaceRow::getServiceId,
                        Collectors.mapping(row -> new ServicePlaceDTO(row.getSlug(), row.getName()), Collectors.toList())));
        return entities.stream()
                .map(entity -> new ServiceResponseDTO(
                        entity.getId(),
                        entity.getCategory(),
                        entity.getName(),
                        entity.getSector(),
                        entity.getDescription(),
                        entity.getSteps() == null ? List.of() : Arrays.asList(entity.getSteps()),
                        entity.getRequirements(),
                        entity.getUrl(),
                        entity.getDeadline(),
                        entity.getLocationReference(),
                        entity.getActive(),
                        placesByService.getOrDefault(entity.getId(), List.of())))
                .toList();
    }
}
