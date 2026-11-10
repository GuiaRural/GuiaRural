package br.com.guiarural.backend.menus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Os mesmos campos do formulário do painel (UC25/UC26). RN-01: data, turno, prato principal e opção vegetariana
// são obrigatórios; os demais chegam nulos ou vazios.
public record MenuRequestDTO(
        @NotNull(message = "A data de referência é obrigatória.")
        LocalDate date,

        @NotBlank(message = "O turno é obrigatório.")
        @Pattern(regexp = "almoco|jantar", message = "O turno deve ser almoco ou jantar.")
        String shift,

        @NotBlank(message = "O prato principal é obrigatório.")
        @Size(max = 200, message = "O prato principal pode ter até 200 caracteres.")
        String main,

        @NotBlank(message = "A opção vegetariana é obrigatória.")
        @Size(max = 200, message = "A opção vegetariana pode ter até 200 caracteres.")
        String vegetarian,

        @Size(max = 200, message = "Os acompanhamentos podem ter até 200 caracteres.")
        String sides,

        @Size(max = 200, message = "A salada pode ter até 200 caracteres.")
        String salad,

        @Size(max = 200, message = "A sobremesa pode ter até 200 caracteres.")
        String dessert,

        @Size(max = 200, message = "A bebida pode ter até 200 caracteres.")
        String drink
) {
}
