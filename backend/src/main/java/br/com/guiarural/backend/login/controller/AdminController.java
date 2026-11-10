package br.com.guiarural.backend.login.controller;

import br.com.guiarural.backend.login.dto.AdminRequestDTO;
import br.com.guiarural.backend.login.dto.AdminResponseDTO;
import br.com.guiarural.backend.login.dto.AdminUpdateDTO;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Administradores do painel (UC13). A lista é de qualquer administrador logado; cadastrar, aprovar, mudar perfil e
// revogar são só do perfil "geral" (SecurityConfig).
@RestController
@RequestMapping("/api/admin/admins")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdminResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<AdminResponseDTO> create(@Valid @RequestBody AdminRequestDTO dto,
                                                   @AuthenticationPrincipal AdminPrincipal author) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto, author));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdminResponseDTO> update(@PathVariable Long id,
                                                   @Valid @RequestBody AdminUpdateDTO dto,
                                                   @AuthenticationPrincipal AdminPrincipal author) {
        return ResponseEntity.ok(service.update(id, dto, author));
    }
}
