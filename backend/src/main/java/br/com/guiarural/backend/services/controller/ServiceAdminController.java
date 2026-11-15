package br.com.guiarural.backend.services.controller;

import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Visão do painel administrativo: lista todos os serviços, inclusive os despublicados. Exige login.
@RestController
@RequestMapping("/api/admin/services")
public class ServiceAdminController {
    private final ServiceService service;

    public ServiceAdminController(ServiceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAllForAdmin());
    }
}
