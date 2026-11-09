package br.com.guiarural.backend.info.service;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.model.GuideTopicEntity;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.repository.GuideTopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Set;

@Service
public class GuideTopicService {
    // Mesmas seções do check da tabela guide_topics.
    private static final Set<String> SECTIONS = Set.of("cultura", "documentos", "calouro", "recife");

    private final GuideTopicRepository repository;
    private final JsonMapper jsonMapper;

    public GuideTopicService(GuideTopicRepository repository, JsonMapper jsonMapper) {
        this.repository = repository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public List<GuideTopicSummaryDTO> findBySection(String section, Language language) {
        if (section == null || !SECTIONS.contains(section)) {
            throw new BadRequestException("Seção inválida: " + section);
        }
        return repository.findBySectionOrderByPositionAsc(section).stream()
                .map(topic -> toSummary(topic, language))
                .toList();
    }

    @Transactional(readOnly = true)
    public GuideTopicDetailDTO findBySlug(String slug, Language language) {
        GuideTopicEntity topic = repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tópico não encontrado: " + slug));
        return new GuideTopicDetailDTO(
                topic.getSlug(),
                topic.getSection(),
                topic.getStage(),
                language.pick(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()),
                language.pick(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()),
                json(language.pick(topic.getBlocksPt(), topic.getBlocksEn(), topic.getBlocksEs())),
                json(language.pick(topic.getLinksPt(), topic.getLinksEn(), topic.getLinksEs())),
                language.pick(topic.getSourcePt(), topic.getSourceEn(), topic.getSourceEs()),
                placeSlug(topic)
        );
    }

    private GuideTopicSummaryDTO toSummary(GuideTopicEntity topic, Language language) {
        return new GuideTopicSummaryDTO(
                topic.getSlug(),
                topic.getSection(),
                topic.getStage(),
                language.pick(topic.getTitlePt(), topic.getTitleEn(), topic.getTitleEs()),
                language.pick(topic.getSummaryPt(), topic.getSummaryEn(), topic.getSummaryEs()),
                placeSlug(topic)
        );
    }

    private String placeSlug(GuideTopicEntity topic) {
        return topic.getPlace() == null ? null : topic.getPlace().getSlug();
    }

    private JsonNode json(String raw) {
        return raw == null ? jsonMapper.createArrayNode() : jsonMapper.readTree(raw);
    }
}
