package br.com.guiarural.backend.info.dto;

// Item da lista de uma seção: só o necessário para montar o índice, sem o conteúdo.
public record GuideTopicSummaryDTO(
        String slug,
        String section,
        String stage,
        String title,
        String summary,
        String placeSlug
) {
}
