package br.com.guiarural.backend.services.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CardapioRequestDTO(
        @NotNull(message = "A data do cardápio é obrigatória.")
        LocalDate data,

        @NotBlank(message = "O turno (Almoço/Jantar) é obrigatório.")
        String turno,

        @NotBlank(message = "O prato principal é obrigatório.")
        String pratoPrincipal,

        String opcaoVegetariana
) {}