package br.com.guiarural.backend.core.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

// RNF06: o histórico só recebe inserções (a tabela tem trigger que bloqueia update, delete e truncate).
@Entity
@Immutable
@Table(name = "audit_logs")
public class AuditLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "at")
    private Instant occurredAt;

    private Long adminId;
    // Nome no momento da ação: continua legível se o cadastro mudar depois.
    private String author;
    // local | servico | cardapio | aviso | acolhimento | administrador
    private String entity;
    private String entityId;
    private String entityName;
    // criado | editado | deletado | restaurado
    private String action;

    // Estados antes e depois (base do "desfazer"); nulos quando o registro não existia / deixou de existir.
    @JdbcTypeCode(SqlTypes.JSON)
    private String beforeState;
    @JdbcTypeCode(SqlTypes.JSON)
    private String afterState;

    protected AuditLogEntity() {
    }

    public AuditLogEntity(Long adminId, String author, String entity, String entityId, String entityName,
                          String action, String beforeState, String afterState) {
        this.occurredAt = Instant.now();
        this.adminId = adminId;
        this.author = author;
        this.entity = entity;
        this.entityId = entityId;
        this.entityName = entityName;
        this.action = action;
        this.beforeState = beforeState;
        this.afterState = afterState;
    }

    public Long getId() {
        return id;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public Long getAdminId() {
        return adminId;
    }

    public String getAuthor() {
        return author;
    }

    public String getEntity() {
        return entity;
    }

    public String getEntityId() {
        return entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getAction() {
        return action;
    }

    public String getBeforeState() {
        return beforeState;
    }

    public String getAfterState() {
        return afterState;
    }
}
