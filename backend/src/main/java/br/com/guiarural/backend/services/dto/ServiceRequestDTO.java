package br.com.guiarural.backend.services.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

// Os mesmos campos do formulário do painel (UC19). Campos opcionais chegam nulos ou vazios.
public record ServiceRequestDTO(
        @NotBlank(message = "O nome do serviço é obrigatório.")
        @Size(max = 100, message = "O nome não pode ter mais que 100 caracteres.")
        String name,

        @NotBlank(message = "A descrição do serviço é obrigatória.")
        @Size(max = 2000, message = "A descrição não pode ter mais que 2000 caracteres.")
        String description,

        @NotBlank(message = "A categoria é obrigatória.")
        @Size(max = 100, message = "A categoria não pode ter mais que 100 caracteres.")
        String category,

        @NotBlank(message = "O setor responsável é obrigatório.")
        @Size(max = 150, message = "O setor não pode ter mais que 150 caracteres.")
        String sector,

        @NotEmpty(message = "Informe pelo menos um passo de \"Como solicitar\".")
        @Size(max = 30, message = "Use no máximo 30 passos.")
        // Passos em branco são descartados no serviço, que exige pelo menos um preenchido.
        List<@Size(max = 500, message = "Cada passo pode ter até 500 caracteres.") String> steps,

        @Size(max = 2000, message = "Os requisitos não podem ter mais que 2000 caracteres.")
        String requirements,

        // Links externos só por HTTPS (RNF02).
        @Pattern(regexp = "^https://\\S+\\.\\S+$", message = "O link deve começar com https://.")
        @Size(max = 500, message = "O link não pode ter mais que 500 caracteres.")
        String url,

        @Size(max = 200, message = "O prazo não pode ter mais que 200 caracteres.")
        String deadline,

        // Referência textual do local; o formulário atual não a pede.
        @Size(max = 255, message = "A referência do local não pode ter mais que 255 caracteres.")
        String locationReference,

        // RN-19.02: nulo ao criar = publicado; nulo ao editar = mantém o que está.
        Boolean active
) {
}
