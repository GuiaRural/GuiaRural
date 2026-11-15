package br.com.guiarural.backend.info.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

// Corpo de criar/editar um tópico: a mesma forma de GuideTopicTranslationsDTO (o painel lê e devolve o mesmo
// formato, e o histórico guarda esse formato como snapshot para desfazer). slug é opcional ao criar.
public record GuideTopicWriteDTO(
        String slug,
        @NotNull String section,
        String stage,
        @NotNull LocalizedTextDTO title,
        @NotNull LocalizedTextDTO summary,
        @NotNull LocalizedJsonDTO blocks,
        @NotNull LocalizedJsonDTO links,
        LocalizedTextDTO source,
        String placeSlug,
        List<String> fullyTranslatedLangs
) {
}
