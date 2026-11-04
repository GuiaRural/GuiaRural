package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.service.PlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {
    private final PlaceService service;

    public PlaceController(PlaceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlaceResponseDTO>> findPublished() {
        return ResponseEntity.ok(service.findPublished());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PlaceResponseDTO> findBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlug(slug));
    }
}
