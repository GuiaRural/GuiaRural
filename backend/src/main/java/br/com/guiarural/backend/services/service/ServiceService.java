package br.com.guiarural.backend.services.service;

import br.com.guiarural.backend.core.audit.AuditLogEntity;
import br.com.guiarural.backend.core.audit.AuditRestorer;
import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.services.dto.ServicePlaceDTO;
import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.model.ServiceEntity;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ServiceService implements AuditRestorer {
    private final ServiceRepository repository;
    private final PlaceRepository placeRepository;
    private final AuditService auditService;
    private final JsonMapper jsonMapper;

    public ServiceService(ServiceRepository repository, PlaceRepository placeRepository, AuditService auditService,
                          JsonMapper jsonMapper) {
        this.repository = repository;
        this.placeRepository = placeRepository;
        this.auditService = auditService;
        this.jsonMapper = jsonMapper;
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
        return update(find(id), dto, AuditService.Action.EDITADO);
    }

    @Transactional
    public void delete(Long id) {
        delete(find(id), AuditService.Action.DELETADO);
    }

    @Override
    public AuditService.Entity entity() {
        return AuditService.Entity.SERVICO;
    }

    // UC23: desfaz a mudança do log. Criação -> exclui; edição -> volta ao estado anterior; exclusão -> recria com o
    // id original e religa os locais publicados que o histórico guardou (rascunhos não entram no retrato do serviço).
    @Override
    @Transactional
    public void restore(AuditLogEntity log) {
        Long id = Long.valueOf(log.getEntityId());
        ServiceEntity current = repository.findById(id).orElse(null);
        if (log.getBeforeState() == null) {
            if (current == null) {
                throw new ConflictException("Este serviço já foi excluído; não há o que desfazer.");
            }
            delete(current, AuditService.Action.RESTAURADO);
            return;
        }
        ServiceResponseDTO previous = jsonMapper.readValue(log.getBeforeState(), ServiceResponseDTO.class);
        ServiceRequestDTO target = new ServiceRequestDTO(previous.name(), previous.description(), previous.category(),
                previous.sector(), previous.steps(), previous.requirements(), previous.url(), previous.deadline(),
                previous.locationReference(), previous.active());
        if (current != null) {
            update(current, target, AuditService.Action.RESTAURADO);
            return;
        }

        ServiceEntity entity = new ServiceEntity();
        apply(entity, target);
        entity.setActive(!Boolean.FALSE.equals(previous.active()));
        ServiceEntity saved = repository.saveAndFlush(entity);
        repository.restoreId(saved.getId(), id);
        relinkPlaces(id, previous.places());
        ServiceResponseDTO restored = mapToResponseDTO(find(id));
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(id), restored.name(),
                AuditService.Action.RESTAURADO, null, restored);
    }

    // Os vínculos ficam no local (place_service) e somem com a exclusão do serviço; local que não existe mais é ignorado.
    private void relinkPlaces(Long serviceId, List<ServicePlaceDTO> places) {
        if (places == null) {
            return;
        }
        for (ServicePlaceDTO link : places) {
            placeRepository.findBySlug(link.slug()).ifPresent(place -> {
                place.getServiceIds().add(serviceId);
                placeRepository.saveAndFlush(place);
            });
        }
    }

    private ServiceEntity find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado com ID: " + id));
    }

    private ServiceResponseDTO update(ServiceEntity entity, ServiceRequestDTO dto, AuditService.Action action) {
        ServiceResponseDTO before = mapToResponseDTO(entity);

        apply(entity, dto);
        if (dto.active() != null) {
            entity.setActive(dto.active());
        }

        ServiceEntity updatedEntity = repository.save(entity);
        ServiceResponseDTO after = mapToResponseDTO(updatedEntity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(entity.getId()), after.name(),
                action, before, after);
        return after;
    }

    private void delete(ServiceEntity entity, AuditService.Action action) {
        ServiceResponseDTO before = mapToResponseDTO(entity);
        repository.delete(entity);
        auditService.record(AuditService.Entity.SERVICO, String.valueOf(entity.getId()), before.name(),
                action, before, null);
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
