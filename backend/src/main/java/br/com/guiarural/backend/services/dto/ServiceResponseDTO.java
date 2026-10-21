package br.com.guiarural.backend.services.dto;

public record ServiceResponseDTO (
    Long id,
    String name,
    String description,
    String locationReference,
    Boolean active
) {}
