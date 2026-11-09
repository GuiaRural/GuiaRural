package br.com.guiarural.backend.login.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Somente leitura aqui: o cadastro de administradores (UC13) ainda não tem escrita no backend.
@Entity
@Table(name = "admins")
public class AdminEntity {
    @Id
    private Long id;

    private String name;
    private String email;
    private String sector;
    // geral | editor | leitura
    private String permission;
    // ativo | aguardando | revogado
    private String status;
    // Hash BCrypt; nulo = a conta existe, mas não consegue entrar. Nunca sai pela API.
    private String passwordHash;

    protected AdminEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getSector() {
        return sector;
    }

    public String getPermission() {
        return permission;
    }

    public String getStatus() {
        return status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}
