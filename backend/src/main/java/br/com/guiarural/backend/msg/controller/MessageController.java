package br.com.guiarural.backend.msg.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.guiarural.backend.msg.dto.MessageRequestDTO;
import br.com.guiarural.backend.msg.dto.MessageResponseDTO;
import br.com.guiarural.backend.msg.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MessageResponseDTO> create(@RequestBody @Valid MessageRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(requestDTO));
    }

    // Nota: Em um cenário real, endpoints de leitura e exclusão devem ser protegidos 
    // e acessíveis apenas pelo painel admin autenticado.
    @GetMapping
    public ResponseEntity<List<MessageResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
