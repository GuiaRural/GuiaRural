package br.com.guiarural.backend.info.service;

import br.com.guiarural.backend.core.audit.AuditLogEntity;
import br.com.guiarural.backend.core.audit.AuditRestorer;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

// Criar, editar e excluir tópicos do guia de acolhimento pelo painel. Cada escrita é auditada na mesma transação.
@Service
public class GuideTopicWriteService implements AuditRestorer {
    private static final Set<String> SECTIONS = Set.of("cultura", "documentos", "calouro", "recife");
    private static final Set<String> STAGES = Set.of("antes", "chegada", "primeiras-semanas", "mobilidade");
    private static final Set<String> TRANSLATED_LANGS = Set.of("en", "es");
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");
    private static final int MAX_TITLE = 200;
    private static final int MAX_SUMMARY = 1000;
    // Teto do JSON de blocos/links por idioma: um tópico enorme não deve passar pelo painel.
    private static final int MAX_JSON_CHARS = 200_000;

    private final GuideTopicRepository repository;
    private final PlaceRepository placeRepository;
    private final GuideTopicService topicService;
    private final AuditService auditService;
    private final JsonMapper jsonMapper;

    public GuideTopicWriteService(GuideTopicRepository repository,
                                  PlaceRepository placeRepository,
                                  GuideTopicService topicService,
                                  AuditService auditService,
                                  JsonMapper jsonMapper) {
        this.repository = repository;
        this.placeRepository = placeRepository;
        this.topicService = topicService;
        this.auditService = auditService;
        this.jsonMapper = jsonMapper;
    }

    @Transactional
    public GuideTopicTranslationsDTO create(GuideTopicWriteDTO dto) {
        return create(dto, AuditService.Action.CRIADO);
    }

    @Transactional
    public GuideTopicTranslationsDTO update(String slug, GuideTopicWriteDTO dto) {
        GuideTopicEntity topic = find(slug);
        GuideTopicTranslationsDTO before = topicService.toTranslations(topic);
        return update(topic, before, dto, AuditService.Action.EDITADO);
    }

    @Transactional
    public void delete(String slug) {
        GuideTopicEntity topic = find(slug);
        GuideTopicTranslationsDTO before = topicService.toTranslations(topic);
        repository.delete(topic);
        auditService.record(AuditService.Entity.ACOLHIMENTO, slug, before.title().pt(),
                AuditService.Action.DELETADO, before, null);
    }

    @Override
    public AuditService.Entity entity() {
        return AuditService.Entity.ACOLHIMENTO;
    }

    // Desfaz a mudança do log: criada -> exclui; editada ou excluída -> volta ao estado anterior.
    @Override
    @Transactional
    public void restore(AuditLogEntity log) {
        String slug = log.getEntityId();
        if (log.getBeforeState() == null) {
            // A mudança foi a criação: desfazer é remover (se já não foi removido depois).
            GuideTopicEntity current = repository.findBySlug(slug)
                    .orElseThrow(() -> new ResourceNotFoundException("Tópico não encontrado: " + slug));
            GuideTopicTranslationsDTO before = topicService.toTranslations(current);
            repository.delete(current);
            auditService.record(AuditService.Entity.ACOLHIMENTO, slug, before.title().pt(),
                    AuditService.Action.RESTAURADO, before, null);
            return;
        }
        GuideTopicWriteDTO previous = jsonMapper.treeToValue(jsonMapper.readTree(log.getBeforeState()), GuideTopicWriteDTO.class);
        GuideTopicWriteDTO target = withSlug(previous, slug);
        GuideTopicEntity current = repository.findBySlug(slug).orElse(null);
        if (current == null) {
            create(target, AuditService.Action.RESTAURADO);
        } else {
            GuideTopicTranslationsDTO before = topicService.toTranslations(current);
            update(current, before, target, AuditService.Action.RESTAURADO);
        }
    }

    private GuideTopicTranslationsDTO create(GuideTopicWriteDTO dto, AuditService.Action action) {
        GuideTopicContent content = toContent(dto);
        String slug = dto.slug() != null && !dto.slug().isBlank() ? validSlug(dto.slug()) : uniqueSlug(dto.title().pt());
        if (repository.existsBySlug(slug)) {
            throw new ConflictException("Já existe um tópico com o endereço: " + slug);
        }
        GuideTopicEntity topic = GuideTopicEntity.create(slug, repository.findMaxPosition(content.section()) + 1);
        topic.apply(content, place(dto.placeSlug()));
        repository.saveAndFlush(topic);
        GuideTopicTranslationsDTO after = topicService.toTranslations(topic);
        auditService.record(AuditService.Entity.ACOLHIMENTO, slug, after.title().pt(), action, null, after);
        return after;
    }

