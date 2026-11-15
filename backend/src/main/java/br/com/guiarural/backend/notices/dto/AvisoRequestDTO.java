package br.com.guiarural.backend.notices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AvisoRequestDTO(
    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 255, message = "O nome não pode ter mais que 255 caracteres.")
    String nome,
    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 2000, message = "A descrição não pode ter mais que 2000 caracteres.")
    String descricao
) {}
