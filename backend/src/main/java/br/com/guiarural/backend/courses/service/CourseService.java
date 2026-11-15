package br.com.guiarural.backend.courses.service;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.CourseRequestDTO;
import br.com.guiarural.backend.courses.dto.CoordinationDTO;
import br.com.guiarural.backend.courses.dto.CourseCoordinationDTO;
import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseGroupDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.dto.SubjectRequestDTO;
import br.com.guiarural.backend.courses.dto.SubjectResponseDTO;
import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.model.SubjectEntity;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.courses.repository.SubjectRepository;
import br.com.guiarural.backend.info.model.Language;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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

    // Nível × tipo aceitos (decisão do time): graduação é bacharelado ou licenciatura; pós é stricto sensu.
    private static final Map<CourseLevel, Set<CourseType>> TYPES_BY_LEVEL = Map.of(
            CourseLevel.GRADUACAO, EnumSet.of(CourseType.BACHARELADO, CourseType.LICENCIATURA),
            CourseLevel.POS, EnumSet.of(CourseType.STRICTO_SENSU));

    private final CourseRepository repository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final AuditService auditService;

    public CourseService(CourseRepository repository,
                         DepartmentRepository departmentRepository,
                         SubjectRepository subjectRepository,
                         AuditService auditService) {
        this.repository = repository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.auditService = auditService;
    }

    // Painel: todos os cursos, inclusive os inativos.
    @Transactional(readOnly = true)
    public List<CourseSummaryDTO> findAllForAdmin() {
        return repository.findAll()
                .stream()
                .sorted(DISPLAY_ORDER)
                .map(course -> mapToSummaryDTO(course, Language.PT))
                .toList();
    }

    // O painel edita só o português; a resposta diz em quais idiomas já há tradução (translatedLangs).
    @Transactional(readOnly = true)
    public CourseDetailResponseDTO findByIdForAdmin(Long id) {
        CourseEntity course = findAnyOrThrow(id);
        return mapToDetailDTO(course, departmentOf(course), subjectsOf(id, Language.PT), Language.PT);
    }

    @Transactional
    public CourseDetailResponseDTO create(CourseRequestDTO dto) {
        checkLevelAndType(dto.level(), dto.type());
        DepartmentEntity department = activeDepartment(dto.departmentId());
        CourseEntity course = new CourseEntity();
        apply(course, dto);
        course.setActive(dto.active() == null || dto.active());
        checkSubjects(dto.subjects());
        CourseEntity saved = repository.saveAndFlush(course);
        if (dto.subjects() != null) {
            replaceSubjects(saved.getId(), dto.subjects());
        }
        CourseDetailResponseDTO created = snapshot(saved, department);
        auditService.record(AuditService.Entity.CURSO, String.valueOf(saved.getId()), saved.getName(),
                AuditService.Action.CRIADO, null, created);
        return created;
    }

    // UC35. PUT substitui os campos do curso; a matriz só é substituída se `subjects` vier na requisição.
    @Transactional
    public CourseDetailResponseDTO update(Long id, CourseRequestDTO dto) {
        CourseEntity course = findAnyOrThrow(id);
        checkLevelAndType(dto.level(), dto.type());
        checkSubjects(dto.subjects());
        DepartmentEntity current = departmentOf(course);
        // Trocar para outro departamento exige que ele esteja ativo; manter o atual não, para um curso de um
        // departamento desativado continuar editável.
        DepartmentEntity department = dto.departmentId().equals(course.getDepartmentId())
                ? current
                : activeDepartment(dto.departmentId());
        CourseDetailResponseDTO before = snapshot(course, current);
        apply(course, dto);
        if (dto.active() != null) {
            course.setActive(dto.active());
        }
        CourseEntity saved = repository.saveAndFlush(course);
        if (dto.subjects() != null) {
            replaceSubjects(id, dto.subjects());
        }
        CourseDetailResponseDTO after = snapshot(saved, department);
        auditService.record(AuditService.Entity.CURSO, String.valueOf(id), saved.getName(),
                AuditService.Action.EDITADO, before, after);
        return after;
    }

    // UC36: exclusão definitiva, sem desfazer (RN-UC36-01). A matriz sai antes do curso; os vínculos com locais
    // (place_courses) saem pelo "on delete cascade" do banco.
    @Transactional
    public void delete(Long id) {
        CourseEntity course = findAnyOrThrow(id);
        CourseDetailResponseDTO before = snapshot(course, departmentOf(course));
        subjectRepository.deleteByCourseId(id);
        repository.delete(course);
        repository.flush();
        auditService.record(AuditService.Entity.CURSO, String.valueOf(id), course.getName(),
                AuditService.Action.DELETADO, before, null);
    }

    private CourseEntity findAnyOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com ID: " + id));
    }

    private DepartmentEntity departmentOf(CourseEntity course) {
        return departmentRepository.findById(course.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento não encontrado com ID: " + course.getDepartmentId()));
    }

    private DepartmentEntity activeDepartment(Long departmentId) {
        return departmentRepository.findByIdAndActiveTrue(departmentId)
                .orElseThrow(() -> new BadRequestException("Departamento inexistente ou inativo: " + departmentId));
    }

    private static void checkLevelAndType(CourseLevel level, CourseType type) {
        if (!TYPES_BY_LEVEL.get(level).contains(type)) {
            throw new BadRequestException("Nível e tipo incompatíveis: graduação aceita bacharelado ou licenciatura; "
                    + "pós-graduação aceita stricto sensu.");
        }
    }

    // Texto vazio vira nulo: a página não mostra campo em branco.
    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static void apply(CourseEntity course, CourseRequestDTO dto) {
        course.setDepartmentId(dto.departmentId());
        course.setName(dto.name().trim());
        course.setLevel(dto.level());
        course.setType(dto.type());
        course.setCode(clean(dto.code()));
        course.setModality(clean(dto.modality()));
        course.setShift(clean(dto.shift()));
        course.setDurationSemesters(dto.durationSemesters());
        course.setTotalWorkloadHours(dto.totalWorkloadHours() == null ? null : dto.totalWorkloadHours().shortValue());
        course.setMecGrade(dto.mecGrade());
        course.setCapesGrade(dto.capesGrade());
        course.setDescription(clean(dto.description()));
        course.setCoordinatorName(clean(dto.coordinatorName()));
        course.setViceCoordinatorName(clean(dto.viceCoordinatorName()));
        course.setOfficeLocation(clean(dto.officeLocation()));
        course.setOfficeHours(clean(dto.officeHours()));
        course.setAttendanceMode(clean(dto.attendanceMode()));
        course.setPhone(clean(dto.phone()));
        course.setExtension(clean(dto.extension()));
        course.setEmail(clean(dto.email()));
        course.setSecondaryEmail(clean(dto.secondaryEmail()));
    }

    // Estado gravado no histórico: o curso com a matriz curricular.
    private CourseDetailResponseDTO snapshot(CourseEntity course, DepartmentEntity department) {
        return mapToDetailDTO(course, department, subjectsOf(course.getId(), Language.PT), Language.PT);
    }

    // Duas regras que o banco só barraria com erro 500: código repetido na matriz (unique) e vírgula num
    // pré-requisito (a coluna guarda os códigos separados por vírgula).
    private static void checkSubjects(List<SubjectRequestDTO> subjects) {
        if (subjects == null) {
            return;
        }
        Set<String> codes = new HashSet<>();
        for (SubjectRequestDTO subject : subjects) {
            String code = subject.code().trim();
            if (!codes.add(code.toLowerCase(Locale.ROOT))) {
                throw new BadRequestException("Código de disciplina repetido na matriz: " + code);
            }
            if (subject.prerequisites() != null && subject.prerequisites().stream().anyMatch(p -> p.contains(","))) {
                throw new BadRequestException("Pré-requisitos não podem ter vírgula (disciplina " + code + ").");
            }
        }
    }

    // A matriz enviada vale inteira: disciplina que ficou de fora sai, e as outras são atualizadas pelo código
    // (sem diferenciar caixa) em vez de apagadas e recriadas, para manter o id e as traduções EN/ES delas.
    private void replaceSubjects(Long courseId, List<SubjectRequestDTO> subjects) {
        Map<String, SubjectEntity> existing = new HashMap<>();
        for (SubjectEntity subject : subjectRepository.findByCourseId(courseId)) {
            existing.putIfAbsent(codeKey(subject.getCode()), subject);
        }
        List<SubjectEntity> kept = new ArrayList<>();
        for (SubjectRequestDTO dto : subjects) {
            SubjectEntity entity = existing.remove(codeKey(dto.code()));
            kept.add(apply(entity == null ? new SubjectEntity() : entity, courseId, dto));
        }
        // O que sobrou em `existing` não veio na requisição.
        subjectRepository.deleteAll(existing.values());
        subjectRepository.flush();
        subjectRepository.saveAll(kept);
        subjectRepository.flush();
    }

    private static String codeKey(String code) {
        return code.trim().toLowerCase(Locale.ROOT);
    }

    private static SubjectEntity apply(SubjectEntity entity, Long courseId, SubjectRequestDTO dto) {
        entity.setCourseId(courseId);
        entity.setPeriod(dto.period());
        entity.setCode(dto.code().trim());
        entity.setName(dto.name().trim());
        entity.setSyllabus(clean(dto.syllabus()));
        entity.setWorkloadHours(dto.workloadHours());
        entity.setCredits(dto.credits());
        entity.setNature(dto.nature());
        List<String> prerequisites = dto.prerequisites() == null
                ? List.of()
                : dto.prerequisites().stream().map(String::trim).filter(code -> !code.isEmpty()).toList();
        entity.setPrerequisites(prerequisites.isEmpty() ? null : String.join(",", prerequisites));
        return entity;
    }

    private List<SubjectResponseDTO> subjectsOf(Long courseId, Language language) {
        return subjectRepository.findByCourseId(courseId)
                .stream()
                .sorted(SUBJECT_ORDER)
                .map(subject -> mapToSubjectDTO(subject, language))
                .toList();
    }

    // Leitura pública: ?lang=pt|en|es, com o texto em português quando falta a tradução (RF04).
    @Transactional(readOnly = true)
    public List<CourseSummaryDTO> findAll(Language language) {
        return repository.findByActiveTrue()
                .stream()
                .sorted(DISPLAY_ORDER)
                .map(course -> mapToSummaryDTO(course, language))
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDetailResponseDTO findById(Long id, Language language) {
        CourseEntity course = repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado com ID: " + id));
        DepartmentEntity department = departmentRepository.findById(course.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento não encontrado com ID: " + course.getDepartmentId()));
        return mapToDetailDTO(course, department, subjectsOf(id, language), language);
    }

    @Transactional(readOnly = true)
    public DepartmentCoursesResponseDTO findByDepartment(Long departmentId, Language language) {
        List<CourseEntity> courses = repository.findByDepartmentIdAndActiveTrue(departmentId)
                .stream()
                .sorted(DISPLAY_ORDER)
                .toList();

        List<CourseGroupDTO> groups = courses.stream()
                .collect(Collectors.groupingBy(CourseEntity::getLevel, LinkedHashMap::new,
                        Collectors.mapping(course -> mapToSummaryDTO(course, language), Collectors.toList())))
                .entrySet()
                .stream()
                .map(entry -> new CourseGroupDTO(entry.getKey(), entry.getValue()))
                .toList();

        List<CoordinationDTO> coordinations = courses.stream()
                .filter(course -> course.getCoordinatorName() != null)
                .map(course -> new CoordinationDTO(course.getId(), language.pick(course.getName(), course.getNameEn(), course.getNameEs()),
                        course.getCoordinatorName(), course.getExtension(), course.getEmail()))
                .toList();

        return new DepartmentCoursesResponseDTO(departmentId, courses.size(), groups, coordinations);
    }

    private CourseSummaryDTO mapToSummaryDTO(CourseEntity entity, Language language) {
        return new CourseSummaryDTO(
                entity.getId(),
                entity.getDepartmentId(),
                entity.getCode(),
                language.pick(entity.getName(), entity.getNameEn(), entity.getNameEs()),
                entity.getLevel(),
                entity.getType(),
                entity.getModality(),
                entity.getShift(),
                entity.getDurationSemesters(),
                entity.getMecGrade(),
                entity.getCapesGrade(),
                language.pick(entity.getDescription(), entity.getDescriptionEn(), entity.getDescriptionEs()),
                entity.getOfficeLocation(),
                Boolean.TRUE.equals(entity.getActive()),
                language.effective(entity.getNameEn(), entity.getNameEs()).code()
        );
    }

    private CourseDetailResponseDTO mapToDetailDTO(CourseEntity entity, DepartmentEntity department,
                                                   List<SubjectResponseDTO> subjects, Language language) {
        Language effective = language.effective(entity.getNameEn(), entity.getNameEs());
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
                language.pick(entity.getName(), entity.getNameEn(), entity.getNameEs()),
                entity.getLevel(),
                entity.getType(),
                entity.getModality(),
                entity.getShift(),
                entity.getDurationSemesters(),
                entity.getTotalWorkloadHours(),
                entity.getMecGrade(),
                entity.getCapesGrade(),
                language.pick(entity.getDescription(), entity.getDescriptionEn(), entity.getDescriptionEs()),
                department.getId(),
                department.getName(),
                department.getShortName(),
                department.getAcademicCenter(),
                coordination,
                subjects,
                Boolean.TRUE.equals(entity.getActive()),
                effective.code(),
                effective != Language.PT && contains(entity.getMachineTranslatedLangs(), effective.code()),
                translatedLangs(entity)
        );
    }

    private static boolean contains(String[] values, String value) {
        return values != null && Arrays.asList(values).contains(value);
    }

    // Idiomas em que o nome do curso tem tradução, na ordem en, es.
    private static List<String> translatedLangs(CourseEntity entity) {
        List<String> langs = new ArrayList<>();
        if (entity.getNameEn() != null && !entity.getNameEn().isBlank()) {
            langs.add("en");
        }
        if (entity.getNameEs() != null && !entity.getNameEs().isBlank()) {
            langs.add("es");
        }
        return langs;
    }

    private SubjectResponseDTO mapToSubjectDTO(SubjectEntity entity, Language language) {
        return new SubjectResponseDTO(
                entity.getId(),
                entity.getPeriod(),
                entity.getCode(),
                language.pick(entity.getName(), entity.getNameEn(), entity.getNameEs()),
                language.pick(entity.getSyllabus(), entity.getSyllabusEn(), entity.getSyllabusEs()),
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
