package br.com.guiarural.backend.courses.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.CoordinationDTO;
import br.com.guiarural.backend.courses.dto.CourseCoordinationDTO;
import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseGroupDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.dto.SubjectResponseDTO;
import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.model.SubjectEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.courses.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    // RN-UC37-01: grupos por nível e, dentro deles, Bacharelado, Licenciatura e Stricto Sensu.
    private static final Comparator<CourseEntity> DISPLAY_ORDER = Comparator
            .comparing(CourseEntity::getLevel)
            .thenComparing(CourseEntity::getType)
            .thenComparing(CourseEntity::getName, String.CASE_INSENSITIVE_ORDER);

    private static final Comparator<SubjectEntity> SUBJECT_ORDER = Comparator
            .comparing(SubjectEntity::getPeriod, Comparator.nullsLast(Comparator.<Short>naturalOrder()))
            .thenComparing(SubjectEntity::getCode);

    private final CourseRepository repository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;

    public CourseService(CourseRepository repository,
                         DepartmentRepository departmentRepository,
                         SubjectRepository subjectRepository) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDTO> findAll() {
        return repository.findByActiveTrue()
                .stream()
                .sorted(DISPLAY_ORDER)
                .map(this::mapToSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDetailResponseDTO findById(Long id) {
        CourseEntity course = repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com ID: " + id));
        DepartmentEntity department = departmentRepository.findById(course.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento não encontrado com ID: " + course.getDepartmentId()));
        List<SubjectResponseDTO> subjects = subjectRepository.findByCourseId(id)
                .stream()
                .sorted(SUBJECT_ORDER)
                .map(this::mapToSubjectDTO)
                .toList();
        return mapToDetailDTO(course, department, subjects);
    }

    @Transactional(readOnly = true)
    public DepartmentCoursesResponseDTO findByDepartment(Long departmentId) {
        List<CourseEntity> courses = repository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream()
                .sorted(DISPLAY_ORDER)
                .toList();

        List<CourseGroupDTO> groups = courses.stream()
                .collect(Collectors.groupingBy(CourseEntity::getLevel, LinkedHashMap::new,
                        Collectors.mapping(this::mapToSummaryDTO, Collectors.toList())))
                .entrySet()
                .stream()
                .map(entry -> new CourseGroupDTO(entry.getKey(), entry.getValue()))
                .toList();

        List<CoordinationDTO> coordinations = courses.stream()
                .filter(course -> course.getCoordinatorName() != null)
                .map(course -> new CoordinationDTO(course.getId(), course.getName(),
                        course.getCoordinatorName(), course.getExtension(), course.getEmail()))
                .toList();

        return new DepartmentCoursesResponseDTO(departmentId, courses.size(), groups, coordinations);
    }

    private CourseSummaryDTO mapToSummaryDTO(CourseEntity entity) {
        return new CourseSummaryDTO(
                entity.getId(),
                entity.getDepartmentId(),
                entity.getCode(),
                entity.getName(),
                entity.getLevel(),
                entity.getType(),
                entity.getModality(),
                entity.getShift(),
                entity.getDurationSemesters(),
                entity.getMecGrade(),
                entity.getCapesGrade(),
                entity.getDescription(),
                entity.getOfficeLocation()
        );
    }

    private CourseDetailResponseDTO mapToDetailDTO(CourseEntity entity, DepartmentEntity department,
                                                   List<SubjectResponseDTO> subjects) {
        CourseCoordinationDTO coordination = new CourseCoordinationDTO(
                entity.getCoordinatorName(),
                entity.getViceCoordinatorName(),
                entity.getOfficeLocation(),
                entity.getOfficeHours(),
                entity.getAttendanceMode(),
                entity.getPhone(),
                entity.getExtension(),
                entity.getEmail(),
                entity.getSecondaryEmail()
        );
        return new CourseDetailResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getLevel(),
                entity.getType(),
                entity.getModality(),
                entity.getShift(),
                entity.getDurationSemesters(),
                entity.getTotalWorkloadHours(),
                entity.getMecGrade(),
                entity.getCapesGrade(),
                entity.getDescription(),
                department.getId(),
                department.getName(),
                department.getShortName(),
                department.getAcademicCenter(),
                coordination,
                subjects
        );
    }

    private SubjectResponseDTO mapToSubjectDTO(SubjectEntity entity) {
        return new SubjectResponseDTO(
                entity.getId(),
                entity.getPeriod(),
                entity.getCode(),
                entity.getName(),
                entity.getSyllabus(),
                entity.getWorkloadHours(),
                entity.getCredits(),
                entity.getNature(),
                parsePrerequisites(entity.getPrerequisites())
        );
    }

    // Pré-requisitos ficam numa coluna de texto com os códigos separados por vírgula; vazio = "Nenhum".
    private List<String> parsePrerequisites(String raw) {
        if (raw == null) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(code -> !code.isEmpty())
                .toList();
    }
}
