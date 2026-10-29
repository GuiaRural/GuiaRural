package br.com.guiarural.backend.courses.dto;

public record DepartmentResponseDTO (
    Long id,
    String code,
    String name,
    String shortName,
    String academicCenter,
    String description,
    String address,
    String hours,
    String phone,
    String email,
    Short foundedYear
) {}
