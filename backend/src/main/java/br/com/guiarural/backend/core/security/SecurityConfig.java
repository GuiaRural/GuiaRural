package br.com.guiarural.backend.core.security;

import br.com.guiarural.backend.login.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

// Tudo que não está liberado aqui exige login (nega por padrão). Leitura do conteúdo do campus é pública;
// escrever exige administrador com permissão "geral" ou "editor" ("leitura" só consulta).
@Configuration
public class SecurityConfig {
    // Leituras públicas (mapa, cursos, guia, avisos, serviços). Não inclui /api/guide/translations, que é do painel.
    private static final String[] PUBLIC_READS = {
            "/api/places/**",
            "/api/departments/**",
            "/api/courses/**",
            "/api/search/**",
            "/api/avisos/**",
            "/api/services/**",
            "/api/menus/**",
            "/api/guide/topics/**",
            "/api/guide/search",
            "/api/guide/recife",
            "/api/guide/resources",
    };
    private static final HttpMethod[] WRITES = {HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE};

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http,
                                    SecurityContextRepository securityContextRepository,
                                    RestSecurityErrorHandler errorHandler,
                                    AdminRepository adminRepository,
                                    @Value("${server.servlet.session.cookie.secure:false}") boolean secureCookies) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");
        csrfRepository.setCookieCustomizer(cookie -> cookie.sameSite("Strict").secure(secureCookies));

        http
                // API consumida por fetch no mesmo domínio (via proxy do Next): sem formulário, Basic nem logout padrão.
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                // Login e formulário de contato são públicos (o visitante não tem sessão nem cookie CSRF ainda);
                // todo o resto das escritas exige o cabeçalho X-XSRF-TOKEN.
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers("/api/auth/login"))
                .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
                .addFilterAfter(new AdminSessionRefreshFilter(adminRepository, securityContextRepository), SecurityContextHolderFilter.class)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(errorHandler)
                        .accessDeniedHandler(errorHandler))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/health/**", "/error").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated();
                    auth.requestMatchers(HttpMethod.GET, PUBLIC_READS).permitAll();
                    // UC13: cadastrar, aprovar, mudar perfil e revogar administradores é só do perfil "geral". Vem antes
                    // do laço abaixo porque a primeira regra que casa é a que vale.
                    for (HttpMethod method : WRITES) {
                        auth.requestMatchers(method, "/api/admin/admins/**").hasRole("GERAL");
                    }
                    for (HttpMethod method : WRITES) {
                        auth.requestMatchers(method, "/api/**").hasAnyRole("GERAL", "EDITOR");
                    }
                    auth.anyRequest().authenticated();
                });
        return http.build();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
