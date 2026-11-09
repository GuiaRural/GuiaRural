package br.com.guiarural.backend.login;

import br.com.guiarural.backend.core.security.LoginAttemptLimiter;
import br.com.guiarural.backend.login.model.AdminEntity;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.repository.AdminRepository;
import br.com.guiarural.backend.login.service.AuthService;
import br.com.guiarural.backend.login.service.LoginFailedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    // Custo baixo só para o teste ser rápido.
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Mock
    private AdminRepository repository;

    private AuthService service() {
        return new AuthService(repository, encoder, new LoginAttemptLimiter());
    }

    private AdminEntity admin(String status, String password) {
        AdminEntity admin = BeanUtils.instantiateClass(AdminEntity.class);
        ReflectionTestUtils.setField(admin, "id", 7L);
        ReflectionTestUtils.setField(admin, "name", "Equipe de Comunicação");
        ReflectionTestUtils.setField(admin, "email", "equipe@ufrpe.br");
        ReflectionTestUtils.setField(admin, "sector", "Comunicação");
        ReflectionTestUtils.setField(admin, "permission", "editor");
        ReflectionTestUtils.setField(admin, "status", status);
        ReflectionTestUtils.setField(admin, "passwordHash", password == null ? null : encoder.encode(password));
        return admin;
    }

    private LoginFailedException failure(AuthService service, String email, String password) {
        return assertThrows(LoginFailedException.class, () -> service.authenticate(email, password));
    }

    @Test
    @DisplayName("Deve entrar com e-mail institucional, senha correta e conta ativa")
    void shouldAuthenticateActiveAdmin() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("ativo", "senha-correta")));

        AdminPrincipal principal = service().authenticate("  Equipe@UFRPE.br ", "senha-correta");

        assertEquals(7L, principal.id());
        assertEquals("editor", principal.permission());
        assertEquals("ROLE_EDITOR", principal.authorities().get(0).getAuthority());
    }

    @Test
    @DisplayName("Deve recusar e-mail fora do domínio institucional sem consultar o banco")
    void shouldRejectNonInstitutionalEmail() {
        LoginFailedException error = failure(service(), "alguem@gmail.com", "x");

        assertEquals("domain", error.reason());
        assertEquals(HttpStatus.BAD_REQUEST, error.status());
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("Deve tratar e-mail inexistente e senha errada do mesmo jeito (sem revelar a conta)")
    void shouldNotRevealWhetherAccountExists() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("ativo", "senha-correta")));
        when(repository.findByEmail("fantasma@ufrpe.br")).thenReturn(Optional.empty());
        AuthService service = service();

        LoginFailedException wrongPassword = failure(service, "equipe@ufrpe.br", "errada");
        LoginFailedException unknown = failure(service, "fantasma@ufrpe.br", "qualquer");

        assertEquals("invalid", wrongPassword.reason());
        assertEquals("invalid", unknown.reason());
        assertEquals(wrongPassword.status(), unknown.status());
        assertEquals(wrongPassword.getMessage(), unknown.getMessage());
    }

    @Test
    @DisplayName("Deve recusar conta sem hash de senha como credenciais inválidas")
    void shouldRejectAccountWithoutPassword() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("ativo", null)));

        assertEquals("invalid", failure(service(), "equipe@ufrpe.br", "qualquer").reason());
    }

    @Test
    @DisplayName("Deve revelar o bloqueio só a quem acertou a senha")
    void shouldRevealBlockedOnlyWithCorrectPassword() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("revogado", "senha-correta")));
        AuthService service = service();

        assertEquals("invalid", failure(service, "equipe@ufrpe.br", "errada").reason());
        LoginFailedException blocked = failure(service, "equipe@ufrpe.br", "senha-correta");

        assertEquals("blocked", blocked.reason());
        assertEquals(HttpStatus.FORBIDDEN, blocked.status());
    }

    @Test
    @DisplayName("Deve barrar a conta depois de muitos erros, mesmo com a senha certa")
    void shouldRateLimitAfterRepeatedFailures() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("ativo", "senha-correta")));
        AuthService service = service();
        for (int i = 0; i < 5; i++) {
            failure(service, "equipe@ufrpe.br", "errada");
        }

        LoginFailedException limited = failure(service, "equipe@ufrpe.br", "senha-correta");

        assertEquals("rate_limited", limited.reason());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, limited.status());
        assertTrue(limited.retryAfterSeconds() > 0);
    }

    @Test
    @DisplayName("Deve zerar a contagem de erros depois de um login correto")
    void shouldResetFailuresAfterSuccess() {
        when(repository.findByEmail("equipe@ufrpe.br")).thenReturn(Optional.of(admin("ativo", "senha-correta")));
        AuthService service = service();
        for (int i = 0; i < 4; i++) {
            failure(service, "equipe@ufrpe.br", "errada");
        }

        service.authenticate("equipe@ufrpe.br", "senha-correta");
        // Sem o reset, este quinto erro já esgotaria o limite.
        failure(service, "equipe@ufrpe.br", "errada");

        assertEquals("invalid", failure(service, "equipe@ufrpe.br", "errada").reason());
    }
}
