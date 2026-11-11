package br.com.guiarural.backend.login.dto;

import jakarta.validation.constraints.Pattern;

// Aprovar (status "ativo"), revogar (status "revogado") ou mudar o perfil. Campo nulo = não muda.
// Não troca senha: se alguém precisar de senha nova, o responsável pelo projeto troca direto no banco (D4).
public record AdminUpdateDTO(
        @Pattern(regexp = "ativo|revogado", message = "Status inválido.") String status,
        @Pattern(regexp = "geral|editor|leitura", message = "Permissão inválida.") String permission
) {
}
