package br.com.guiarural.backend.notices.dto;

import jakarta.validation.constraints.NotBlank;

public record AvisoRequestDTO(
    @NotBlank(message = "O nome é obrigatório") String nome,
    @NotBlank(message = "A descrição é obrigatória") String descricao
) {}
