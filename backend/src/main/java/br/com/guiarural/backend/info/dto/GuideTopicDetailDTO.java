package br.com.guiarural.backend.info.dto;

import tools.jackson.databind.JsonNode;

// blocks e links são JSON já no idioma pedido: lista de blocos tipados (p, list, steps, callout...) e de {label, url}.
public record GuideTopicDetailDTO(
        String slug,
        String section,
        String stage,
        String title,
        String summary,
        JsonNode blocks,
        JsonNode links,
        String source,
        String placeSlug
) {
}
