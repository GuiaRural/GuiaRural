package br.com.guiarural.backend.map.dto;

// Serviço do catálogo ou curso ligado a um local: o id serve ao formulário do painel; o nome, às páginas públicas.
public record PlaceLinkDTO(Long id, String name) {
}
