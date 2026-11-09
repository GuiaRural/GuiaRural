package br.com.guiarural.backend.info;

import br.com.guiarural.backend.info.model.Language;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
