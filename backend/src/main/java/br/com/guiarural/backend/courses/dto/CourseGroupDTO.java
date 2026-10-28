package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.CourseLevel;

import java.util.List;

public record CourseGroupDTO (
    CourseLevel level,
    List<CourseSummaryDTO> courses
) {}
