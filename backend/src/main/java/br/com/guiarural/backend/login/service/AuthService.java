package br.com.guiarural.backend.login.service;

import br.com.guiarural.backend.core.security.LoginAttemptLimiter;
import br.com.guiarural.backend.login.model.AdminEntity;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.repository.AdminRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    // RN-UC12-01: só e-mail institucional.
    static final String INSTITUTIONAL_DOMAIN = "@ufrpe.br";
    // RN-UC12-02: só contas ativas entram.
    static final String ACTIVE = "ativo";

    private final AdminRepository repository;
    private final PasswordEncoder encoder;
    private final LoginAttemptLimiter limiter;
    // Hash de uma senha aleatória: conferido quando o e-mail não existe, para o tempo de resposta não revelar se a conta existe.
    private final String dummyHash;

    public AuthService(AdminRepository repository, PasswordEncoder encoder, LoginAttemptLimiter limiter) {
        this.repository = repository;
        this.encoder = encoder;
        this.limiter = limiter;
        this.dummyHash = encoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(readOnly = true)
    public AdminPrincipal authenticate(String rawEmail, String password) {
        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.endsWith(INSTITUTIONAL_DOMAIN)) {
            throw new LoginFailedException("domain", HttpStatus.BAD_REQUEST, 0);
        }
        long wait = limiter.secondsUntilAllowed(email);
        if (wait > 0) {
            throw new LoginFailedException("rate_limited", HttpStatus.TOO_MANY_REQUESTS, wait);
        }

        Optional<AdminEntity> found = repository.findByEmail(email);
        String hash = found.map(AdminEntity::getPasswordHash).orElse(null);
        // Sempre uma conferência BCrypt, exista a conta ou não.
        boolean matches = encoder.matches(password, hash != null ? hash : dummyHash);
        if (hash == null || !matches) {
            limiter.recordFailure(email);
            throw new LoginFailedException("invalid", HttpStatus.UNAUTHORIZED, 0);
        }

        AdminEntity admin = found.get();
        // O bloqueio só é revelado a quem acertou a senha: errar continua sendo "credenciais inválidas".
        if (!ACTIVE.equals(admin.getStatus())) {
            throw new LoginFailedException("blocked", HttpStatus.FORBIDDEN, 0);
        }
        limiter.clear(email);
        return AdminPrincipal.from(admin);
    }
}
