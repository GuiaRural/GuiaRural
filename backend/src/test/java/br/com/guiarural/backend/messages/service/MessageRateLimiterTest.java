package br.com.guiarural.backend.messages.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MessageRateLimiterTest {
    // Relógio manual para avançar a janela sem esperar.
    private static class MutableClock extends Clock {
        private final AtomicReference<Instant> now = new AtomicReference<>(Instant.parse("2026-11-21T12:00:00Z"));

        void advance(Duration duration) {
            now.updateAndGet(i -> i.plus(duration));
        }

        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now.get(); }
    }

    @Test
    @DisplayName("Barra o envio acima do limite e libera quando a janela passa")
    void blocksAboveLimitUntilWindowPasses() {
        MutableClock clock = new MutableClock();
        MessageRateLimiter limiter = new MessageRateLimiter(clock);

        for (int i = 0; i < 20; i++) {
            assertTrue(limiter.tryAcquire(), "envio " + (i + 1) + " deveria passar");
        }
        assertFalse(limiter.tryAcquire());

        clock.advance(Duration.ofMinutes(10).plusSeconds(1));
        assertTrue(limiter.tryAcquire());
    }
}
