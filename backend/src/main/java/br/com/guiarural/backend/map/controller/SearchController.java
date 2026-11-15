package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.map.dto.SearchSuggestionDTO;
import br.com.guiarural.backend.map.service.SearchService;
import br.com.guiarural.backend.info.model.Language;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService service;

    public SearchController(SearchService service) {
        this.service = service;
    }

    @GetMapping
    // ?lang=pt|en|es (padrão pt): as sugestões saem no idioma pedido e casam também com o nome em português.
    public ResponseEntity<List<SearchSuggestionDTO>> search(@RequestParam(name = "q", defaultValue = "") String query,
                                                            @RequestParam(required = false) String lang) {
        return ResponseEntity.ok(service.search(query, Language.from(lang)));
    }
}
