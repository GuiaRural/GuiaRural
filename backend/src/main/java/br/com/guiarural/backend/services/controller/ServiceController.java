package br.com.guiarural.backend.services.controller;

import br.com.guiarural.backend.services.dto.ServiceRequestDTO;
import br.com.guiarural.backend.services.dto.ServiceResponseDTO;
import br.com.guiarural.backend.services.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    private final ServiceService service;

    public ServiceController(ServiceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ServiceResponseDTO> create(@Valid @RequestBody ServiceRequestDTO dto) {
        ServiceResponseDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> findAll() {
        List<ServiceResponseDTO> list = service.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> findById(@PathVariable Long id) {
        ServiceResponseDTO dto = service.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ServiceRequestDTO dto) {
        ServiceResponseDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
