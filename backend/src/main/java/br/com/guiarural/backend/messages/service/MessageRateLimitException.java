package br.com.guiarural.backend.messages.service;

public class MessageRateLimitException extends RuntimeException {
    public MessageRateLimitException() {
        super("Muitas mensagens em pouco tempo. Tente novamente em alguns minutos.");
    }
}
