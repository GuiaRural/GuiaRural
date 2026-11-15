package br.com.guiarural.backend.info.service;

import br.com.guiarural.backend.core.audit.AuditLogEntity;
import br.com.guiarural.backend.core.audit.AuditService;
import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ConflictException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.dto.GuideTopicTranslationsDTO;
import br.com.guiarural.backend.info.dto.GuideTopicWriteDTO;
import br.com.guiarural.backend.info.dto.LocalizedJsonDTO;
import br.com.guiarural.backend.info.dto.LocalizedTextDTO;
import br.com.guiarural.backend.info.model.GuideTopicContent;
import br.com.guiarural.backend.info.model.GuideTopicEntity;
import br.com.guiarural.backend.info.repository.GuideTopicRepository;
import br.com.guiarural.backend.map.model.PlaceEntity;
import br.com.guiarural.backend.map.repository.PlaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuideTopicWriteServiceTest {
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Mock
    private GuideTopicRepository repository;
    @Mock
    private PlaceRepository placeRepository;
    @Mock
    private AuditService auditService;

    private GuideTopicWriteService service;

    @BeforeEach
    void setUp() {
        // O GuideTopicService real monta os snapshots; só o banco é simulado.
        service = new GuideTopicWriteService(repository, placeRepository, new GuideTopicService(repository, jsonMapper),
                auditService, jsonMapper);
    }

    private JsonNode json(String text) {
        return jsonMapper.readTree(text);
    }

    private GuideTopicWriteDTO dto(String slug, String section, String stage, String titlePt, String placeSlug) {
        return new GuideTopicWriteDTO(slug, section, stage,
                new LocalizedTextDTO(titlePt, "English title", null),
                new LocalizedTextDTO("Resumo", null, null),
                new LocalizedJsonDTO(json("[{\"type\":\"p\",\"text\":\"Olá\"}]"), json("[{\"type\":\"p\",\"text\":\"Hello\"}]"), null),
                new LocalizedJsonDTO(json("[]"), null, null),
                new LocalizedTextDTO("Cartilha", null, null),
                placeSlug, List.of("en"));
    }

    private GuideTopicEntity existing(String slug) {
        GuideTopicEntity topic = GuideTopicEntity.create(slug, 0);
        topic.apply(new GuideTopicContent("cultura", null, "Título", null, null, "Resumo", null, null,
                "[]", null, null, "[]", null, null, null, null, null, new String[0]), null);
        return topic;
    }

    private void saveReturnsArgument() {
        when(repository.saveAndFlush(any(GuideTopicEntity.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    @DisplayName("Deve criar o tópico com endereço gerado do título, posição ao final e auditoria")
    void shouldCreateTopic() {
        when(repository.existsBySlug("conheca-o-campus")).thenReturn(false);
        when(repository.findMaxPosition("cultura")).thenReturn(5);
        saveReturnsArgument();

        GuideTopicTranslationsDTO result = service.create(dto(null, "cultura", null, "Conheça o Campus!", null));

        assertEquals("conheca-o-campus", result.slug());
        assertEquals("Conheça o Campus!", result.title().pt());
        assertEquals("English title", result.title().en());
        assertEquals(List.of("en"), result.fullyTranslatedLangs());
        ArgumentCaptor<GuideTopicEntity> saved = ArgumentCaptor.forClass(GuideTopicEntity.class);
        verify(repository).saveAndFlush(saved.capture());
        assertEquals(6, saved.getValue().getPosition());
        verify(auditService).record(eq(AuditService.Entity.ACOLHIMENTO), eq("conheca-o-campus"), eq("Conheça o Campus!"),
                eq(AuditService.Action.CRIADO), isNull(), any(GuideTopicTranslationsDTO.class));
    }

    @Test
    @DisplayName("Deve acrescentar número ao endereço quando o título gera um que já existe")
    void shouldDeduplicateGeneratedSlug() {
        when(repository.existsBySlug("cpf")).thenReturn(true);
        when(repository.existsBySlug("cpf-2")).thenReturn(false);
        when(repository.findMaxPosition("documentos")).thenReturn(0);
        saveReturnsArgument();

        assertEquals("cpf-2", service.create(dto(null, "documentos", "chegada", "CPF", null)).slug());
    }

    @Test
    @DisplayName("Deve recusar um endereço explícito que já existe")
    void shouldRejectDuplicateExplicitSlug() {
        when(repository.existsBySlug("cpf")).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(dto("cpf", "documentos", null, "CPF", null)));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Deve validar seção, etapa, endereço e título em português")
    void shouldValidateFields() {
        assertThrows(BadRequestException.class, () -> service.create(dto(null, "inexistente", null, "T", null)));
        assertThrows(BadRequestException.class, () -> service.create(dto(null, "cultura", "etapa-x", "T", null)));
        assertThrows(BadRequestException.class, () -> service.create(dto("Endereço Inválido!", "cultura", null, "T", null)));
        assertThrows(BadRequestException.class, () -> service.create(dto(null, "cultura", null, "  ", null)));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("Deve exigir que as traduções tenham os mesmos blocos do português")
    void shouldRequireSameBlockCountInTranslations() {
        GuideTopicWriteDTO bad = new GuideTopicWriteDTO(null, "cultura", null,
                new LocalizedTextDTO("T", null, null), new LocalizedTextDTO("R", null, null),
                new LocalizedJsonDTO(json("[{\"type\":\"p\",\"text\":\"a\"}]"), json("[]"), null),
                new LocalizedJsonDTO(json("[]"), null, null), null, null, List.of());

        assertThrows(BadRequestException.class, () -> service.create(bad));
    }

    @Test
    @DisplayName("Deve recusar blocos que não são uma lista e idiomas de tradução inválidos")
    void shouldRejectMalformedContent() {
        GuideTopicWriteDTO notAList = new GuideTopicWriteDTO(null, "cultura", null,
                new LocalizedTextDTO("T", null, null), new LocalizedTextDTO("R", null, null),
                new LocalizedJsonDTO(json("{\"type\":\"p\"}"), null, null),
                new LocalizedJsonDTO(json("[]"), null, null), null, null, List.of());
        GuideTopicWriteDTO badLang = new GuideTopicWriteDTO(null, "cultura", null,
                new LocalizedTextDTO("T", null, null), new LocalizedTextDTO("R", null, null),
                new LocalizedJsonDTO(json("[]"), null, null),
                new LocalizedJsonDTO(json("[]"), null, null), null, null, List.of("fr"));

        assertThrows(BadRequestException.class, () -> service.create(notAList));
        assertThrows(BadRequestException.class, () -> service.create(badLang));
    }

    @Test
    @DisplayName("Deve vincular o local pelo endereço e recusar um local que não existe")
    void shouldLinkExistingPlaceOnly() {
        PlaceEntity place = new PlaceEntity();
        place.setSlug("reitoria");
        when(placeRepository.findBySlug("reitoria")).thenReturn(Optional.of(place));
        when(placeRepository.findBySlug("nao-existe")).thenReturn(Optional.empty());
        when(repository.existsBySlug(any())).thenReturn(false);
        when(repository.findMaxPosition("cultura")).thenReturn(-1);
        saveReturnsArgument();

        assertEquals("reitoria", service.create(dto(null, "cultura", null, "Com local", "reitoria")).placeSlug());
        assertThrows(BadRequestException.class, () -> service.create(dto(null, "cultura", null, "Sem local", "nao-existe")));
    }

    @Test
    @DisplayName("Deve editar o tópico e auditar o antes e o depois")
    void shouldUpdateTopic() {
        GuideTopicEntity topic = existing("boas-vindas");
        when(repository.findBySlug("boas-vindas")).thenReturn(Optional.of(topic));
        saveReturnsArgument();

        GuideTopicTranslationsDTO result = service.update("boas-vindas", dto(null, "cultura", null, "Novo título", null));

        assertEquals("boas-vindas", result.slug());
        assertEquals("Novo título", result.title().pt());
        ArgumentCaptor<Object> before = ArgumentCaptor.forClass(Object.class);
        verify(auditService).record(eq(AuditService.Entity.ACOLHIMENTO), eq("boas-vindas"), eq("Novo título"),
                eq(AuditService.Action.EDITADO), before.capture(), eq(result));
        assertEquals("Título", ((GuideTopicTranslationsDTO) before.getValue()).title().pt());
    }

    @Test
    @DisplayName("Deve lançar 404 ao editar ou excluir um tópico que não existe")
    void shouldThrowWhenTopicMissing() {
        when(repository.findBySlug("nao-existe")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update("nao-existe", dto(null, "cultura", null, "T", null)));
        assertThrows(ResourceNotFoundException.class, () -> service.delete("nao-existe"));
    }

    @Test
    @DisplayName("Deve excluir o tópico e auditar com o estado que existia")
    void shouldDeleteTopic() {
        GuideTopicEntity topic = existing("cpf");
        when(repository.findBySlug("cpf")).thenReturn(Optional.of(topic));

        service.delete("cpf");

        verify(repository).delete(topic);
        verify(auditService).record(eq(AuditService.Entity.ACOLHIMENTO), eq("cpf"), eq("Título"),
                eq(AuditService.Action.DELETADO), any(GuideTopicTranslationsDTO.class), isNull());
    }

    private AuditLogEntity log(String entityId, String before) {
        return new AuditLogEntity(7L, "Equipe", "acolhimento", entityId, "Título", "editado", before, null);
    }

    @Test
    @DisplayName("Desfazer uma criação deve excluir o tópico")
    void shouldUndoCreationByDeleting() {
        GuideTopicEntity topic = existing("novo");
        when(repository.findBySlug("novo")).thenReturn(Optional.of(topic));

        service.restore(log("novo", null));

        verify(repository).delete(topic);
        verify(auditService).record(eq(AuditService.Entity.ACOLHIMENTO), eq("novo"), eq("Título"),
                eq(AuditService.Action.RESTAURADO), any(GuideTopicTranslationsDTO.class), isNull());
    }

    @Test
    @DisplayName("Desfazer uma exclusão deve recriar o tópico com o mesmo endereço")
    void shouldUndoDeletionByRecreating() {
        String before = "{\"slug\":\"cpf\",\"section\":\"documentos\",\"stage\":\"chegada\","
                + "\"title\":{\"pt\":\"CPF\",\"en\":null,\"es\":null},\"summary\":{\"pt\":\"Resumo\",\"en\":null,\"es\":null},"
                + "\"blocks\":{\"pt\":[],\"en\":null,\"es\":null},\"links\":{\"pt\":[],\"en\":null,\"es\":null},"
                + "\"source\":{\"pt\":\"Cartilha\",\"en\":null,\"es\":null},\"placeSlug\":null,\"fullyTranslatedLangs\":[]}";
        when(repository.findBySlug("cpf")).thenReturn(Optional.empty());
        when(repository.existsBySlug("cpf")).thenReturn(false);
        when(repository.findMaxPosition("documentos")).thenReturn(3);
        saveReturnsArgument();

        service.restore(log("cpf", before));

        ArgumentCaptor<GuideTopicEntity> saved = ArgumentCaptor.forClass(GuideTopicEntity.class);
        verify(repository).saveAndFlush(saved.capture());
        assertEquals("cpf", saved.getValue().getSlug());
        assertEquals("CPF", saved.getValue().getTitlePt());
        assertNull(saved.getValue().getTitleEn());
        assertArrayEquals(new String[0], saved.getValue().getFullyTranslatedLangs());
        verify(auditService).record(eq(AuditService.Entity.ACOLHIMENTO), eq("cpf"), eq("CPF"),
                eq(AuditService.Action.RESTAURADO), isNull(), any(GuideTopicTranslationsDTO.class));
    }
}
