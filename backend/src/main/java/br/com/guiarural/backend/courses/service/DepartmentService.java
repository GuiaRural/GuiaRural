package br.com.guiarural.backend.courses.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.dto.DepartmentResponseDTO;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository repository;
    private final CourseService courseService;

    public DepartmentService(DepartmentRepository repository, CourseService courseService) {
        this.repository = repository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> findAll() {
        return repository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDTO findById(Long id) {
        return mapToResponseDTO(findActive(id));
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

    private DepartmentResponseDTO mapToResponseDTO(DepartmentEntity entity) {
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
                entity.getFoundedYear()
        );
    }
}
