package br.com.guiarural.backend.info.service;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.dto.GuideTopicTranslationsDTO;
import br.com.guiarural.backend.info.dto.LocalizedJsonDTO;
import br.com.guiarural.backend.info.dto.LocalizedTextDTO;
import br.com.guiarural.backend.info.model.GuideTopicEntity;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.repository.GuideTopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class GuideTopicService {
    // Mesmas seções do check da tabela guide_topics, na ordem em que o site as mostra.
    private static final List<String> SECTIONS = List.of("cultura", "documentos", "calouro", "recife");
    private static final int MIN_QUERY_LENGTH = 2;
    // Campos dos blocos e links que não são texto para o leitor (tipo, cor, ids de arquivo, URLs).
    private static final Set<String> NON_TEXT_KEYS = Set.of("type", "tone", "id", "credit", "driveId", "folderId", "url", "embed");

    private final GuideTopicRepository repository;
    private final JsonMapper jsonMapper;

    public GuideTopicService(GuideTopicRepository repository, JsonMapper jsonMapper) {
        this.repository = repository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public List<GuideTopicSummaryDTO> findBySection(String section, Language language) {
        validateSection(section);
        return repository.findBySectionOrderByPositionAsc(section).stream()
                .map(topic -> toSummary(topic, language))
                .toList();
    }

    @Transactional(readOnly = true)
    public GuideTopicDetailDTO findBySlug(String slug, Language language) {
        GuideTopicEntity topic = findEntity(slug);
        return new GuideTopicDetailDTO(
                topic.getSlug(),
                topic.getSection(),
                topic.getStage(),
                language.pick(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()),
                language.effective(topic.getTitleEn(), topic.getTitleEs()).code(),
                language.pick(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()),
                json(language.pick(topic.getBlocksPt(), topic.getBlocksEn(), topic.getBlocksEs())),
                json(language.pick(topic.getLinksPt(), topic.getLinksEn(), topic.getLinksEs())),
                language.pick(topic.getSourcePt(), topic.getSourceEn(), topic.getSourceEs()),
                placeSlug(topic),
                language.isFullyTranslatedIn(topic.getFullyTranslatedLangs())
        );
    }

    // Busca nos textos em português e no idioma pedido (para achar conteúdo ainda sem tradução).
    @Transactional(readOnly = true)
    public List<GuideTopicSummaryDTO> search(String query, Language language) {
        String needle = normalize(query == null ? "" : query.trim());
        if (needle.length() < MIN_QUERY_LENGTH) {
            return List.of();
        }
        return repository.findAllBy().stream()
                .sorted(Comparator.comparingInt((GuideTopicEntity t) -> SECTIONS.indexOf(t.getSection()))
                        .thenComparingInt(GuideTopicEntity::getPosition))
                .filter(topic -> matches(topic, language, needle))
                .map(topic -> toSummary(topic, language))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GuideTopicTranslationsDTO> findTranslationsBySection(String section) {
        validateSection(section);
        return repository.findBySectionOrderByPositionAsc(section).stream()
                .map(this::toTranslations)
                .toList();
    }

    @Transactional(readOnly = true)
    public GuideTopicTranslationsDTO findTranslationsBySlug(String slug) {
        return toTranslations(findEntity(slug));
    }

    private GuideTopicEntity findEntity(String slug) {
        return repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tópico não encontrado: " + slug));
    }

    private void validateSection(String section) {
        if (section == null || !SECTIONS.contains(section)) {
            throw new BadRequestException("Seção inválida: " + section);
        }
    }

    private GuideTopicSummaryDTO toSummary(GuideTopicEntity topic, Language language) {
        return new GuideTopicSummaryDTO(
                topic.getSlug(),
                topic.getSection(),
                topic.getStage(),
                language.pick(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()),
                language.pick(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()),
                placeSlug(topic),
                language.isFullyTranslatedIn(topic.getFullyTranslatedLangs())
        );
    }

    GuideTopicTranslationsDTO toTranslations(GuideTopicEntity topic) {
        return new GuideTopicTranslationsDTO(
                topic.getSlug(),
                topic.getSection(),
                topic.getStage(),
                new LocalizedTextDTO(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()),
                new LocalizedTextDTO(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()),
                new LocalizedJsonDTO(jsonOrNull(topic.getBlocksPt()), jsonOrNull(topic.getBlocksEn()), jsonOrNull(topic.getBlocksEs())),
                new LocalizedJsonDTO(jsonOrNull(topic.getLinksPt()), jsonOrNull(topic.getLinksEn()), jsonOrNull(topic.getLinksEs())),
                new LocalizedTextDTO(topic.getSourcePt(), topic.getSourceEn(), topic.getSourceEs()),
                placeSlug(topic),
                topic.getFullyTranslatedLangs() == null ? List.of() : Arrays.asList(topic.getFullyTranslatedLangs())
        );
    }

    private boolean matches(GuideTopicEntity topic, Language language, String needle) {
        List<String> texts = new ArrayList<>();
        texts.add(topic.getTitlePt());
        texts.add(topic.getSummaryPt());
        texts.add(language.pick(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()));
        texts.add(language.pick(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()));
        collectTexts(jsonOrNull(topic.getBlocksPt()), texts);
        collectTexts(jsonOrNull(topic.getLinksPt()), texts);
        if (language != Language.PT) {
            collectTexts(jsonOrNull(language.pick(topic.getBlocksPt(), topic.getBlocksEn(), topic.getBlocksEs())), texts);
            collectTexts(jsonOrNull(language.pick(topic.getLinksPt(), topic.getLinksEn(), topic.getLinksEs())), texts);
        }
        return texts.stream().anyMatch(text -> text != null && normalize(text).contains(needle));
    }

    private void collectTexts(JsonNode node, List<String> out) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node.isString()) {
            out.add(node.asString());
        } else if (node.isArray()) {
            node.forEach(child -> collectTexts(child, out));
        } else if (node.isObject()) {
            node.properties().forEach(entry -> {
                if (!NON_TEXT_KEYS.contains(entry.getKey())) {
                    collectTexts(entry.getValue(), out);
                }
            });
        }
    }

    // Sem acento e em minúsculas: "documentação" encontra "documentacao".
    private String normalize(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT);
    }

    private String placeSlug(GuideTopicEntity topic) {
        return topic.getPlace() == null ? null : topic.getPlace().getSlug();
    }

    private JsonNode json(String raw) {
        return raw == null ? jsonMapper.createArrayNode() : jsonMapper.readTree(raw);
    }

    private JsonNode jsonOrNull(String raw) {
        return raw == null ? null : jsonMapper.readTree(raw);
    }
}
