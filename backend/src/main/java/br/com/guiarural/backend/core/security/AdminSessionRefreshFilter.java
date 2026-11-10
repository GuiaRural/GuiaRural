package br.com.guiarural.backend.core.security;

import br.com.guiarural.backend.login.model.AdminEntity;
import br.com.guiarural.backend.login.model.AdminPrincipal;
import br.com.guiarural.backend.login.repository.AdminRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

// A sessão guarda uma cópia do administrador feita no login. Sem esta conferência, uma conta revogada (UC13) continuaria
// usando o painel até a sessão expirar, e uma troca de perfil só valeria no próximo login. A cada requisição autenticada,
// relê a conta: se não está mais "ativo", encerra a sessão (a requisição segue como anônima e recebe 401); se o perfil ou
// os dados mudaram, atualiza a sessão.
// Não é @Component de propósito: registrado como bean, o Spring o aplicaria também fora da cadeia de segurança.
public class AdminSessionRefreshFilter extends OncePerRequestFilter {
    private static final String ACTIVE = "ativo";

    private final AdminRepository repository;
    private final SecurityContextRepository contextRepository;

    public AdminSessionRefreshFilter(AdminRepository repository, SecurityContextRepository contextRepository) {
        this.repository = repository;
        this.contextRepository = contextRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AdminPrincipal current) {
            Optional<AdminEntity> stored = repository.findById(current.id());
            if (stored.isEmpty() || !ACTIVE.equals(stored.get().getStatus())) {
                endSession(request);
            } else {
                AdminPrincipal fresh = AdminPrincipal.from(stored.get());
                if (!fresh.equals(current)) {
                    replacePrincipal(fresh, request, response);
                }
            }
        }
        chain.doFilter(request, response);
    }

    private void endSession(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    private void replacePrincipal(AdminPrincipal admin, HttpServletRequest request, HttpServletResponse response) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(admin, null, admin.authorities()));
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
    }
}
