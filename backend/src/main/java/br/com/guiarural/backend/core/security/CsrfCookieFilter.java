package br.com.guiarural.backend.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// O token CSRF é gerado sob demanda; ler o valor aqui faz o cookie XSRF-TOKEN ir na resposta de qualquer requisição,
// e o frontend o devolve no cabeçalho X-XSRF-TOKEN nas escritas.
public class CsrfCookieFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (token != null) {
            token.getToken();
        }
        chain.doFilter(request, response);
    }
}
