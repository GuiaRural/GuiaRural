package br.com.guiarural.backend.msg.dto;

import br.com.guiarural.backend.msg.model.Message;

public record MessageResponseDTO (
    Long id,
    String nome,
    String email,
    String telefone,
    String mensagem
) {
    public static MessageResponseDTO fromEntity(Message message) {
        return new MessageResponseDTO(
            message.getId(),
            message.getNome(),
            message.getEmail(),
            message.getTelefone(),
            message.getMensagem()
        );
    }
}
