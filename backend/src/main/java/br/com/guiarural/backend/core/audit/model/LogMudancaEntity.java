package br.com.guiarural.backend.core.audit.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class LogMudancaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String responsavel;
    private LocalDateTime dataHora;
    private String itemModificado;
    private String acao;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public String getItemModificado() { return itemModificado; }
    public void setItemModificado(String itemModificado) { this.itemModificado = itemModificado; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
}