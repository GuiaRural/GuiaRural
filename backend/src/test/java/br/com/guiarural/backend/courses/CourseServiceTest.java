package br.com.guiarural.backend.courses;

import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseRequestDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.dto.SubjectRequestDTO;
import br.com.guiarural.backend.courses.model.CourseEntity;
import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;
import br.com.guiarural.backend.courses.model.DepartmentEntity;
import br.com.guiarural.backend.courses.model.SubjectEntity;
import br.com.guiarural.backend.courses.model.SubjectNature;
import br.com.guiarural.backend.courses.repository.CourseRepository;
import br.com.guiarural.backend.courses.repository.DepartmentRepository;
import br.com.guiarural.backend.courses.repository.SubjectRepository;
import br.com.guiarural.backend.courses.service.CourseService;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
    @Mock
    private CourseRepository repository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CourseService service;

    private CourseEntity course(Long id, String name, CourseLevel level, CourseType type, String coordinator) {
        CourseEntity course = new CourseEntity();
        course.setId(id);
        course.setDepartmentId(10L);
        course.setName(name);
        course.setLevel(level);
        course.setType(type);
        course.setCoordinatorName(coordinator);
        course.setActive(true);
        return course;
    }

    private SubjectEntity subject(Long id, Short period, String code, String prerequisites) {
        SubjectEntity subject = new SubjectEntity();
        subject.setId(id);
        subject.setCourseId(1L);
        subject.setPeriod(period);
        subject.setCode(code);
        subject.setName("Disciplina " + code);
        subject.setWorkloadHours((short) 60);
        subject.setNature(SubjectNature.OBRIGATORIA);
        subject.setPrerequisites(prerequisites);
        return subject;
    }

    @Test
    @DisplayName("Deve ordenar os cursos por nível e tipo: Bacharelado, Licenciatura e Stricto Sensu")
    void shouldGroupAndSortCoursesByLevelAndType() {
        when(repository.findByDepartmentIdAndActiveTrue(10L)).thenReturn(List.of(
                course(1L, "PPGIA", CourseLevel.POS, CourseType.STRICTO_SENSU, "Coord. Pós"),
                course(2L, "Licenciatura em Computação", CourseLevel.GRADUACAO, CourseType.LICENCIATURA, null),
                course(3L, "Sistemas de Informação", CourseLevel.GRADUACAO, CourseType.BACHARELADO, "Coord. SI"),
                course(4L, "Ciência da Computação", CourseLevel.GRADUACAO, CourseType.BACHARELADO, "Coord. CC")
        ));

        DepartmentCoursesResponseDTO result = service.findByDepartment(10L);

        assertEquals(2, result.groups().size());
        assertEquals(CourseLevel.GRADUACAO, result.groups().get(0).level());
        assertEquals(CourseLevel.POS, result.groups().get(1).level());
        assertEquals(
                List.of("Ciência da Computação", "Sistemas de Informação", "Licenciatura em Computação"),
                result.groups().get(0).courses().stream().map(CourseSummaryDTO::name).toList());
    }

    @Test
    @DisplayName("Deve contar os programas oferecidos e listar só coordenações com coordenador")
    void shouldCountProgramsAndListCoordinations() {
        when(repository.findByDepartmentIdAndActiveTrue(10L)).thenReturn(List.of(
                course(1L, "Ciência da Computação", CourseLevel.GRADUACAO, CourseType.BACHARELADO, "Coord. CC"),
                course(2L, "Licenciatura em Computação", CourseLevel.GRADUACAO, CourseType.LICENCIATURA, null)
        ));

        DepartmentCoursesResponseDTO result = service.findByDepartment(10L);

        assertEquals(2, result.programsOffered());
        assertEquals(1, result.coordinations().size());
        assertEquals("Coord. CC", result.coordinations().get(0).coordinatorName());
    }

    @Test
    @DisplayName("Deve devolver departamento sem cursos como lista vazia (FE-37.01)")
    void shouldReturnEmptyWhenDepartmentHasNoCourses() {
        when(repository.findByDepartmentIdAndActiveTrue(10L)).thenReturn(List.of());

        DepartmentCoursesResponseDTO result = service.findByDepartment(10L);

        assertEquals(0, result.programsOffered());
        assertTrue(result.groups().isEmpty());
        assertTrue(result.coordinations().isEmpty());
    }

    @Test
    @DisplayName("Deve montar o curso com a matriz ordenada por período e optativas por último")
    void shouldFindCourseWithSortedSubjects() {
        CourseEntity course = course(1L, "Ciência da Computação", CourseLevel.GRADUACAO, CourseType.BACHARELADO, "Coord. CC");
        course.setTotalWorkloadHours((short) 3240);
        DepartmentEntity department = new DepartmentEntity();
        department.setId(10L);
        department.setName("Departamento de Computação");
        department.setShortName("DC");

        when(repository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(course));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department));
        when(subjectRepository.findByCourseId(1L)).thenReturn(List.of(
                subject(1L, null, "OPT01", null),
                subject(2L, (short) 2, "CC201", "CC101, MAT110"),
                subject(3L, (short) 1, "CC101", "")
        ));

        CourseDetailResponseDTO result = service.findById(1L);

        assertEquals("DC", result.departmentShortName());
        assertEquals((short) 3240, result.totalWorkloadHours());
        assertEquals(List.of("CC101", "CC201", "OPT01"),
                result.subjects().stream().map(s -> s.code()).toList());
        assertEquals(List.of("CC101", "MAT110"), result.subjects().get(1).prerequisites());
        assertTrue(result.subjects().get(0).prerequisites().isEmpty());
    }

    @Test
    @DisplayName("Deve lançar 404 quando o curso não existe ou está inativo")
    void shouldThrowWhenCourseNotFound() {
        when(repository.findByIdAndActiveTrue(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(99L));

        verifyNoInteractions(subjectRepository);
    }

    // ---------------------------------------------------------------------------------------------------------
    // Escrita (Fase 5a: UC35, UC36 e cadastro)
    // ---------------------------------------------------------------------------------------------------------

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    private CourseRequestDTO request(Long departmentId, String name, CourseLevel level, CourseType type) {
        return new CourseRequestDTO(departmentId, name, level, type, "  ", " Presencial ", "", (short) 8, 3200,
                (short) 4, null, "  ", null, " Profa. Coordenadora ", "", null, null, null, null, null,
                "coord@ufrpe.br", "", null);
    }

    private CourseRequestDTO withSubjects(List<SubjectRequestDTO> subjects) {
        CourseRequestDTO base = valid();
        return new CourseRequestDTO(base.departmentId(), base.name(), base.level(), base.type(), base.code(),
                base.modality(), base.shift(), base.durationSemesters(), base.totalWorkloadHours(), base.mecGrade(),
                base.capesGrade(), base.description(), base.active(), base.coordinatorName(),
                base.viceCoordinatorName(), base.officeLocation(), base.officeHours(), base.attendanceMode(),
                base.phone(), base.extension(), base.email(), base.secondaryEmail(), subjects);
    }

    private static SubjectRequestDTO subjectRequest(Short period, String code, List<String> prerequisites) {
        return new SubjectRequestDTO(period, code, " Disciplina " + code.trim() + " ", "  ", (short) 60, (short) 4,
                SubjectNature.OBRIGATORIA, prerequisites);
    }

    private CourseRequestDTO valid() {
        return request(10L, "  Ciência da Computação ", CourseLevel.GRADUACAO, CourseType.BACHARELADO);
    }

    private DepartmentEntity department(Long id, boolean active) {
        DepartmentEntity department = new DepartmentEntity();
        department.setId(id);
        department.setName("Departamento de Computação");
        department.setActive(active);
        return department;
    }

    private void saveGivesId() {
        when(repository.saveAndFlush(any(CourseEntity.class))).thenAnswer(inv -> {
            CourseEntity saved = inv.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(1L);
            }
            return saved;
        });
    }

    private Set<String> invalidFields(CourseRequestDTO dto) {
        return VALIDATOR.validate(dto).stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());
    }

    @Test
    @DisplayName("Validação do formulário: nome, departamento, nível e tipo obrigatórios; notas e e-mail com formato")
    void shouldValidateRequest() {
        assertTrue(invalidFields(valid()).isEmpty());

        assertEquals(Set.of("name"), invalidFields(request(10L, "   ", CourseLevel.GRADUACAO, CourseType.BACHARELADO)));
        assertEquals(Set.of("departmentId", "level", "type"), invalidFields(request(null, "Curso", null, null)));

        CourseRequestDTO wrong = new CourseRequestDTO(10L, "Curso", CourseLevel.POS, CourseType.STRICTO_SENSU, null, null,
                null, (short) 0, 0, (short) 6, (short) 8, null, null, null, null, null, null, null, null, null,
                "nao-e-email", "x".repeat(255), null);
        assertEquals(Set.of("durationSemesters", "totalWorkloadHours", "mecGrade", "capesGrade", "email", "secondaryEmail"),
                invalidFields(wrong));
    }

    @Test
    @DisplayName("Nível × tipo: graduação só bacharelado ou licenciatura, pós só stricto sensu (400)")
    void shouldRejectIncompatibleLevelAndType() {
        assertThrows(BadRequestException.class,
                () -> service.create(request(10L, "Curso", CourseLevel.GRADUACAO, CourseType.STRICTO_SENSU)));
        assertThrows(BadRequestException.class,
                () -> service.create(request(10L, "Curso", CourseLevel.POS, CourseType.BACHARELADO)));
        assertThrows(BadRequestException.class,
                () -> service.create(request(10L, "Curso", CourseLevel.POS, CourseType.LICENCIATURA)));
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(auditService);
    }

    @Test
    @DisplayName("Cadastro em departamento inexistente ou inativo é recusado (400)")
    void shouldRejectMissingOrInactiveDepartment() {
        when(departmentRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.empty());

        BadRequestException error = assertThrows(BadRequestException.class, () -> service.create(valid()));

        assertTrue(error.getMessage().contains("inexistente ou inativo"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Cadastro grava texto aparado, troca vazio por nulo, nasce ativo e registra no histórico")
    void shouldCreateCourseAndAudit() {
        when(departmentRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(department(10L, true)));
        saveGivesId();

        CourseDetailResponseDTO created = service.create(valid());

        assertEquals("Ciência da Computação", created.name());
        assertEquals("Presencial", created.modality());
        assertNull(created.code());
        assertNull(created.shift());
        assertNull(created.description());
        assertEquals("Profa. Coordenadora", created.coordination().coordinatorName());
        assertNull(created.coordination().viceCoordinatorName());
        assertNull(created.coordination().secondaryEmail());
        assertEquals((short) 3200, created.totalWorkloadHours());
        assertTrue(created.active());
        assertEquals(List.of(), created.subjects());

        ArgumentCaptor<Object> after = ArgumentCaptor.forClass(Object.class);
        verify(auditService).record(eq(AuditService.Entity.CURSO), eq("1"), eq("Ciência da Computação"),
                eq(AuditService.Action.CRIADO), isNull(), after.capture());
        // O snapshot leva a matriz (aqui, vazia).
        assertEquals(List.of(), ((CourseDetailResponseDTO) after.getValue()).subjects());
    }

    @Test
    @DisplayName("Edição mantém o departamento atual mesmo inativo, mas só troca para um ativo")
    void shouldUpdateKeepingOrChangingDepartment() {
        CourseEntity existing = course(1L, "Nome antigo", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, false)));
        saveGivesId();

        CourseDetailResponseDTO updated = service.update(1L, valid());

        assertEquals("Ciência da Computação", updated.name());
        // active nulo na edição mantém o estado atual.
        assertTrue(updated.active());
        verify(departmentRepository, never()).findByIdAndActiveTrue(any());
        verify(auditService).record(eq(AuditService.Entity.CURSO), eq("1"), eq("Ciência da Computação"),
                eq(AuditService.Action.EDITADO), notNull(), notNull());

        when(departmentRepository.findByIdAndActiveTrue(20L)).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class,
                () -> service.update(1L, request(20L, "Curso", CourseLevel.GRADUACAO, CourseType.LICENCIATURA)));
    }

    @Test
    @DisplayName("Editar ou excluir curso inexistente devolve 404")
    void shouldThrowWhenWritingMissingCourse() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(99L, valid()));
        assertThrows(ResourceNotFoundException.class, () -> service.delete(99L));
        verify(subjectRepository, never()).deleteByCourseId(any());
        verifyNoInteractions(auditService);
    }

    @Test
    @DisplayName("UC36: excluir apaga a matriz antes do curso e registra a exclusão no histórico")
    void shouldDeleteSubjectsBeforeCourseAndAudit() {
        CourseEntity existing = course(1L, "Agronomia", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, true)));

        service.delete(1L);

        InOrder order = inOrder(subjectRepository, repository, auditService);
        order.verify(subjectRepository).deleteByCourseId(1L);
        order.verify(repository).delete(existing);
        order.verify(auditService).record(eq(AuditService.Entity.CURSO), eq("1"), eq("Agronomia"),
                eq(AuditService.Action.DELETADO), notNull(), isNull());
    }

    @Test
    @DisplayName("Fase 5c: edição com `subjects` apaga a matriz antiga e grava a nova, com texto limpo")
    void shouldReplaceCurriculumWhenSubjectsAreSent() {
        CourseEntity existing = course(1L, "Agronomia", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, true)));
        saveGivesId();

        service.update(1L, withSubjects(List.of(
                subjectRequest((short) 1, " AGR101 ", List.of()),
                subjectRequest(null, "AGR900", List.of(" AGR101 ", "AGR102")))));

        InOrder order = inOrder(subjectRepository);
        order.verify(subjectRepository).deleteByCourseId(1L);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<SubjectEntity>> saved = ArgumentCaptor.forClass(List.class);
        order.verify(subjectRepository).saveAll(saved.capture());
        List<SubjectEntity> rows = saved.getValue();
        assertEquals(2, rows.size());
        assertEquals(1L, rows.get(0).getCourseId());
        assertEquals("AGR101", rows.get(0).getCode());
        assertEquals("Disciplina AGR101", rows.get(0).getName());
        assertNull(rows.get(0).getSyllabus());
        assertNull(rows.get(0).getPrerequisites());
        assertNull(rows.get(1).getPeriod());
        assertEquals("AGR101,AGR102", rows.get(1).getPrerequisites());
    }

    @Test
    @DisplayName("Fase 5c: edição sem `subjects` não toca na matriz")
    void shouldKeepCurriculumWhenSubjectsAreNull() {
        CourseEntity existing = course(1L, "Agronomia", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, true)));
        saveGivesId();

        service.update(1L, valid());

        verify(subjectRepository, never()).deleteByCourseId(any());
        verify(subjectRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Fase 5c: lista vazia limpa a matriz")
    void shouldClearCurriculumWhenSubjectsAreEmpty() {
        CourseEntity existing = course(1L, "Agronomia", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, true)));
        saveGivesId();

        service.update(1L, withSubjects(List.of()));

        verify(subjectRepository).deleteByCourseId(1L);
    }

    @Test
    @DisplayName("Fase 5c: código repetido na matriz (sem diferenciar caixa) ou vírgula em pré-requisito dão 400 e nada é gravado")
    void shouldRejectInvalidCurriculum() {
        when(departmentRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(department(10L, true)));

        BadRequestException duplicate = assertThrows(BadRequestException.class, () -> service.create(withSubjects(List.of(
                subjectRequest((short) 1, "AGR101", List.of()), subjectRequest((short) 2, " agr101 ", List.of())))));
        assertTrue(duplicate.getMessage().contains("repetido"));

        BadRequestException comma = assertThrows(BadRequestException.class, () -> service.create(withSubjects(List.of(
                subjectRequest((short) 1, "AGR101", List.of("A,B"))))));
        assertTrue(comma.getMessage().contains("vírgula"));

        verify(repository, never()).saveAndFlush(any());
        verify(subjectRepository, never()).saveAll(any());
        verifyNoInteractions(auditService);
    }

    @Test
    @DisplayName("Fase 5c: validação das disciplinas aponta o campo dentro da lista")
    void shouldValidateSubjects() {
        SubjectRequestDTO bad = new SubjectRequestDTO((short) 13, " ", " ", null, (short) 0, (short) -1, null,
                List.of(" "));
        Set<String> invalid = invalidFields(withSubjects(List.of(bad)));
        assertTrue(invalid.containsAll(Set.of("subjects[0].period", "subjects[0].code", "subjects[0].name",
                "subjects[0].workloadHours", "subjects[0].credits", "subjects[0].nature")), invalid.toString());
        assertTrue(invalid.stream().anyMatch(path -> path.startsWith("subjects[0].prerequisites")), invalid.toString());
        assertTrue(invalidFields(withSubjects(List.of(subjectRequest((short) 1, "AGR101", List.of("AGR100"))))).isEmpty());
    }

    @Test
    @DisplayName("Fase 5c: o histórico guarda a matriz antes e depois da edição")
    void shouldAuditCurriculumBeforeAndAfter() {
        CourseEntity existing = course(1L, "Agronomia", CourseLevel.GRADUACAO, CourseType.BACHARELADO, null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department(10L, true)));
        saveGivesId();
        when(subjectRepository.findByCourseId(1L))
                .thenReturn(List.of(subject(7L, (short) 1, "OLD101", null)))
                .thenReturn(List.of(subject(8L, (short) 1, "NEW101", null)));

        service.update(1L, withSubjects(List.of(subjectRequest((short) 1, "NEW101", List.of()))));

        ArgumentCaptor<Object> before = ArgumentCaptor.forClass(Object.class);
        ArgumentCaptor<Object> after = ArgumentCaptor.forClass(Object.class);
        verify(auditService).record(eq(AuditService.Entity.CURSO), eq("1"), any(), eq(AuditService.Action.EDITADO),
                before.capture(), after.capture());
        assertEquals("OLD101", ((CourseDetailResponseDTO) before.getValue()).subjects().get(0).code());
        assertEquals("NEW101", ((CourseDetailResponseDTO) after.getValue()).subjects().get(0).code());
    }

    @Test
    @DisplayName("O painel vê também os cursos inativos")
    void adminSeesInactiveCourses() {
        CourseEntity inactive = course(2L, "Curso desativado", CourseLevel.GRADUACAO, CourseType.LICENCIATURA, null);
        inactive.setActive(false);
        when(repository.findAll()).thenReturn(List.of(inactive));

        List<CourseSummaryDTO> all = service.findAllForAdmin();

        assertEquals(1, all.size());
        assertFalse(all.get(0).active());
    }
}
