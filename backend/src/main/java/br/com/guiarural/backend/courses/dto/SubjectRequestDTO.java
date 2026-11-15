package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.SubjectNature;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

// Uma disciplina da matriz curricular, enviada junto com o curso (UC35, FA-35.01).
// Código repetido na mesma matriz e vírgula dentro de um pré-requisito são conferidos no CourseService.
public record SubjectRequestDTO(
        // Nulo = bloco "Optativas / Eletivas".
        @Min(value = 1, message = "O período vai de 1 a 12.")
        @Max(value = 12, message = "O período vai de 1 a 12.") Short period,
        @NotBlank(message = "O código da disciplina é obrigatório.")
        @Size(max = 30, message = "Código com no máximo 30 caracteres.") String code,
        @NotBlank(message = "O nome da disciplina é obrigatório.")
        @Size(max = 200, message = "Nome com no máximo 200 caracteres.") String name,
        @Size(max = 5000, message = "Ementa com no máximo 5000 caracteres.") String syllabus,
        @NotNull(message = "A carga horária é obrigatória.")
        @Min(value = 1, message = "A carga horária deve ser positiva.")
        @Max(value = 32767, message = "Carga horária acima do limite.") Short workloadHours,
        @Min(value = 0, message = "Os créditos não podem ser negativos.")
        @Max(value = 100, message = "Créditos acima do limite.") Short credits,
        @NotNull(message = "A natureza é obrigatória.") SubjectNature nature,
        @Size(max = 30, message = "No máximo 30 pré-requisitos.")
        List<@NotBlank(message = "Pré-requisito em branco.")
             @Size(max = 30, message = "Código de pré-requisito com no máximo 30 caracteres.") String> prerequisites
) {
}
