package br.com.guiarural.backend.courses.dto;

// Painel "Coordenações de Curso" da página do departamento (FA-37.01).
public record CoordinationDTO (
    Long courseId,
    String courseName,
    String coordinatorName,
    String extension,
    String email
) {}
