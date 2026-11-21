package br.com.guiarural.backend.messages.service;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

// Freio contra enxurrada de mensagens no formulário público (que não exige login). O limite é do formulário como um
// todo, não por pessoa: o backend fica atrás do proxy do Next e do Render e não identifica o visitante (RNF04: nada
// de rastrear o usuário). Em memória, instância única; reiniciar o servidor zera a contagem.
@Component
public class MessageRateLimiter {
    static final int MAX_MESSAGES = 20;
    static final Duration WINDOW = Duration.ofMinutes(10);

    private final Clock clock;
    private final Deque<Instant> accepted = new ArrayDeque<>();

    public MessageRateLimiter() {
        this(Clock.systemUTC());
    }

    MessageRateLimiter(Clock clock) {
        this.clock = clock;
    }

    // true e conta o envio, ou false quando a janela já está cheia.
    public synchronized boolean tryAcquire() {
        Instant now = clock.instant();
        Instant limit = now.minus(WINDOW);
        while (!accepted.isEmpty() && accepted.peekFirst().isBefore(limit)) {
            accepted.removeFirst();
        }
        if (accepted.size() >= MAX_MESSAGES) {
            return false;
        }
        accepted.addLast(now);
        return true;
    }
}
