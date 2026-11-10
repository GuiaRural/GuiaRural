package br.com.guiarural.backend.map.controller;

import br.com.guiarural.backend.core.exception.BadRequestException;
import br.com.guiarural.backend.map.dto.PlaceRequestDTO;
import br.com.guiarural.backend.map.dto.PlaceResponseDTO;
import br.com.guiarural.backend.map.model.PlacePhotoEntity;
import br.com.guiarural.backend.map.service.PlaceAdminService;
import br.com.guiarural.backend.map.service.PlaceService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

// Leituras são públicas (SecurityConfig). Criar, editar, excluir e trocar a foto exigem administrador com perfil
// geral ou editor, e cada uma gera histórico de auditoria.
@RestController
@RequestMapping("/api/places")
public class PlaceController {
    private final PlaceService service;
    private final PlaceAdminService adminService;

    public PlaceController(PlaceService service, PlaceAdminService adminService) {
        this.service = service;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<PlaceResponseDTO>> findPublished() {
        return ResponseEntity.ok(service.findPublished());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PlaceResponseDTO> findBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.findBySlug(slug));
    }

    // A URL traz ?v=<versão> (photoUrl do local): trocar a foto muda a versão, então o navegador pode guardar por muito tempo.
    @GetMapping("/{slug}/photo")
    public ResponseEntity<byte[]> photo(@PathVariable String slug) {
        PlacePhotoEntity photo = service.findPublishedPhoto(slug);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(photo.getBytes());
    }

    @PostMapping
    public ResponseEntity<PlaceResponseDTO> create(@Valid @RequestBody PlaceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.create(dto));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<PlaceResponseDTO> update(@PathVariable String slug, @Valid @RequestBody PlaceRequestDTO dto) {
        return ResponseEntity.ok(adminService.update(slug, dto));
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        adminService.delete(slug);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{slug}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaceResponseDTO> savePhoto(@PathVariable String slug, @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(adminService.savePhoto(slug, file.getBytes()));
        } catch (IOException e) {
            throw new BadRequestException("Não foi possível ler o arquivo enviado.");
        }
    }

    @DeleteMapping("/{slug}/photo")
    public ResponseEntity<PlaceResponseDTO> deletePhoto(@PathVariable String slug) {
        return ResponseEntity.ok(adminService.deletePhoto(slug));
    }
}
