package br.com.guiarural.backend.services.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class CardapioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate data;
    private String turno;
    private String pratoPrincipal;
    private String opcaoVegetariana;

    public CardapioEntity() {}

    // Getters e Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }
    public String getPratoPrincipal() { return pratoPrincipal; }
    public void setPratoPrincipal(String pratoPrincipal) { this.pratoPrincipal = pratoPrincipal; }
    public String getOpcaoVegetariana() { return opcaoVegetariana; }
    public void setOpcaoVegetariana(String opcaoVegetariana) { this.opcaoVegetariana = opcaoVegetariana; }
}