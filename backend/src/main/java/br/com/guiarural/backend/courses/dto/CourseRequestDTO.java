package br.com.guiarural.backend.courses.dto;

import br.com.guiarural.backend.courses.model.CourseLevel;
import br.com.guiarural.backend.courses.model.CourseType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Cadastro e edição de curso pelo painel (UC35). Sem matriz curricular (Fase 5c) e sem traduções (Fase 6).
// Os limites de tamanho são do formulário: o banco só exige nome não vazio, nível, tipo e departamento.
// Nível × tipo e departamento ativo são conferidos no CourseService.
public record CourseRequestDTO(
        @NotNull(message = "O departamento é obrigatório.") Long departmentId,
        // RN-UC35-01
        @NotBlank(message = "O nome do curso é obrigatório.")
        @Size(max = 200, message = "Nome com no máximo 200 caracteres.") String name,
        @NotNull(message = "O nível é obrigatório.") CourseLevel level,
        @NotNull(message = "O tipo é obrigatório.") CourseType type,
        @Size(max = 30, message = "Código com no máximo 30 caracteres.") String code,
        @Size(max = 60, message = "Modalidade com no máximo 60 caracteres.") String modality,
        @Size(max = 60, message = "Turno com no máximo 60 caracteres.") String shift,
        @Min(value = 1, message = "A duração deve ser de pelo menos 1 semestre.")
        @Max(value = 30, message = "A duração deve ser de no máximo 30 semestres.") Short durationSemesters,
        @Min(value = 1, message = "A carga horária deve ser positiva.")
        @Max(value = 32767, message = "Carga horária acima do limite.") Integer totalWorkloadHours,
        @Min(value = 1, message = "A nota do MEC vai de 1 a 5.")
        @Max(value = 5, message = "A nota do MEC vai de 1 a 5.") Short mecGrade,
        @Min(value = 1, message = "A nota da CAPES vai de 1 a 7.")
        @Max(value = 7, message = "A nota da CAPES vai de 1 a 7.") Short capesGrade,
        @Size(max = 5000, message = "Descrição com no máximo 5000 caracteres.") String description,
        // Nulo: no cadastro o curso nasce ativo; na edição, mantém como estava.
        Boolean active,
        @Size(max = 200, message = "Nome do coordenador com no máximo 200 caracteres.") String coordinatorName,
        @Size(max = 200, message = "Nome do vice com no máximo 200 caracteres.") String viceCoordinatorName,
        @Size(max = 200, message = "Local de atendimento com no máximo 200 caracteres.") String officeLocation,
        @Size(max = 200, message = "Horário com no máximo 200 caracteres.") String officeHours,
        @Size(max = 200, message = "Forma de atendimento com no máximo 200 caracteres.") String attendanceMode,
        @Size(max = 30, message = "Telefone com no máximo 30 caracteres.") String phone,
        @Size(max = 10, message = "Ramal com no máximo 10 caracteres.") String extension,
        @Email(message = "E-mail inválido.") @Size(max = 254, message = "E-mail longo demais.") String email,
        @Email(message = "E-mail secundário inválido.")
        @Size(max = 254, message = "E-mail secundário longo demais.") String secondaryEmail
) {
}
