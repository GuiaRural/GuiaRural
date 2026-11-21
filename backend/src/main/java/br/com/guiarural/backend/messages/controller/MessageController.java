package br.com.guiarural.backend.messages.controller;

import br.com.guiarural.backend.messages.dto.MessageReadRequestDTO;
import br.com.guiarural.backend.messages.dto.MessageRequestDTO;
import br.com.guiarural.backend.messages.dto.MessageResponseDTO;
import br.com.guiarural.backend.messages.service.MessageRateLimitException;
import br.com.guiarural.backend.messages.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// POST é público (UC39, tela "Falar com a equipe"); a leitura e a marcação de lida exigem login (SecurityConfig).
@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // 204, sem corpo: o visitante não precisa (nem deve) ler de volta o que ficou guardado.
    @PostMapping
    public ResponseEntity<Void> send(@Valid @RequestBody MessageRequestDTO dto) {
        messageService.send(dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<MessageResponseDTO> list() {
        return messageService.list();
    }

    @PatchMapping("/{id}")
    public MessageResponseDTO markRead(@PathVariable Long id, @Valid @RequestBody MessageReadRequestDTO dto) {
        return messageService.markRead(id, dto.read());
    }

    @ExceptionHandler(MessageRateLimitException.class)
    public ResponseEntity<ProblemDetail> handleRateLimit(MessageRateLimitException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage()));
    }
}
