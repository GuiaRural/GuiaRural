package br.com.guiarural.backend.login.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Cadastro de administradores (UC13). A linha nunca é apagada (a auditoria aponta para ela): quem sai vira "revogado".
@Entity
@Table(name = "admins")
public class AdminEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    public AdminEntity(String name, String email, String sector, String permission, String status, String passwordHash) {
        this.name = name;
        this.email = email;
        this.sector = sector;
        this.permission = permission;
        this.status = status;
        this.passwordHash = passwordHash;
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

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}
