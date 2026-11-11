package br.com.guiarural.backend.map.service;

import br.com.guiarural.backend.contacts.model.ContactEntity;
import br.com.guiarural.backend.contacts.repository.ContactRepository;
import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.map.dto.PlaceContactDTO;
import br.com.guiarural.backend.map.dto.PlaceRequestDTO;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.model.PlacePhotoEntity;
import br.com.guiarural.backend.map.repository.PlacePhotoRepository;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.services.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

// Escritas de locais pelo painel (UC14 a UC16). Toda mudança grava o histórico na mesma transação (RNF06): o id de
// auditoria do local é o slug.
@Service
public class PlaceAdminService {
    // Mesmas listas dos checks da tabela places (migration 20261029135626).
    static final Set<String> CATEGORIES = Set.of(
            "departamento", "administrativo", "biblioteca", "alimentacao", "sala", "portaria",
            "saude", "auditorio", "esporte", "moradia", "apoio");
    static final Set<String> STATUSES = Set.of("publicado", "rascunho", "inativo");
    private static final String DEFAULT_COORDINATES_SOURCE = "Cadastro no painel administrativo";

    private final PlaceRepository repository;
    private final ContactRepository contactRepository;
    private final ServiceRepository serviceRepository;
    private final CourseRepository courseRepository;
    private final PlacePhotoRepository photoRepository;
    private final PlaceAssembler assembler;
    private final PhotoProcessor photoProcessor;
    private final AuditService auditService;

    public PlaceAdminService(PlaceRepository repository,
                             ContactRepository contactRepository,
                             ServiceRepository serviceRepository,
                             CourseRepository courseRepository,
                             PlacePhotoRepository photoRepository,
                             PlaceAssembler assembler,
                             PhotoProcessor photoProcessor,
                             AuditService auditService) {
        this.repository = repository;
        this.contactRepository = contactRepository;
        this.serviceRepository = serviceRepository;
        this.courseRepository = courseRepository;
        this.photoRepository = photoRepository;
        this.assembler = assembler;
        this.photoProcessor = photoProcessor;
        this.auditService = auditService;
    }

    @Transactional
    public PlaceResponseDTO create(PlaceRequestDTO dto) {
        PlaceEntity entity = new PlaceEntity();
        entity.setSlug(resolveSlug(dto));
        apply(entity, dto);
        PlaceEntity saved = repository.save(entity);
        replaceContacts(saved.getId(), dto.contacts());

        PlaceResponseDTO created = assembler.assemble(saved, false);
        auditService.record(AuditService.Entity.LOCAL, saved.getSlug(), saved.getName(),
                AuditService.Action.CRIADO, null, created);
        return created;
    }

    @Transactional
    public PlaceResponseDTO update(String slug, PlaceRequestDTO dto) {
        PlaceEntity entity = find(slug);
        // O slug é a URL do local e a chave guardada no navegador dos usuários: não muda depois de criado.
        if (dto.slug() != null && !dto.slug().isBlank() && !dto.slug().equals(entity.getSlug())) {
            throw new BadRequestException("O identificador do local não pode ser alterado.");
        }
        PlaceResponseDTO before = assembler.assemble(entity, false);

        apply(entity, dto);
        PlaceEntity saved = repository.save(entity);
        replaceContacts(saved.getId(), dto.contacts());

        PlaceResponseDTO after = assembler.assemble(saved, false);
        auditService.record(AuditService.Entity.LOCAL, saved.getSlug(), saved.getName(),
                AuditService.Action.EDITADO, before, after);
        return after;
    }

    @Transactional
    public void delete(String slug) {
        PlaceEntity entity = find(slug);
        PlaceResponseDTO before = assembler.assemble(entity, false);
        // O banco já apaga contatos, vínculos e foto em cascata; feito aqui também para valer igual no H2 dos testes.
        contactRepository.deleteByPlaceId(entity.getId());
        photoRepository.deleteById(entity.getId());
        repository.delete(entity);
        auditService.record(AuditService.Entity.LOCAL, slug, before.name(), AuditService.Action.DELETADO, before, null);
    }

    // Troca a foto do local. O arquivo é reduzido e regravado em JPEG; o histórico guarda só a URL antes e depois.
    @Transactional
    public PlaceResponseDTO savePhoto(String slug, byte[] original) {
        PlaceEntity entity = find(slug);
        PlaceResponseDTO before = assembler.assemble(entity, false);

        byte[] jpeg = photoProcessor.toJpeg(original);
        photoRepository.save(new PlacePhotoEntity(entity.getId(), PhotoProcessor.CONTENT_TYPE, jpeg, Instant.now()));
        photoRepository.flush();

        PlaceResponseDTO after = assembler.assemble(entity, false);
        auditService.record(AuditService.Entity.LOCAL, slug, entity.getName(), AuditService.Action.EDITADO, before, after);
        return after;
    }

