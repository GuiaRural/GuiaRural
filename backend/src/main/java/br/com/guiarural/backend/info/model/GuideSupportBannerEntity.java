package br.com.guiarural.backend.info.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Somente leitura: o conteúdo do guia é escrito pelas migrations (e, no futuro, pelo painel admin autenticado).
@Entity
@Table(name = "guide_support_banners")
public class GuideSupportBannerEntity {
    @Id
    private Long id;

    private String slug;
    private String beforePt;
    private String beforeEn;
    private String beforeEs;
    private String highlight;
    private String afterPt;
    private String afterEn;
    private String afterEs;
    private String ctaLabelPt;
    private String ctaLabelEn;
    private String ctaLabelEs;
    private String ctaHref;

    protected GuideSupportBannerEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getBeforePt() {
        return beforePt;
    }

    public String getBeforeEn() {
        return beforeEn;
    }

    public String getBeforeEs() {
        return beforeEs;
    }

    public String getHighlight() {
        return highlight;
    }

    public String getAfterPt() {
        return afterPt;
    }

    public String getAfterEn() {
        return afterEn;
    }

    public String getAfterEs() {
        return afterEs;
    }

    public String getCtaLabelPt() {
        return ctaLabelPt;
    }

    public String getCtaLabelEn() {
        return ctaLabelEn;
    }

    public String getCtaLabelEs() {
        return ctaLabelEs;
    }

    public String getCtaHref() {
        return ctaHref;
    }
}
