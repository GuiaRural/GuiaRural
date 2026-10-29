package br.com.guiarural.backend.courses.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import br.com.guiarural.backend.map.service.PlaceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<DepartmentResponseDTO> findAll() {
        List<DepartmentEntity> departments = repository.findByActiveTrueOrderByNameAsc();
        Map<Long, String> slugs = publishedPlaceSlugs(departments);
        return departments.stream()
                .map(department -> mapToResponseDTO(department, slugs.get(department.getPlaceId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDTO findById(Long id) {
        DepartmentEntity department = findActive(id);
        return mapToResponseDTO(department, publishedPlaceSlugs(List.of(department)).get(department.getPlaceId()));
    }

    @Transactional(readOnly = true)
    public DepartmentCoursesResponseDTO findCourses(Long id) {
        findActive(id);
        return courseService.findByDepartment(id);
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

    private DepartmentResponseDTO mapToResponseDTO(DepartmentEntity entity, String placeSlug) {
        return new DepartmentResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getShortName(),
                entity.getAcademicCenter(),
                entity.getDescription(),
                entity.getAddress(),
                entity.getHours(),
                entity.getPhone(),
                entity.getEmail(),
                entity.getFoundedYear(),
                placeSlug
        );
    }
}
