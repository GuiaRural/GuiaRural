package br.com.guiarural.backend.courses;

import br.com.guiarural.backend.core.exception.GlobalExceptionHandler;
import br.com.guiarural.backend.courses.controller.CourseController;
import br.com.guiarural.backend.courses.controller.DepartmentController;
import br.com.guiarural.backend.courses.dto.CourseGroupDTO;
import br.com.guiarural.backend.courses.dto.CourseSummaryDTO;
import br.com.guiarural.backend.courses.dto.DepartmentCoursesResponseDTO;
import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;
import br.com.guiarural.backend.courses.service.CourseService;
import br.com.guiarural.backend.courses.service.DepartmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {
    @Mock
    private DepartmentService departmentService;

    @Mock
    private CourseService courseService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new DepartmentController(departmentService), new CourseController(courseService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Deve devolver os cursos agrupados e a contagem de programas")
    void shouldReturnDepartmentCourses() throws Exception {
        CourseSummaryDTO course = new CourseSummaryDTO(1L, 10L, "104", "Ciência da Computação",
                CourseLevel.GRADUACAO, CourseType.BACHARELADO, "Presencial", "Diurno",
                (short) 8, (short) 5, null, null, "Sala 204", true);
        when(departmentService.findCourses(10L)).thenReturn(new DepartmentCoursesResponseDTO(
                10L, 1, List.of(new CourseGroupDTO(CourseLevel.GRADUACAO, List.of(course))), List.of()));

        mockMvc.perform(get("/api/departments/10/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.programsOffered").value(1))
                .andExpect(jsonPath("$.groups[0].level").value("GRADUACAO"))
                .andExpect(jsonPath("$.groups[0].courses[0].name").value("Ciência da Computação"));
    }

    @Test
    @DisplayName("Deve responder 404 quando o departamento não existe")
    void shouldReturnNotFoundForUnknownDepartment() throws Exception {
        when(departmentService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Departamento não encontrado com ID: 99"));

        mockMvc.perform(get("/api/departments/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Departamento não encontrado com ID: 99"));
    }

    @Test
    @DisplayName("Deve responder 404 quando o curso não existe")
    void shouldReturnNotFoundForUnknownCourse() throws Exception {
        when(courseService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Curso não encontrado com ID: 99"));

        mockMvc.perform(get("/api/courses/99"))
                .andExpect(status().isNotFound());
    }
}
