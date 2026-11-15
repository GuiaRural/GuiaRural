package br.com.guiarural.backend.login.controller;

import br.com.guiarural.backend.login.dto.LoginRequestDTO;
import br.com.guiarural.backend.login.dto.SessionDTO;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.service.AuthService;
import br.com.guiarural.backend.login.service.LoginFailedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

// Login do painel administrativo (UC12) e logout (UC24). A sessão fica no servidor; o navegador só recebe um
// cookie HttpOnly, então o JavaScript da página nunca enxerga o identificador da sessão.
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final SecurityContextRepository securityContextRepository;
    private final Duration sessionTimeout;
    private final Duration rememberTimeout;

    public AuthController(AuthService authService,
                          SecurityContextRepository securityContextRepository,
                          @Value("${guiarural.auth.session-timeout:8h}") Duration sessionTimeout,
                          @Value("${guiarural.auth.remember-timeout:7d}") Duration rememberTimeout) {
        this.authService = authService;
        this.securityContextRepository = securityContextRepository;
        this.sessionTimeout = sessionTimeout;
        this.rememberTimeout = rememberTimeout;
    }

    @PostMapping("/login")
    public ResponseEntity<SessionDTO> login(@Valid @RequestBody LoginRequestDTO dto,
                                            HttpServletRequest request,
                                            HttpServletResponse response) {
        AdminPrincipal admin = authService.authenticate(dto.email(), dto.password());

        // Novo identificador de sessão a cada login: impede a fixação de sessão.
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        HttpSession session = request.getSession(true);
        session.setMaxInactiveInterval((int) (dto.remember() ? rememberTimeout : sessionTimeout).toSeconds());

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(admin, null, admin.authorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return ResponseEntity.ok(SessionDTO.from(admin));
    }

    // Quem está logado agora; o painel usa para saber se a sessão ainda vale.
    @GetMapping("/me")
    public ResponseEntity<SessionDTO> me(@AuthenticationPrincipal AdminPrincipal admin) {
        return ResponseEntity.ok(SessionDTO.from(admin));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ProblemDetail> handleLoginFailed(LoginFailedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.status(), ex.getMessage());
        problem.setProperty("reason", ex.reason());
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(ex.status());
        if (ex.retryAfterSeconds() > 0) {
            builder.header("Retry-After", String.valueOf(ex.retryAfterSeconds()));
        }
        return builder.body(problem);
    }
}
