package br.com.guiarural.backend.map.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Set;

// Campos do formulário de local do painel (UC14), conforme a decisão D1 do plano de integração: além do núcleo,
// serviços (do catálogo), cursos vinculados, horário e responsável. A foto vai por endpoint próprio.
// Categoria, status e as regras de publicação (RN-UC14.01) são conferidos no PlaceAdminService.
public record PlaceRequestDTO(
        // Opcional ao criar: em branco, o servidor gera a partir do nome. Não muda depois de criado (é a URL do local).
        @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "O identificador deve ter só letras minúsculas, números e hífens.")
        @Size(max = 100, message = "O identificador não pode ter mais que 100 caracteres.")
        String slug,

        @NotBlank(message = "O nome do local é obrigatório.")
        @Size(max = 150, message = "O nome não pode ter mais que 150 caracteres.")
        String name,

        @Size(max = 60, message = "O nome curto não pode ter mais que 60 caracteres.")
        String shortName,

        @NotBlank(message = "A categoria é obrigatória.")
        String category,

        @NotBlank(message = "O status é obrigatório.")
        String status,

        @DecimalMin(value = "-90", message = "A latitude deve estar entre -90 e 90.")
        @DecimalMax(value = "90", message = "A latitude deve estar entre -90 e 90.")
        Double latitude,

        @DecimalMin(value = "-180", message = "A longitude deve estar entre -180 e 180.")
        @DecimalMax(value = "180", message = "A longitude deve estar entre -180 e 180.")
        Double longitude,

        // De onde veio a coordenada (ajuda a saber o que ainda precisa de conferência em campo).
        @Size(max = 200, message = "A origem da coordenada não pode ter mais que 200 caracteres.")
        String coordinatesSource,

        @Size(max = 255, message = "O endereço não pode ter mais que 255 caracteres.")
        String address,

        @Size(max = 200, message = "O horário não pode ter mais que 200 caracteres.")
        String hours,

        @Size(max = 5000, message = "A descrição não pode ter mais que 5000 caracteres.")
        String description,

        @Size(max = 100, message = "Use no máximo 100 serviços.")
        Set<Long> serviceIds,

        @Size(max = 100, message = "Use no máximo 100 cursos.")
        Set<Long> courseIds,

        @Size(max = 5, message = "Use no máximo 5 responsáveis.")
        List<@Valid PlaceContactDTO> contacts
) {
}
