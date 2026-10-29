package br.com.guiarural.backend.map.dto;

public record PlaceResponseDTO (
    Long id,
    String slug,
    String name,
    String shortName,
    String category,
    Double latitude,
    Double longitude,
    String address,
    String hours,
    String description,
    String phone,
    String email
) {}
