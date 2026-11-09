package br.com.guiarural.backend.info.controller;

import br.com.guiarural.backend.info.dto.GuideResourcesDTO;
import br.com.guiarural.backend.info.dto.GuideTopicDetailDTO;
import br.com.guiarural.backend.info.dto.GuideTopicSummaryDTO;
import br.com.guiarural.backend.info.dto.GuideTopicTranslationsDTO;
import br.com.guiarural.backend.info.dto.GuideTopicWriteDTO;
import br.com.guiarural.backend.info.dto.RecifeGuideDTO;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.service.GuideResourceService;
import br.com.guiarural.backend.info.service.GuideTopicWriteService;
import br.com.guiarural.backend.info.service.GuideTopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Guia de acolhimento (RF05) e Guia de Recife. Leitura pública; ?lang=pt|en|es (padrão pt, com
// fallback para o português quando falta a tradução). Criar, editar e excluir tópicos exige administrador
// logado com permissão "geral" ou "editor" (regra no SecurityConfig).
@RestController
@RequestMapping("/api/guide")
public class GuideController {
    private final GuideTopicService topicService;
    private final GuideResourceService resourceService;
    private final GuideTopicWriteService writeService;

    public GuideController(GuideTopicService topicService,
                           GuideResourceService resourceService,
                           GuideTopicWriteService writeService) {
        this.topicService = topicService;
        this.resourceService = resourceService;
        this.writeService = writeService;
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

    // Mínimo de 2 caracteres; abaixo disso devolve lista vazia.
    @GetMapping("/search")
    public ResponseEntity<List<GuideTopicSummaryDTO>> search(@RequestParam String q,
                                                             @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(topicService.search(q, Language.from(lang)));
    }

    // Os três idiomas lado a lado, para o painel administrativo editar as traduções.
    @GetMapping("/translations/topics")
    public ResponseEntity<List<GuideTopicTranslationsDTO>> findTopicTranslations(@RequestParam String section) {
        return ResponseEntity.ok(topicService.findTranslationsBySection(section));
    }

    @GetMapping("/translations/topics/{slug}")
    public ResponseEntity<GuideTopicTranslationsDTO> findTopicTranslation(@PathVariable String slug) {
        return ResponseEntity.ok(topicService.findTranslationsBySlug(slug));
    }

    @PostMapping("/topics")
    public ResponseEntity<GuideTopicTranslationsDTO> createTopic(@Valid @RequestBody GuideTopicWriteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(writeService.create(dto));
    }

    @PutMapping("/topics/{slug}")
    public ResponseEntity<GuideTopicTranslationsDTO> updateTopic(@PathVariable String slug,
                                                                 @Valid @RequestBody GuideTopicWriteDTO dto) {
        return ResponseEntity.ok(writeService.update(slug, dto));
    }

    @DeleteMapping("/topics/{slug}")
    public ResponseEntity<Void> deleteTopic(@PathVariable String slug) {
        writeService.delete(slug);
        return ResponseEntity.noContent().build();
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
