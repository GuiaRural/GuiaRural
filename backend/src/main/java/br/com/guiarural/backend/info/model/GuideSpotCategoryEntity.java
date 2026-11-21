package br.com.guiarural.backend.info.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Somente leitura: a lista de categorias do filtro do Guia de Recife é escrita pelas migrations.
@Entity
@Table(name = "guide_spot_categories")
public class GuideSpotCategoryEntity {
    @Id
    private Long id;

    private String slug;
    private String labelPt;
    private String labelEn;
    private String labelEs;
    private int position;

    protected GuideSpotCategoryEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getLabelPt() {
        return labelPt;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public String getLabelEs() {
        return labelEs;
    }

    public int getPosition() {
        return position;
    }
}
