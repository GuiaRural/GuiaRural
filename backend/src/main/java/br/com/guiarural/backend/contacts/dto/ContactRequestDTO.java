package br.com.guiarural.backend.contacts.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContactRequestDTO (
    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
    String name,

    @Email(message = "O e-mail deve ter um formato válido")
    @Size(max = 150)
    String email,

    @Size(max = 20)
    String phone,

    @NotNull(message = "O identificador do local (place_id) é obrigatório")
    Long placeId
){}
