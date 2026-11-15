package br.com.guiarural.backend.login.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// A senha tem teto de tamanho para a conferência BCrypt não virar vetor de negação de serviço.
public record LoginRequestDTO(
        @NotBlank @Size(max = 254) String email,
        @NotBlank @Size(max = 128) String password,
        // "Manter conectado": a sessão do servidor dura mais tempo sem uso.
        boolean remember
) {
}
