package br.com.guiarural.backend.info;

import br.com.guiarural.backend.info.model.Language;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LanguageTest {
    @Test
    @DisplayName("Deve reconhecer pt, en e es, com região e maiúsculas")
    void shouldParseSupportedLanguages() {
        assertEquals(Language.PT, Language.from("pt"));
        assertEquals(Language.EN, Language.from("en"));
        assertEquals(Language.ES, Language.from("ES"));
        assertEquals(Language.EN, Language.from("en-US"));
        assertEquals(Language.PT, Language.from("pt-BR"));
    }

    @Test
    @DisplayName("Deve cair no português quando o idioma é ausente ou não suportado")
    void shouldFallBackToPortuguese() {
        assertEquals(Language.PT, Language.from(null));
        assertEquals(Language.PT, Language.from(" "));
        assertEquals(Language.PT, Language.from("fr"));
    }

    @Test
    @DisplayName("Deve devolver a tradução e cair no português quando ela falta")
    void shouldPickTranslationOrFallBack() {
        assertEquals("Olá", Language.PT.pick("Olá", "Hello", "Hola"));
        assertEquals("Hello", Language.EN.pick("Olá", "Hello", "Hola"));
        assertEquals("Olá", Language.EN.pick("Olá", null, "Hola"));
        assertEquals("Olá", Language.ES.pick("Olá", "Hello", "  "));
    }

    @Test
    @DisplayName("Deve informar o idioma efetivamente usado em um texto")
    void shouldReportEffectiveLanguage() {
        assertEquals(Language.EN, Language.EN.effective("Hello", null));
        assertEquals(Language.PT, Language.EN.effective(null, "Hola"));
        assertEquals(Language.PT, Language.ES.effective("Hello", " "));
        assertEquals(Language.PT, Language.PT.effective("Hello", "Hola"));
        assertEquals("es", Language.ES.code());
    }

    @Test
    @DisplayName("Deve considerar o português sempre completo e os demais pela lista gravada")
    void shouldCheckFullyTranslatedLanguages() {
        assertTrue(Language.PT.isFullyTranslatedIn(null));
        assertTrue(Language.EN.isFullyTranslatedIn(new String[]{"en"}));
        assertFalse(Language.ES.isFullyTranslatedIn(new String[]{"en"}));
        assertFalse(Language.EN.isFullyTranslatedIn(null));
    }
}
