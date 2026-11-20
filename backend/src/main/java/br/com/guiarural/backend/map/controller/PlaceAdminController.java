package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.map.dto.PlaceDescriptionRequestDTO;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.service.PlaceAdminService;
import br.com.guiarural.backend.map.service.PlaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Leitura do painel: todos os locais, inclusive rascunhos e inativos. Fora de PUBLIC_READS, então exige login
// (qualquer perfil, inclusive "leitura").
@RestController
@RequestMapping("/api/admin/places")
public class PlaceAdminController {
    private final PlaceService service;
    private final PlaceAdminService adminService;

    public PlaceAdminController(PlaceService service, PlaceAdminService adminService) {
        this.service = service;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<PlaceResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAllForAdmin());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PlaceResponseDTO> findBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlugForAdmin(slug));
    }

    @PatchMapping("/{slug}/description")
    public ResponseEntity<PlaceResponseDTO> updateDescription(
            @PathVariable String slug,
            @Valid @RequestBody PlaceDescriptionRequestDTO dto) {
        return ResponseEntity.ok(adminService.updateDescription(slug, dto.description()));
    }
}