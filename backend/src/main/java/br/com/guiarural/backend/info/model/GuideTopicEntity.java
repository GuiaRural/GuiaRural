package br.com.guiarural.backend.info.model;

import br.com.guiarural.backend.map.model.PlaceEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// O conteúdo do guia nasce nas migrations e é mantido pelo painel administrativo (GuideTopicWriteService).
@Entity
@Table(name = "guide_topics")
public class GuideTopicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slug;
    private String section;
    private String stage;
    private String titlePt;
    private String titleEn;
    private String titleEs;
    private String summaryPt;
    private String summaryEn;
    private String summaryEs;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String blocksPt;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String blocksEn;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String blocksEs;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String linksPt;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String linksEn;
    // jsonb lido como texto; o service o converte em JSON de verdade na resposta.
    @JdbcTypeCode(SqlTypes.JSON)
    private String linksEs;
    private String sourcePt;
    private String sourceEn;
    private String sourceEs;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private PlaceEntity place;
    private int position;
    // Idiomas (en, es) em que todos os textos do tópico estão traduzidos; o português é sempre completo.
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] fullyTranslatedLangs;

    protected GuideTopicEntity() {
    }

    public static GuideTopicEntity create(String slug, int position) {
        GuideTopicEntity topic = new GuideTopicEntity();
        topic.slug = slug;
        topic.position = position;
        return topic;
    }

    // Aplica o conteúdo editável pelo painel; o slug e a posição não mudam na edição.
    public void apply(GuideTopicContent content, PlaceEntity place) {
        this.section = content.section();
        this.stage = content.stage();
        this.titlePt = content.titlePt();
        this.titleEn = content.titleEn();
        this.titleEs = content.titleEs();
        this.summaryPt = content.summaryPt();
        this.summaryEn = content.summaryEn();
        this.summaryEs = content.summaryEs();
        this.blocksPt = content.blocksPt();
        this.blocksEn = content.blocksEn();
        this.blocksEs = content.blocksEs();
        this.linksPt = content.linksPt();
        this.linksEn = content.linksEn();
        this.linksEs = content.linksEs();
        this.sourcePt = content.sourcePt();
        this.sourceEn = content.sourceEn();
        this.sourceEs = content.sourceEs();
        this.fullyTranslatedLangs = content.fullyTranslatedLangs();
        this.place = place;
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getSection() {
        return section;
    }

    public String getStage() {
        return stage;
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

    public String getSummaryPt() {
        return summaryPt;
    }

    public String getSummaryEn() {
        return summaryEn;
    }

    public String getSummaryEs() {
        return summaryEs;
    }

    public String getBlocksPt() {
        return blocksPt;
    }

    public String getBlocksEn() {
        return blocksEn;
    }

    public String getBlocksEs() {
        return blocksEs;
    }

    public String getLinksPt() {
        return linksPt;
    }

    public String getLinksEn() {
        return linksEn;
    }

    public String getLinksEs() {
        return linksEs;
    }

    public String getSourcePt() {
        return sourcePt;
    }

    public String getSourceEn() {
        return sourceEn;
    }

    public String getSourceEs() {
        return sourceEs;
    }

    public PlaceEntity getPlace() {
        return place;
    }

    public int getPosition() {
        return position;
    }

    public String[] getFullyTranslatedLangs() {
        return fullyTranslatedLangs;
    }
}
