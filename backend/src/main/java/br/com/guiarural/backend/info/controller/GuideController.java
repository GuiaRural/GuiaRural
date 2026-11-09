package br.com.guiarural.backend.info.controller;

import br.com.guiarural.backend.info.dto.GuideResourcesDTO;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.dto.RecifeGuideDTO;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.service.GuideResourceService;
import br.com.guiarural.backend.info.service.GuideTopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Guia de acolhimento (RF05) e Guia de Recife. Leitura pública; ?lang=pt|en|es (padrão pt, com
// fallback para o português quando falta a tradução).
@RestController
@RequestMapping("/api/guide")
public class GuideController {
    private final GuideTopicService topicService;
    private final GuideResourceService resourceService;

    public GuideController(GuideTopicService topicService, GuideResourceService resourceService) {
        this.topicService = topicService;
        this.resourceService = resourceService;
    }

    @GetMapping("/topics")
    public ResponseEntity<List<GuideTopicSummaryDTO>> findTopics(@RequestParam String section,
                                                                 @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(topicService.findBySection(section, Language.from(lang)));
    }

    @GetMapping("/topics/{slug}")
    public ResponseEntity<GuideTopicDetailDTO> findTopic(@PathVariable String slug,
                                                         @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(topicService.findBySlug(slug, Language.from(lang)));
    }

    @GetMapping("/recife")
    public ResponseEntity<RecifeGuideDTO> findRecifeGuide(@RequestParam(required = false) String lang) {
        return ResponseEntity.ok(resourceService.findRecifeGuide(Language.from(lang)));
    }

    @GetMapping("/resources")
    public ResponseEntity<GuideResourcesDTO> findResources(@RequestParam(required = false) String lang) {
        return ResponseEntity.ok(resourceService.findResources(Language.from(lang)));
    }
}
