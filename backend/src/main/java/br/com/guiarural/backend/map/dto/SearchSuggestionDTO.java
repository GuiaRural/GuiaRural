package br.com.guiarural.backend.map.dto;

public record SearchSuggestionDTO (
    SearchType type,
    Long id,
    // só para locais: identificador usado em /locais/<slug> e no mapa.
    String slug,
    String name,
    // local: categoria; curso: nome do departamento; departamento: null.
    String detail
) {}
