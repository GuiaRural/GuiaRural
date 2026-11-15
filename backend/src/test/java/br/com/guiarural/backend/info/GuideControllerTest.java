package br.com.guiarural.backend.info;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.GlobalExceptionHandler;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.controller.GuideController;
import br.com.guiarural.backend.info.dto.GuideResourcesDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.dto.GuideTopicTranslationsDTO;
import br.com.guiarural.backend.info.dto.LocalizedJsonDTO;
import br.com.guiarural.backend.info.dto.LocalizedTextDTO;
import br.com.guiarural.backend.info.dto.RecifeGuideDTO;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.service.GuideResourceService;
import br.com.guiarural.backend.info.service.GuideTopicService;
import br.com.guiarural.backend.info.service.GuideTopicWriteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GuideControllerTest {
    @Mock
    private GuideTopicService topicService;

    @Mock
    private GuideResourceService resourceService;

    @Mock
    private GuideTopicWriteService writeService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new GuideController(topicService, resourceService, writeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Deve listar os tópicos da seção no idioma do parâmetro lang")
    void shouldListTopicsWithLanguage() throws Exception {
        when(topicService.findBySection("cultura", Language.EN)).thenReturn(List.of(
                new GuideTopicSummaryDTO("boas-vindas", "cultura", null, "Welcome", "Summary", null, true)));

        mockMvc.perform(get("/api/guide/topics").param("section", "cultura").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("boas-vindas"))
                .andExpect(jsonPath("$[0].title").value("Welcome"));
    }

    @Test
    @DisplayName("Deve usar o português quando lang não é informado ou não é suportado")
    void shouldDefaultToPortuguese() throws Exception {
        when(resourceService.findRecifeGuide(Language.PT)).thenReturn(new RecifeGuideDTO(List.of(), List.of(), null));

        mockMvc.perform(get("/api/guide/recife")).andExpect(status().isOk());
        mockMvc.perform(get("/api/guide/recife").param("lang", "fr")).andExpect(status().isOk());

        verify(resourceService, org.mockito.Mockito.times(2)).findRecifeGuide(Language.PT);
    }

    @Test
    @DisplayName("Deve responder 400 quando a seção é inválida")
    void shouldReturn400ForInvalidSection() throws Exception {
        when(topicService.findBySection("xx", Language.PT)).thenThrow(new BadRequestException("Seção inválida: xx"));

        mockMvc.perform(get("/api/guide/topics").param("section", "xx"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Seção inválida: xx"));
    }

    @Test
    @DisplayName("Deve responder 404 quando o tópico não existe")
    void shouldReturn404WhenTopicNotFound() throws Exception {
        when(topicService.findBySlug("nao-existe", Language.PT))
                .thenThrow(new ResourceNotFoundException("Tópico não encontrado: nao-existe"));

        mockMvc.perform(get("/api/guide/topics/nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Tópico não encontrado: nao-existe"));
    }

    @Test
    @DisplayName("Deve devolver contatos, emergência e downloads numa única resposta")
    void shouldReturnResources() throws Exception {
        when(resourceService.findResources(Language.ES))
                .thenReturn(new GuideResourcesDTO(List.of(), List.of(), List.of()));

        mockMvc.perform(get("/api/guide/resources").param("lang", "es"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.support").isArray())
                .andExpect(jsonPath("$.emergency").isArray())
                .andExpect(jsonPath("$.downloads").isArray());
    }

    @Test
    @DisplayName("Deve buscar tópicos pelo termo e pelo idioma")
    void shouldSearchTopics() throws Exception {
        when(topicService.search("visto", Language.EN)).thenReturn(List.of(
                new GuideTopicSummaryDTO("visto", "documentos", "antes", "Visa", "Summary", null, false)));

        mockMvc.perform(get("/api/guide/search").param("q", "visto").param("lang", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("visto"))
                .andExpect(jsonPath("$[0].fullyTranslated").value(false));
    }

    @Test
    @DisplayName("Deve devolver as traduções do tópico nos três idiomas")
    void shouldReturnTopicTranslations() throws Exception {
        when(topicService.findTranslationsBySlug("cpf")).thenReturn(new GuideTopicTranslationsDTO(
                "cpf", "documentos", "chegada",
                new LocalizedTextDTO("CPF", "Tax ID", null),
                new LocalizedTextDTO("Resumo", null, null),
                new LocalizedJsonDTO(null, null, null),
                new LocalizedJsonDTO(null, null, null),
                new LocalizedTextDTO("Cartilha", null, null),
                null, List.of("en")));

        mockMvc.perform(get("/api/guide/translations/topics/cpf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title.pt").value("CPF"))
                .andExpect(jsonPath("$.title.en").value("Tax ID"))
                .andExpect(jsonPath("$.fullyTranslatedLangs[0]").value("en"));
    }
}
