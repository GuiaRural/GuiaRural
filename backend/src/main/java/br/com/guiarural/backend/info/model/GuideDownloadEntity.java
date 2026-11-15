package br.com.guiarural.backend.info.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Somente leitura: o conteúdo do guia é escrito pelas migrations (e, no futuro, pelo painel admin autenticado).
@Entity
@Table(name = "guide_downloads")
public class GuideDownloadEntity {
    @Id
    private Long id;

    private String labelPt;
    private String labelEn;
    private String labelEs;
    private String languageLabel;
    private String href;
    private int position;

    protected GuideDownloadEntity() {
    }

    public Long getId() {
        return id;
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

    public String getLanguageLabel() {
        return languageLabel;
    }

    public String getHref() {
        return href;
    }

    public int getPosition() {
        return position;
    }
}
