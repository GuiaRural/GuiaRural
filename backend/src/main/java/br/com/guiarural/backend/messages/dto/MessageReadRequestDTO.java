package br.com.guiarural.backend.messages.dto;

import jakarta.validation.constraints.NotNull;

public record MessageReadRequestDTO(@NotNull(message = "Informe se a mensagem foi lida.") Boolean read) {}