    private GuideTopicTranslationsDTO update(GuideTopicEntity topic, GuideTopicTranslationsDTO before,
                                             GuideTopicWriteDTO dto, AuditService.Action action) {
        topic.apply(toContent(dto), place(dto.placeSlug()));
        repository.saveAndFlush(topic);
        GuideTopicTranslationsDTO after = topicService.toTranslations(topic);
        auditService.record(AuditService.Entity.ACOLHIMENTO, topic.getSlug(), after.title().pt(), action, before, after);
        return after;
    }

    private GuideTopicEntity find(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tópico não encontrado: " + slug));
    }

    private GuideTopicWriteDTO withSlug(GuideTopicWriteDTO dto, String slug) {
        return new GuideTopicWriteDTO(slug, dto.section(), dto.stage(), dto.title(), dto.summary(), dto.blocks(),
                dto.links(), dto.source(), dto.placeSlug(), dto.fullyTranslatedLangs());
    }

    private PlaceEntity place(String placeSlug) {
        if (placeSlug == null || placeSlug.isBlank()) {
            return null;
        }
        return placeRepository.findBySlug(placeSlug)
                .orElseThrow(() -> new BadRequestException("Local não encontrado: " + placeSlug));
    }

    private GuideTopicContent toContent(GuideTopicWriteDTO dto) {
        if (!SECTIONS.contains(dto.section())) {
            throw new BadRequestException("Seção inválida: " + dto.section());
        }
        if (dto.stage() != null && !STAGES.contains(dto.stage())) {
            throw new BadRequestException("Etapa inválida: " + dto.stage());
        }
        String titlePt = required(dto.title().pt(), "Título em português", MAX_TITLE);
        String summaryPt = required(dto.summary().pt(), "Resumo em português", MAX_SUMMARY);
        LocalizedTextDTO source = dto.source() == null ? new LocalizedTextDTO(null, null, null) : dto.source();

        return new GuideTopicContent(
                dto.section(), blankToNull(dto.stage()),
                titlePt, optional(dto.title().en(), MAX_TITLE), optional(dto.title().es(), MAX_TITLE),
                summaryPt, optional(dto.summary().en(), MAX_SUMMARY), optional(dto.summary().es(), MAX_SUMMARY),
                requiredJson(dto.blocks(), "blocos"), optionalJson(dto.blocks().en()), optionalJson(dto.blocks().es()),
                requiredJson(dto.links(), "links"), optionalJson(dto.links().en()), optionalJson(dto.links().es()),
                optional(source.pt(), MAX_TITLE), optional(source.en(), MAX_TITLE), optional(source.es(), MAX_TITLE),
                translatedLangs(dto.fullyTranslatedLangs())
        );
    }

    // O português é obrigatório e as traduções, quando existem, têm a mesma quantidade de itens: o painel
    // mescla os idiomas pela posição.
    private String requiredJson(LocalizedJsonDTO json, String what) {
        if (json.pt() == null || !json.pt().isArray()) {
            throw new BadRequestException("Os " + what + " em português devem ser uma lista.");
        }
        for (JsonNode translated : new JsonNode[]{json.en(), json.es()}) {
            if (translated != null && !translated.isNull()
                    && (!translated.isArray() || translated.size() != json.pt().size())) {
                throw new BadRequestException("Os " + what + " traduzidos devem ter os mesmos itens do português.");
            }
        }
        return serialize(json.pt(), what);
    }

    private String optionalJson(JsonNode node) {
        return node == null || node.isNull() ? null : serialize(node, "conteúdo");
    }

    private String serialize(JsonNode node, String what) {
        String text = node.toString();
        if (text.length() > MAX_JSON_CHARS) {
            throw new BadRequestException("O conteúdo (" + what + ") é grande demais.");
        }
        return text;
    }

    private String[] translatedLangs(List<String> langs) {
        if (langs == null) {
            return new String[0];
        }
        for (String lang : langs) {
            if (!TRANSLATED_LANGS.contains(lang)) {
                throw new BadRequestException("Idioma inválido: " + lang);
            }
        }
        return langs.stream().distinct().toArray(String[]::new);
    }

    private String required(String value, String field, int max) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(field + " é obrigatório.");
        }
        return optional(value, max);
    }

    private String optional(String value, int max) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() > max) {
            throw new BadRequestException("Texto maior que " + max + " caracteres.");
        }
        return trimmed;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String validSlug(String slug) {
        if (!SLUG.matcher(slug).matches()) {
            throw new BadRequestException("Endereço inválido: use letras minúsculas, números e hífens.");
        }
        return slug;
    }

    // Endereço a partir do título; se já existir, acrescenta um número.
    private String uniqueSlug(String title) {
        String base = Normalizer.normalize(title == null ? "" : title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (base.isEmpty()) {
            base = "topico";
        }
        String slug = base;
        for (int n = 2; repository.existsBySlug(slug); n++) {
            slug = base + "-" + n;
        }
        return slug;
    }
}
