package br.com.guiarural.backend.map.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// UC28: atualização dedicada da descrição do local pelo painel administrativo.
public record PlaceDescriptionRequestDTO(
        @NotBlank(message = "A descrição é obrigatória.")
        @Size(max = 5000, message = "A descrição não pode ter mais que 5000 caracteres.")
        String description
) {
}