    @Transactional
    public PlaceResponseDTO deletePhoto(String slug) {
        PlaceEntity entity = find(slug);
        PlaceResponseDTO before = assembler.assemble(entity, false);
        if (before.photoUrl() == null) {
            return before;
        }
        photoRepository.deleteById(entity.getId());
        photoRepository.flush();

        PlaceResponseDTO after = assembler.assemble(entity, false);
        auditService.record(AuditService.Entity.LOCAL, slug, entity.getName(), AuditService.Action.EDITADO, before, after);
        return after;
    }

    private PlaceEntity find(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado: " + slug));
    }

    // Copia os campos do formulário e confere as regras do UC14.
    private void apply(PlaceEntity entity, PlaceRequestDTO dto) {
        String category = dto.category().trim();
        if (!CATEGORIES.contains(category)) {
            throw new BadRequestException("Categoria inválida: " + category + ".");
        }
        String status = dto.status().trim();
        if (!STATUSES.contains(status)) {
            throw new BadRequestException("Status inválido: " + status + ".");
        }
        // As coordenadas andam juntas (o banco também exige).
        if ((dto.latitude() == null) != (dto.longitude() == null)) {
            throw new BadRequestException("Informe latitude e longitude juntas.");
        }
        // RN-UC14.01: publicar exige georreferenciamento.
        if (PlaceService.PUBLISHED.equals(status) && dto.latitude() == null) {
            throw new BadRequestException("Para publicar o local, informe a latitude e a longitude.");
        }
        String name = dto.name().trim();
        if (name.isEmpty()) {
            throw new BadRequestException("O nome do local é obrigatório.");
        }

        entity.setName(name);
        entity.setShortName(blankToNull(dto.shortName()));
        entity.setCategory(category);
        entity.setStatus(status);
        entity.setLatitude(dto.latitude());
        entity.setLongitude(dto.longitude());
        entity.setCoordinatesSource(coordinatesSource(entity, dto));
        entity.setAddress(blankToNull(dto.address()));
        entity.setHours(blankToNull(dto.hours()));
        entity.setDescription(blankToNull(dto.description()));

        Set<Long> serviceIds = dto.serviceIds() == null ? Set.of() : dto.serviceIds();
        if (serviceRepository.findAllById(serviceIds).size() != serviceIds.size()) {
            throw new BadRequestException("Um dos serviços escolhidos não existe.");
        }
        Set<Long> courseIds = dto.courseIds() == null ? Set.of() : dto.courseIds();
        if (courseRepository.findAllById(courseIds).size() != courseIds.size()) {
            throw new BadRequestException("Um dos cursos escolhidos não existe.");
        }
        entity.setServiceIds(new LinkedHashSet<>(serviceIds));
        entity.setCourseIds(new LinkedHashSet<>(courseIds));
    }

    // Sem coordenada não há origem a registrar. Com coordenada, vale a que veio no pedido; sem ela, mantém a que já
    // estava (ex.: "Google Places") quando a posição não mudou, ou marca como cadastro do painel.
    private String coordinatesSource(PlaceEntity entity, PlaceRequestDTO dto) {
        if (dto.latitude() == null) {
            return null;
        }
        String informed = blankToNull(dto.coordinatesSource());
        if (informed != null) {
            return informed;
        }
        boolean samePosition = dto.latitude().equals(entity.getLatitude()) && dto.longitude().equals(entity.getLongitude());
        return samePosition && entity.getCoordinatesSource() != null ? entity.getCoordinatesSource() : DEFAULT_COORDINATES_SOURCE;
    }

    private void replaceContacts(Long placeId, List<PlaceContactDTO> contacts) {
        contactRepository.deleteByPlaceId(placeId);
        contactRepository.flush();
        if (contacts == null) {
            return;
        }
        for (PlaceContactDTO contact : contacts) {
            contactRepository.save(new ContactEntity(
                    contact.name().trim(),
                    blankToNull(contact.email()),
                    blankToNull(contact.phone()),
                    placeId));
        }
    }

    // Slug informado tem de ser livre (409). Sem slug, nasce do nome e ganha -2, -3... se já existir.
    private String resolveSlug(PlaceRequestDTO dto) {
        String informed = blankToNull(dto.slug());
        if (informed != null) {
            if (repository.existsBySlug(informed)) {
                throw new ConflictException("Já existe um local com o identificador \"" + informed + "\".");
            }
            return informed;
        }
        String base = slugify(dto.name());
        String candidate = base;
        for (int suffix = 2; repository.existsBySlug(candidate); suffix++) {
            candidate = base + "-" + suffix;
        }
        return candidate;
    }

    static String slugify(String name) {
        String ascii = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        return slug.isEmpty() ? "local" : slug;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
