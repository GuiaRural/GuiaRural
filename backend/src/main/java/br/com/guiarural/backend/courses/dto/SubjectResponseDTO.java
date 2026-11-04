package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.SubjectNature;

import java.util.List;

public record SubjectResponseDTO (
    Long id,
    // null = bloco "Optativas / Eletivas".
    Short period,
    String code,
    String name,
    String syllabus,
    Short workloadHours,
    Short credits,
    SubjectNature nature,
    List<String> prerequisites
) {}
