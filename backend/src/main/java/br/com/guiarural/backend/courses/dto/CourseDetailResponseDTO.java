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
    List<SubjectResponseDTO> subjects,
    // Sempre true na rota pública; o painel também vê os inativos.
    boolean active,
    // Idioma em que name veio (pt quando faltou a tradução), para o atributo lang da página.
    String lang,
    // true quando o texto veio de uma tradução automática que ainda espera revisão humana.
    boolean machineTranslated,
    // Idiomas (en, es) em que o curso tem tradução do nome. O painel usa para avisar que o texto pode defasar.
    List<String> translatedLangs
) {}
