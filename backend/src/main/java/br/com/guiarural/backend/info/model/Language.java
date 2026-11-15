package br.com.guiarural.backend.info.model;

import java.util.Arrays;
import java.util.Locale;

public enum Language {
    PT, EN, ES;

    // Idioma não suportado (ex.: fr) ou ausente cai no português, como o resto do aplicativo.
    public static Language from(String value) {
        if (value == null || value.isBlank()) {
            return PT;
        }
        String code = value.trim().toLowerCase(Locale.ROOT);
        if (code.length() > 2) {
            code = code.substring(0, 2); // "en-US" -> "en"
        }
        return switch (code) {
            case "en" -> EN;
            case "es" -> ES;
            default -> PT;
        };
    }

    public String code() {
        return name().toLowerCase(Locale.ROOT);
    }

    // O idioma de fato usado para um texto: o pedido, ou o português quando falta a tradução.
    public Language effective(String en, String es) {
        String text = switch (this) {
            case EN -> en;
            case ES -> es;
            case PT -> "x";
        };
        return text == null || text.isBlank() ? PT : this;
    }

    // O português é sempre completo; os outros idiomas dependem da lista gravada no tópico.
    public boolean isFullyTranslatedIn(String[] fullyTranslatedLangs) {
        return this == PT || (fullyTranslatedLangs != null && Arrays.asList(fullyTranslatedLangs).contains(code()));
    }

    // Texto no idioma pedido; quando falta a tradução (nula ou vazia), devolve o português.
    public <T> T pick(T pt, T en, T es) {
        T chosen = switch (this) {
            case EN -> en;
            case ES -> es;
            case PT -> pt;
        };
        if (chosen == null || (chosen instanceof String text && text.isBlank())) {
            return pt;
        }
        return chosen;
    }
}
