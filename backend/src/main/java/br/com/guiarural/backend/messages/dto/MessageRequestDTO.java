package br.com.guiarural.backend.messages.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Corpo público de POST /api/messages. Nome e contato são opcionais: em branco viram nulos (e, portanto, válidos).
public record MessageRequestDTO(
    @Size(max = 100, message = "O nome não pode ter mais que 100 caracteres.")
    String nome,
    @Size(max = 150, message = "O contato não pode ter mais que 150 caracteres.")
    @Pattern(regexp = MessageRequestDTO.CONTACT_REGEX, message = "Informe um e-mail ou telefone válido.")
    String contato,
    @NotBlank(message = "A mensagem é obrigatória.")
    @Size(max = 1000, message = "A mensagem não pode ter mais que 1000 caracteres.")
    String mensagem
) {
    // E-mail (algo@dominio.tld) ou telefone (8 a 15 dígitos, com + , espaços, parênteses e hífens opcionais).
    static final String CONTACT_REGEX = "[^@\\s]+@[^@\\s]+\\.[^@\\s]+|\\+?(?:[\\s().-]*\\d){8,15}[\\s().-]*";

    public MessageRequestDTO {
        nome = blankToNull(nome);
        contato = blankToNull(contato);
        mensagem = mensagem == null ? null : mensagem.strip();
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String stripped = value.strip();
        return stripped.isEmpty() ? null : stripped;
    }
}
