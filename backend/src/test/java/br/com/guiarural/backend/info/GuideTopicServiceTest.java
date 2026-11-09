package br.com.guiarural.backend.info;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.dto.GuideTopicTranslationsDTO;
import br.com.guiarural.backend.info.model.GuideTopicEntity;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.repository.GuideTopicRepository;
import br.com.guiarural.backend.info.service.GuideTopicService;
import br.com.guiarural.backend.map.model.PlaceEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Optional;

import static br.com.guiarural.backend.info.GuideTestData.entity;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuideTopicServiceTest {
    @Mock
    private GuideTopicRepository repository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    private GuideTopicService service() {
        return new GuideTopicService(repository, jsonMapper);
    }

    private GuideTopicEntity topic(String titleEn, PlaceEntity place) {
        return entity(GuideTopicEntity.class,
                "slug", "boas-vindas",
                "section", "cultura",
                "titlePt", "Bem-vindo(a)",
                "titleEn", titleEn,
                "summaryPt", "Resumo em português",
                "blocksPt", "[{\"type\":\"p\",\"text\":\"Olá\"}]",
                "blocksEn", "[{\"type\":\"p\",\"text\":\"Hello\"}]",
                "linksPt", "[{\"label\":\"Portal\",\"url\":\"https://x.test\"}]",
                "fullyTranslatedLangs", new String[]{"en"},
                "place", place);
    }

    @Test
    @DisplayName("Deve listar os tópicos da seção no idioma pedido")
    void shouldListTopicsInRequestedLanguage() {
        when(repository.findBySectionOrderByPositionAsc("cultura")).thenReturn(List.of(topic("Welcome", null)));

        List<GuideTopicSummaryDTO> result = service().findBySection("cultura", Language.EN);

        assertEquals(1, result.size());
        assertEquals("Welcome", result.get(0).title());
        // Sem resumo em inglês, usa o português.
        assertEquals("Resumo em português", result.get(0).summary());
    }

    @Test
    @DisplayName("Deve cair no título em português quando falta a tradução")
    void shouldFallBackToPortugueseTitle() {
        when(repository.findBySectionOrderByPositionAsc("cultura")).thenReturn(List.of(topic(null, null)));

        assertEquals("Bem-vindo(a)", service().findBySection("cultura", Language.EN).get(0).title());
    }

    @Test
    @DisplayName("Deve rejeitar uma seção que não existe, sem consultar o banco")
    void shouldRejectUnknownSection() {
        assertThrows(BadRequestException.class, () -> service().findBySection("invalida", Language.PT));
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("Deve devolver o slug do local vinculado, ou nulo quando não há")
    void shouldExposeLinkedPlaceSlug() {
        PlaceEntity place = new PlaceEntity();
        place.setSlug("reitoria");
        when(repository.findBySlug("com-local")).thenReturn(Optional.of(topic("Welcome", place)));
        when(repository.findBySlug("sem-local")).thenReturn(Optional.of(topic("Welcome", null)));

        assertEquals("reitoria", service().findBySlug("com-local", Language.PT).placeSlug());
        assertNull(service().findBySlug("sem-local", Language.PT).placeSlug());
    }

    @Test
    @DisplayName("Deve devolver os blocos como JSON já no idioma pedido")
    void shouldReturnBlocksAsJsonInRequestedLanguage() {
        when(repository.findBySlug("boas-vindas")).thenReturn(Optional.of(topic("Welcome", null)));

        GuideTopicDetailDTO result = service().findBySlug("boas-vindas", Language.EN);

        assertEquals("[{\"type\":\"p\",\"text\":\"Hello\"}]", result.blocks().toString());
        // Links só existem em português: o inglês herda os mesmos.
        assertEquals("[{\"label\":\"Portal\",\"url\":\"https://x.test\"}]", result.links().toString());
    }

    @Test
    @DisplayName("Deve lançar 404 quando o tópico não existe")
    void shouldThrowWhenTopicNotFound() {
        when(repository.findBySlug("nao-existe")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service().findBySlug("nao-existe", Language.PT));
    }

    @Test
    @DisplayName("Deve marcar como totalmente traduzido só os idiomas gravados no tópico")
    void shouldFlagFullyTranslatedLanguages() {
        when(repository.findBySectionOrderByPositionAsc("cultura")).thenReturn(List.of(topic("Welcome", null)));

        assertTrue(service().findBySection("cultura", Language.PT).get(0).fullyTranslated());
        assertTrue(service().findBySection("cultura", Language.EN).get(0).fullyTranslated());
        // O tópico só lista "en": em espanhol houve fallback para o português.
        assertFalse(service().findBySection("cultura", Language.ES).get(0).fullyTranslated());
    }

    @Test
    @DisplayName("Deve informar o idioma em que o título de fato veio")
    void shouldReportTitleLanguage() {
        when(repository.findBySlug("com-titulo")).thenReturn(Optional.of(topic("Welcome", null)));
        when(repository.findBySlug("sem-titulo")).thenReturn(Optional.of(topic(null, null)));

        assertEquals("en", service().findBySlug("com-titulo", Language.EN).titleLang());
        assertEquals("pt", service().findBySlug("sem-titulo", Language.EN).titleLang());
        assertEquals("pt", service().findBySlug("com-titulo", Language.PT).titleLang());
    }

    @Test
    @DisplayName("Deve buscar sem acento e sem diferenciar maiúsculas, nos textos dos blocos")
    void shouldSearchIgnoringAccentsAndCase() {
        when(repository.findAllBy()).thenReturn(List.of(topic("Welcome", null)));

        assertEquals(1, service().search("OLA", Language.PT).size());
        assertEquals("Welcome", service().search("hello", Language.EN).get(0).title());
    }

    @Test
    @DisplayName("Deve buscar também no português quando o idioma ativo é outro")
    void shouldSearchPortugueseTextInOtherLanguage() {
        when(repository.findAllBy()).thenReturn(List.of(topic("Welcome", null)));

        assertEquals(1, service().search("Resumo em portugues", Language.EN).size());
    }

    @Test
    @DisplayName("Não deve casar com campos técnicos dos blocos nem com URLs")
    void shouldNotMatchTechnicalFields() {
        when(repository.findAllBy()).thenReturn(List.of(topic("Welcome", null)));

        // "type" e "https" existem só como chave/URL no JSON.
        assertTrue(service().search("type", Language.PT).isEmpty());
        assertTrue(service().search("https", Language.PT).isEmpty());
    }

    @Test
    @DisplayName("Deve devolver lista vazia, sem consultar o banco, para busca curta")
    void shouldReturnEmptyForShortQuery() {
        assertTrue(service().search("a", Language.PT).isEmpty());
        assertTrue(service().search("  ", Language.PT).isEmpty());
        assertTrue(service().search(null, Language.PT).isEmpty());
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("Deve devolver os três idiomas lado a lado, com nulo onde não há tradução")
    void shouldReturnTranslationsSideBySide() {
        when(repository.findBySlug("boas-vindas")).thenReturn(Optional.of(topic("Welcome", null)));

        GuideTopicTranslationsDTO result = service().findTranslationsBySlug("boas-vindas");

        assertEquals("Bem-vindo(a)", result.title().pt());
        assertEquals("Welcome", result.title().en());
        assertNull(result.title().es());
        assertEquals("[{\"type\":\"p\",\"text\":\"Olá\"}]", result.blocks().pt().toString());
        assertEquals("[{\"type\":\"p\",\"text\":\"Hello\"}]", result.blocks().en().toString());
        assertNull(result.blocks().es());
        assertEquals(List.of("en"), result.fullyTranslatedLangs());
    }
}
