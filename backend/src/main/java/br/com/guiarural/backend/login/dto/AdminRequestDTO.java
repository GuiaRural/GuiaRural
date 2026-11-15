package br.com.guiarural.backend.login.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Cadastro de administrador (UC13). A senha é definida por quem cadastra (D3) e só existe aqui: o servidor guarda o
// hash BCrypt e nunca a devolve. O teto de 72 é o limite do BCrypt.
public record AdminRequestDTO(
        @NotBlank(message = "O nome é obrigatório.") @Size(max = 200, message = "Nome com no máximo 200 caracteres.") String name,
        @NotBlank(message = "O e-mail é obrigatório.") @Size(max = 254, message = "E-mail longo demais.") String email,
        @NotBlank(message = "O setor é obrigatório.") @Size(max = 120, message = "Setor com no máximo 120 caracteres.") String sector,
        @NotBlank(message = "A permissão é obrigatória.")
        @Pattern(regexp = "geral|editor|leitura", message = "Permissão inválida.") String permission,
        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve ter de 8 a 72 caracteres.") String password
) {
    // Sem a senha: o record vira texto em logs de erro e de validação.
    @Override
    public String toString() {
        return "AdminRequestDTO[name=" + name + ", email=" + email + ", sector=" + sector + ", permission=" + permission + "]";
    }
}
