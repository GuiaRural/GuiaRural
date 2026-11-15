package br.com.guiarural.backend.core.security;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

// Barra tentativas de adivinhar a senha: no máximo MAX_FAILURES erros por e-mail dentro da janela.
// Fica em memória (backend monolítico, instância única); reiniciar o servidor zera os contadores.
@Component
public class LoginAttemptLimiter {
    static final int MAX_FAILURES = 5;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private final Clock clock;
    private final ConcurrentHashMap<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public LoginAttemptLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    // Segundos até poder tentar de novo; 0 quando ainda há tentativas.
    public long secondsUntilAllowed(String key) {
        Deque<Instant> recent = failures.get(key);
        if (recent == null) {
            return 0;
        }
        synchronized (recent) {
            prune(recent);
            if (recent.size() < MAX_FAILURES) {
                return 0;
            }
            Instant releaseAt = recent.peekFirst().plus(WINDOW);
            return Math.max(1, Duration.between(clock.instant(), releaseAt).toSeconds());
        }
    }

    public void recordFailure(String key) {
        Deque<Instant> recent = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (recent) {
            prune(recent);
            recent.addLast(clock.instant());
        }
    }

    public void clear(String key) {
        failures.remove(key);
    }

    private void prune(Deque<Instant> recent) {
        Instant limit = clock.instant().minus(WINDOW);
        while (!recent.isEmpty() && recent.peekFirst().isBefore(limit)) {
            recent.removeFirst();
        }
    }
}
