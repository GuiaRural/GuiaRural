package br.com.guiarural.backend.messages.dto;

import br.com.guiarural.backend.messages.model.MessageEntity;

import java.time.Instant;

// Visão do painel administrativo.
public record MessageResponseDTO(
    Long id,
    String nome,
    String contato,
    String mensagem,
    Instant createdAt,
    boolean read,
    Instant readAt
) {
    public static MessageResponseDTO fromEntity(MessageEntity message) {
        return new MessageResponseDTO(
            message.getId(),
            message.getNome(),
            message.getContato(),
            message.getMensagem(),
            message.getCreatedAt(),
            message.getReadAt() != null,
            message.getReadAt()
        );
    }
}
