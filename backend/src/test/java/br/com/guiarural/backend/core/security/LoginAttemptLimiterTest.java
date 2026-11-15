package br.com.guiarural.backend.core.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptLimiterTest {
    // Relógio que o teste avança à mão.
    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-11-09T12:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private final MutableClock clock = new MutableClock();
    private final LoginAttemptLimiter limiter = new LoginAttemptLimiter(clock);

    private void fail(String key, int times) {
        for (int i = 0; i < times; i++) {
            limiter.recordFailure(key);
        }
    }

    @Test
    @DisplayName("Deve permitir tentar até o limite de erros")
    void shouldAllowUntilLimit() {
        fail("a@ufrpe.br", LoginAttemptLimiter.MAX_FAILURES - 1);

        assertEquals(0, limiter.secondsUntilAllowed("a@ufrpe.br"));
    }

    @Test
    @DisplayName("Deve bloquear ao atingir o limite e informar quanto falta")
    void shouldBlockAtLimit() {
        fail("a@ufrpe.br", LoginAttemptLimiter.MAX_FAILURES);

        long wait = limiter.secondsUntilAllowed("a@ufrpe.br");

        assertTrue(wait > 0 && wait <= LoginAttemptLimiter.WINDOW.toSeconds());
    }

    @Test
    @DisplayName("Deve contar por e-mail, sem afetar outras contas")
    void shouldTrackEachEmailSeparately() {
        fail("a@ufrpe.br", LoginAttemptLimiter.MAX_FAILURES);

        assertEquals(0, limiter.secondsUntilAllowed("b@ufrpe.br"));
    }

    @Test
    @DisplayName("Deve liberar depois que a janela passa")
    void shouldReleaseAfterWindow() {
        fail("a@ufrpe.br", LoginAttemptLimiter.MAX_FAILURES);

        clock.advance(LoginAttemptLimiter.WINDOW.plusSeconds(1));

        assertEquals(0, limiter.secondsUntilAllowed("a@ufrpe.br"));
    }

    @Test
    @DisplayName("Deve zerar os erros depois de um login correto")
    void shouldClearAfterSuccess() {
        fail("a@ufrpe.br", LoginAttemptLimiter.MAX_FAILURES);

        limiter.clear("a@ufrpe.br");

        assertEquals(0, limiter.secondsUntilAllowed("a@ufrpe.br"));
    }
}
