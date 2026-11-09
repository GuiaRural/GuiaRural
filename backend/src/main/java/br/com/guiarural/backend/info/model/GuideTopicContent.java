package br.com.guiarural.backend.info.model;

// O conteúdo de um tópico como o painel o edita (JSON já serializado em texto), pronto para gravar na entidade.
public record GuideTopicContent(
        String section,
        String stage,
        String titlePt, String titleEn, String titleEs,
        String summaryPt, String summaryEn, String summaryEs,
        String blocksPt, String blocksEn, String blocksEs,
        String linksPt, String linksEn, String linksEs,
        String sourcePt, String sourceEn, String sourceEs,
        String[] fullyTranslatedLangs
) {
}
