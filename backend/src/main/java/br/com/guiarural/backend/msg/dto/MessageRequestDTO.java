package br.com.guiarural.backend.msg.dto;

import br.com.guiarural.backend.msg.model.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageRequestDTO (
    @NotBlank(message = "O nome é obrigatório") 
    String nome,

    @NotBlank(message = "O e-mail é obrigatório") 
    @Email(message = "Formato de e-mail inválido") 
    String email,

    String telefone,

    @NotBlank(message = "A mensagem é obrigatória") 
    @Size(max = 500, message = "A mensagem deve ter no máximo 500 caracteres") 
    String mensagem
) {
    public Message toEntity() {
        return new Message(this.nome, this.email, this.telefone, this.mensagem);
    }
}
