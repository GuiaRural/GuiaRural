package br.com.guiarural.backend.info.dto;

import java.util.List;

// Tópico com os três idiomas lado a lado, para o painel administrativo editar as traduções.
// fullyTranslatedLangs: idiomas (en, es) em que todo o texto está traduzido; nos demais, o que falta já veio
// preenchido com o português dentro de blocks e links.
public record GuideTopicTranslationsDTO(
        String slug,
        String section,
        String stage,
        LocalizedTextDTO title,
        LocalizedTextDTO summary,
        LocalizedJsonDTO blocks,
        LocalizedJsonDTO links,
        LocalizedTextDTO source,
        String placeSlug,
        List<String> fullyTranslatedLangs
) {
}
