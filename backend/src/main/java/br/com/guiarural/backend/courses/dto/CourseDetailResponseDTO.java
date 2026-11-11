package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;

import java.util.List;

public record CourseDetailResponseDTO (
    Long id,
    String code,
    String name,
    CourseLevel level,
    CourseType type,
    String modality,
    String shift,
    Short durationSemesters,
    Short totalWorkloadHours,
    Short mecGrade,
    Short capesGrade,
    String description,
    Long departmentId,
    String departmentName,
    String departmentShortName,
    String academicCenter,
    CourseCoordinationDTO coordination,
    // Nulo no snapshot do histórico, que ainda não guarda a matriz (Fase 5c).
    List<SubjectResponseDTO> subjects,
    // Sempre true na rota pública; o painel também vê os inativos.
    boolean active
) {}
