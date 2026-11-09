package br.com.guiarural.backend.info;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
                "linksPt", "[]",
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
        assertEquals("[]", result.links().toString());
    }

    @Test
    @DisplayName("Deve lançar 404 quando o tópico não existe")
    void shouldThrowWhenTopicNotFound() {
        when(repository.findBySlug("nao-existe")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service().findBySlug("nao-existe", Language.PT));
    }
}
