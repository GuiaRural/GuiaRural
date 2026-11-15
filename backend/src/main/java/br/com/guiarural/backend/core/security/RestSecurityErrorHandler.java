package br.com.guiarural.backend.core.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;

// 401 (sem sessão) e 403 (sem permissão) como ProblemDetail, o mesmo formato dos demais erros da API.
@Component
public class RestSecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {
    private final JsonMapper jsonMapper;

    public RestSecurityErrorHandler(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
            throws IOException {
        write(response, HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException exception)
            throws IOException {
        write(response, HttpStatus.FORBIDDEN, "Sem permissão para esta ação.");
    }

    private void write(HttpServletResponse response, HttpStatus status, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonMapper.writeValueAsString(ProblemDetail.forStatusAndDetail(status, detail)));
    }
}
