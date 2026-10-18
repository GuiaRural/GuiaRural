package br.com.guiarural.backend.services.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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
}
