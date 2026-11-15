package br.com.guiarural.backend.courses.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.map.service.PlaceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DepartmentService {
    private final DepartmentRepository repository;
    private final PlaceRepository placeRepository;
    private final CourseService courseService;

    public DepartmentService(DepartmentRepository repository, PlaceRepository placeRepository,
                             CourseService courseService) {
        this.repository = repository;
        this.placeRepository = placeRepository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> findAll(Language language) {
        List<DepartmentEntity> departments = repository.findByActiveTrueOrderByNameAsc();
        Map<Long, String> slugs = publishedPlaceSlugs(departments);
        return departments.stream()
                .map(department -> mapToResponseDTO(department, slugs.get(department.getPlaceId()), language))
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDTO findById(Long id, Language language) {
        DepartmentEntity department = findActive(id);
        return mapToResponseDTO(department, publishedPlaceSlugs(List.of(department)).get(department.getPlaceId()), language);
    }

    @Transactional(readOnly = true)
    public DepartmentCoursesResponseDTO findCourses(Long id, Language language) {
        findActive(id);
        return courseService.findByDepartment(id, language);
    }

    private DepartmentEntity findActive(Long id) {
        return repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Departamento não encontrado com ID: " + id));
    }

    // Só locais publicados viram link para o mapa; rascunho ou inativo fica sem slug.
    private Map<Long, String> publishedPlaceSlugs(List<DepartmentEntity> departments) {
        List<Long> placeIds = departments.stream()
                .map(DepartmentEntity::getPlaceId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> slugs = new HashMap<>();
        for (PlaceEntity place : placeRepository.findAllById(placeIds)) {
            if (PlaceService.PUBLISHED.equals(place.getStatus())) {
                slugs.put(place.getId(), place.getSlug());
            }
        }
        return slugs;
    }

    private DepartmentResponseDTO mapToResponseDTO(DepartmentEntity entity, String placeSlug, Language language) {
        Language effective = language.effective(entity.getNameEn(), entity.getNameEs());
        return new DepartmentResponseDTO(
                entity.getId(),
                entity.getCode(),
                language.pick(entity.getName(), entity.getNameEn(), entity.getNameEs()),
                entity.getShortName(),
                entity.getAcademicCenter(),
                language.pick(entity.getDescription(), entity.getDescriptionEn(), entity.getDescriptionEs()),
                entity.getAddress(),
                entity.getHours(),
                entity.getPhone(),
                entity.getEmail(),
                entity.getFoundedYear(),
                placeSlug,
                effective.code(),
                effective != Language.PT && contains(entity.getMachineTranslatedLangs(), effective.code()),
                translatedLangs(entity)
        );
    }

    private static boolean contains(String[] values, String value) {
        return values != null && Arrays.asList(values).contains(value);
    }

    // Idiomas em que o nome do departamento tem tradução, na ordem en, es.
    private static List<String> translatedLangs(DepartmentEntity entity) {
        List<String> langs = new ArrayList<>();
        if (entity.getNameEn() != null && !entity.getNameEn().isBlank()) {
            langs.add("en");
        }
        if (entity.getNameEs() != null && !entity.getNameEs().isBlank()) {
            langs.add("es");
        }
        return langs;
    }
}
