package br.com.guiarural.backend.info.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Somente leitura: o conteúdo do guia é escrito pelas migrations (e, no futuro, pelo painel admin autenticado).
@Entity
@Table(name = "guide_tips")
public class GuideTipEntity {
    @Id
    private Long id;

    private String slug;
    private String icon;
    private String titlePt;
    private String titleEn;
    private String titleEs;
    private String textPt;
    private String textEn;
    private String textEs;
    private String linkLabelPt;
    private String linkLabelEn;
    private String linkLabelEs;
    private String linkHref;
    private int position;

    protected GuideTipEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getIcon() {
        return icon;
    }

    public String getTitlePt() {
        return titlePt;
    }

    public String getTitleEn() {
        return titleEn;
    }

    public String getTitleEs() {
        return titleEs;
    }

    public String getTextPt() {
        return textPt;
    }

    public String getTextEn() {
        return textEn;
    }

    public String getTextEs() {
        return textEs;
    }

    public String getLinkLabelPt() {
        return linkLabelPt;
    }

    public String getLinkLabelEn() {
        return linkLabelEn;
    }

    public String getLinkLabelEs() {
        return linkLabelEs;
    }

    public String getLinkHref() {
        return linkHref;
    }

    public int getPosition() {
        return position;
    }
}
