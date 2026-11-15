package br.com.guiarural.backend.services.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "services")
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String locationReference;
    private Boolean active;
    // Texto livre por decisão do time, até existir uma lista oficial de categorias.
    private String category;
    // Setor responsável pelo serviço.
    private String sector;
    // "Como solicitar": passos na ordem em que o estudante deve seguir.
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] steps = new String[0];
    private String requirements;
    private String url;
    // Só para serviços disponíveis por um período (ex.: "Inscrições até 28/02").
    private String deadline;

    public ServiceEntity() {
    }

    public ServiceEntity(Long id, String name, String description, String locationReference, Boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.locationReference = locationReference;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocationReference() {
        return locationReference;
    }

    public void setLocationReference(String locationReference) {
        this.locationReference = locationReference;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String[] getSteps() {
        return steps;
    }

    public void setSteps(String[] steps) {
        this.steps = steps;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }
}
