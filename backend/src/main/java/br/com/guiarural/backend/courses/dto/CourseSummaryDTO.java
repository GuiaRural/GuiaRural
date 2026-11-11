package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;

public record CourseSummaryDTO (
    Long id,
    Long departmentId,
    String code,
    String name,
    CourseLevel level,
    CourseType type,
    String modality,
    String shift,
    Short durationSemesters,
    Short mecGrade,
    Short capesGrade,
    String description,
    String officeLocation,
    // Sempre true nas rotas públicas (só listam cursos ativos); o painel também vê os inativos.
    boolean active
) {}
