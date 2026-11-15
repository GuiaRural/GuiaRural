package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.service.PlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Leitura do painel: todos os locais, inclusive rascunhos e inativos. Fora de PUBLIC_READS, então exige login
// (qualquer perfil, inclusive "leitura").
@RestController
@RequestMapping("/api/admin/places")
public class PlaceAdminController {
    private final PlaceService service;

    public PlaceAdminController(PlaceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlaceResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAllForAdmin());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PlaceResponseDTO> findBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlugForAdmin(slug));
    }
}
