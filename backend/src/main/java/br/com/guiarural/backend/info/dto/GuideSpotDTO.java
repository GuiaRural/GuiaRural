package br.com.guiarural.backend.info.dto;

import tools.jackson.databind.JsonNode;

public record GuideSpotDTO(
        String slug,
        String title,
        String address,
        String description,
        // Slug da categoria do filtro; nulo = sem categoria.
        String category,
        ToneLabelDTO tag,
        ToneLabelDTO badge,
        DistanceDTO distance,
        ImageDTO image,
        String detailsLayout,
        JsonNode details
) {
}
