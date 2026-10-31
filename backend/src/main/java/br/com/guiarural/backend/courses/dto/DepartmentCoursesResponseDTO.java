package br.com.guiarural.backend.courses.dto;

import java.util.List;

public record DepartmentCoursesResponseDTO (
    Long departmentId,
    // RN-UC37-02: número de cursos ativos vinculados ao departamento.
    int programsOffered,
    List<CourseGroupDTO> groups,
    List<CoordinationDTO> coordinations
) {}
