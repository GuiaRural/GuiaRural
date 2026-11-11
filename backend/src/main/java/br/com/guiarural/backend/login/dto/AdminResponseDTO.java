package br.com.guiarural.backend.login.dto;

import br.com.guiarural.backend.login.model.AdminEntity;

// Também é o snapshot do histórico: não tem (e não pode ter) a senha nem o hash.
public record AdminResponseDTO(Long id, String name, String email, String sector, String permission, String status) {
    public static AdminResponseDTO from(AdminEntity admin) {
        return new AdminResponseDTO(admin.getId(), admin.getName(), admin.getEmail(), admin.getSector(),
                admin.getPermission(), admin.getStatus());
    }
}
