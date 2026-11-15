package br.com.guiarural.backend.login.dto;

import br.com.guiarural.backend.login.model.AdminPrincipal;

public record SessionDTO(Long adminId, String name, String email, String sector, String permission) {
    public static SessionDTO from(AdminPrincipal admin) {
        return new SessionDTO(admin.id(), admin.name(), admin.email(), admin.sector(), admin.permission());
    }
}
