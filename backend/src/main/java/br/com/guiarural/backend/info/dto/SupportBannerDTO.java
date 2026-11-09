package br.com.guiarural.backend.info.dto;

// A frase é before + highlight (em negrito) + after; os espaços nas bordas de before/after fazem parte do texto.
public record SupportBannerDTO(String before, String highlight, String after, LinkDTO cta) {
}
