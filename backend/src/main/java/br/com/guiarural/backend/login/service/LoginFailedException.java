package br.com.guiarural.backend.login.service;

import org.springframework.http.HttpStatus;

// reason: domain | invalid | blocked | rate_limited (a tela decide a mensagem; o texto aqui é genérico de propósito).
public class LoginFailedException extends RuntimeException {
    private final String reason;
    private final HttpStatus status;
    private final long retryAfterSeconds;

    public LoginFailedException(String reason, HttpStatus status, long retryAfterSeconds) {
        super("Não foi possível entrar.");
        this.reason = reason;
        this.status = status;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public String reason() {
        return reason;
    }

    public HttpStatus status() {
        return status;
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
