package br.com.guiarural.backend.messages.service;

import br.com.guiarural.backend.core.exception.ResourceNotFoundException;
import br.com.guiarural.backend.messages.dto.MessageRequestDTO;
import br.com.guiarural.backend.messages.dto.MessageResponseDTO;
import br.com.guiarural.backend.messages.model.MessageEntity;
import br.com.guiarural.backend.messages.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class MessageService {
    // As mensagens podem ter nome e contato (dado pessoal): ficam guardadas por 15 dias e são apagadas (D6, 21/11/2026).
    public static final Duration RETENTION = Duration.ofDays(15);

    private final MessageRepository repository;
    private final MessageRateLimiter rateLimiter;

    public MessageService(MessageRepository repository, MessageRateLimiter rateLimiter) {
        this.repository = repository;
        this.rateLimiter = rateLimiter;
    }

    // Formulário público: não há administrador na requisição, por isso não passa pelo log de auditoria (que registra
    // mudanças feitas no painel, RNF06).
    @Transactional
    public void send(MessageRequestDTO dto) {
        if (!rateLimiter.tryAcquire()) {
            throw new MessageRateLimitException();
        }
        purgeExpired();
        repository.save(new MessageEntity(dto.nome(), dto.contato(), dto.mensagem()));
    }

    // Apagar por vencimento é automático, não ação de administrador: não passa pelo log de auditoria.
    @Transactional
    public int purgeExpired() {
        return repository.deleteOlderThan(Instant.now().minus(RETENTION));
    }

    // Mais recentes primeiro. Apaga as vencidas antes de listar, para o painel nunca mostrar uma mensagem com mais de 15 dias.
    @Transactional
    public List<MessageResponseDTO> list() {
        purgeExpired();
        return repository.findAllByOrderByCreatedAtDescIdDesc().stream().map(MessageResponseDTO::fromEntity).toList();
    }

    @Transactional
    public MessageResponseDTO markRead(Long id, boolean read) {
        MessageEntity message = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada"));
        message.markRead(read);
        return MessageResponseDTO.fromEntity(message);
    }
}
