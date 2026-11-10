package br.com.guiarural.backend.services.dto;

// Local publicado onde um serviço é prestado (decisão D11). O slug leva à página do local no mapa.
public record ServicePlaceDTO(String slug, String name) {
}
