package br.com.guiarural.backend.notices.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.guiarural.backend.notices.dto.AvisoRequestDTO;
import br.com.guiarural.backend.notices.dto.AvisoResponseDTO;
import br.com.guiarural.backend.notices.service.AvisoService;

import java.util.List;

@RestController
@RequestMapping("/api/avisos")
public class AvisoController {

    private final AvisoService avisoService;

    public AvisoController(AvisoService avisoService) {
        this.avisoService = avisoService;
    }

    @PostMapping
    public ResponseEntity<AvisoResponseDTO> criar(@Valid @RequestBody AvisoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avisoService.criarAviso(dto));
    }

    @GetMapping
    public ResponseEntity<List<AvisoResponseDTO>> listar() {
        return ResponseEntity.ok(avisoService.listarAvisos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvisoResponseDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(avisoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvisoResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody AvisoRequestDTO dto) {
        return ResponseEntity.ok(avisoService.atualizarAviso(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        avisoService.deletarAviso(id);
        return ResponseEntity.noContent().build();
    }
}
