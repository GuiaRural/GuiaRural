package br.com.guiarural.backend.login.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.Serializable;
import java.util.List;
import java.util.Locale;

// O administrador autenticado, guardado na sessão. Não leva o hash da senha.
public record AdminPrincipal(Long id, String name, String email, String sector, String permission)
        implements Serializable {

    public static AdminPrincipal from(AdminEntity admin) {
        return new AdminPrincipal(admin.getId(), admin.getName(), admin.getEmail(), admin.getSector(), admin.getPermission());
    }

    // geral -> ROLE_GERAL, editor -> ROLE_EDITOR, leitura -> ROLE_LEITURA.
    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + permission.toUpperCase(Locale.ROOT)));
    }
}
