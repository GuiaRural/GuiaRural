package br.com.guiarural.backend.courses;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.courses.dto.CourseDetailResponseDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
    @Mock
    private CourseRepository repository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

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
}
