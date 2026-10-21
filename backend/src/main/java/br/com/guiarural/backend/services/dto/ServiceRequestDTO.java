package br.com.guiarural.backend.services.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ServiceRequestDTO (
    @NotBlank(message = "O nome do serviço é obrigatório.")
    @Size(max = 100, message = "O nome não pode ter mais que 100 caracteres.")
    String name,

    @NotBlank(message = "A descrição do serviço é obrigatória.")
    String description,

    @NotBlank(message = "A referência do local é obrigatória.")
    String locationReference,

    @NotNull(message = "O status ativo/inativo é obrigatório.")
    Boolean active
) {}
