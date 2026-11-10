package br.com.guiarural.backend.map.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Responsável pelo local (D7: contato é um elemento do local, com o e-mail do responsável). Serve de entrada e de saída.
public record PlaceContactDTO(
        @NotBlank(message = "O nome do responsável é obrigatório.")
        @Size(max = 150, message = "O nome do responsável não pode ter mais que 150 caracteres.")
        String name,

        @Email(message = "Informe um e-mail válido para o responsável.")
        @Size(max = 150, message = "O e-mail do responsável não pode ter mais que 150 caracteres.")
        String email
) {
}
