package br.com.guiarural.backend.info.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// Somente leitura: o conteúdo do guia é escrito pelas migrations (e, no futuro, pelo painel admin autenticado).
@Entity
@Table(name = "guide_spots")
public class GuideSpotEntity {
    @Id
    private Long id;

    private String slug;
    private String titlePt;
    private String titleEn;
    private String titleEs;
    private String address;
    private String descriptionPt;
    private String descriptionEn;
    private String descriptionEs;
    private String tagLabelPt;
    private String tagLabelEn;
    private String tagLabelEs;
    private String tagTone;
    private String badgeLabelPt;
    private String badgeLabelEn;
    private String badgeLabelEs;
    private String badgeTone;
    private String distanceLabelPt;
    private String distanceLabelEn;
    private String distanceLabelEs;
    private String distanceIcon;
    private String imageUrl;
    private String imageAltPt;
    private String imageAltEn;
    private String imageAltEs;
    private String detailsLayout;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String detailsPt;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String detailsEn;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String detailsEs;
    private int position;

    protected GuideSpotEntity() {
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
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

    public String getAddress() {
        return address;
    }

    public String getDescriptionPt() {
        return descriptionPt;
    }

    public String getDescriptionEn() {
        return descriptionEn;
    }

    public String getDescriptionEs() {
        return descriptionEs;
    }

    public String getTagLabelPt() {
        return tagLabelPt;
    }

    public String getTagLabelEn() {
        return tagLabelEn;
    }

    public String getTagLabelEs() {
        return tagLabelEs;
    }

    public String getTagTone() {
        return tagTone;
    }

    public String getBadgeLabelPt() {
        return badgeLabelPt;
    }

    public String getBadgeLabelEn() {
        return badgeLabelEn;
    }

    public String getBadgeLabelEs() {
        return badgeLabelEs;
    }

    public String getBadgeTone() {
        return badgeTone;
    }

    public String getDistanceLabelPt() {
        return distanceLabelPt;
    }

    public String getDistanceLabelEn() {
        return distanceLabelEn;
    }

    public String getDistanceLabelEs() {
        return distanceLabelEs;
    }

    public String getDistanceIcon() {
        return distanceIcon;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getImageAltPt() {
        return imageAltPt;
    }

    public String getImageAltEn() {
        return imageAltEn;
    }

    public String getImageAltEs() {
        return imageAltEs;
    }

    public String getDetailsLayout() {
        return detailsLayout;
    }

    public String getDetailsPt() {
        return detailsPt;
    }

    public String getDetailsEn() {
        return detailsEn;
    }

    public String getDetailsEs() {
        return detailsEs;
    }

    public int getPosition() {
        return position;
    }
}
