package br.com.guiarural.backend.menus.controller;

import br.com.guiarural.backend.menus.dto.MenuRequestDTO;
import br.com.guiarural.backend.menus.dto.MenuResponseDTO;
import br.com.guiarural.backend.menus.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Leituras públicas (página Cardápio da semana); criar, editar e excluir exigem login (SecurityConfig).
@RestController
@RequestMapping("/api/menus")
public class MenuController {
    private final MenuService service;

    public MenuController(MenuService service) {
        this.service = service;
    }

    // ?from=AAAA-MM-DD&to=AAAA-MM-DD limita ao período (inclusive); sem eles, todos.
    @GetMapping
    public ResponseEntity<List<MenuResponseDTO>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.findAll(from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<MenuResponseDTO> create(@Valid @RequestBody MenuRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuResponseDTO> update(@PathVariable Long id, @Valid @RequestBody MenuRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
