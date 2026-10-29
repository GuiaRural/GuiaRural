package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.map.dto.SearchSuggestionDTO;
import br.com.guiarural.backend.map.service.SearchService;
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
    public ResponseEntity<List<SearchSuggestionDTO>> search(@RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(service.search(query));
    }
}
