package br.com.guiarural.backend.info;

import br.com.guiarural.backend.info.dto.GuideResourcesDTO;
import br.com.guiarural.backend.info.dto.GuideSpotDTO;
import br.com.guiarural.backend.info.dto.RecifeGuideDTO;
import br.com.guiarural.backend.info.model.GuideContactEntity;
import br.com.guiarural.backend.info.model.GuideDownloadEntity;
import br.com.guiarural.backend.info.model.GuideSpotEntity;
import br.com.guiarural.backend.info.model.GuideSupportBannerEntity;
import br.com.guiarural.backend.info.model.GuideTipEntity;
import br.com.guiarural.backend.info.model.Language;
import br.com.guiarural.backend.info.repository.GuideContactRepository;
import br.com.guiarural.backend.info.repository.GuideDownloadRepository;
import br.com.guiarural.backend.info.repository.GuideSpotRepository;
import br.com.guiarural.backend.info.repository.GuideSupportBannerRepository;
import br.com.guiarural.backend.info.repository.GuideTipRepository;
import br.com.guiarural.backend.info.service.GuideResourceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Optional;

import static br.com.guiarural.backend.info.GuideTestData.entity;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuideResourceServiceTest {
    @Mock
    private GuideSpotRepository spotRepository;
    @Mock
    private GuideTipRepository tipRepository;
    @Mock
    private GuideSupportBannerRepository bannerRepository;
    @Mock
    private GuideContactRepository contactRepository;
    @Mock
    private GuideDownloadRepository downloadRepository;

    private GuideResourceService service() {
        return new GuideResourceService(spotRepository, tipRepository, bannerRepository, contactRepository,
                downloadRepository, JsonMapper.builder().build());
    }

    private GuideSpotEntity spot() {
        return entity(GuideSpotEntity.class,
                "slug", "olinda",
                "titlePt", "Sítio Histórico de Olinda",
                "titleEn", "Historic Site of Olinda",
                "address", "Alto da Sé",
                "descriptionPt", "Descrição em português",
                "tagLabelPt", "Patrimônio Mundial UNESCO",
                "tagLabelEn", "UNESCO World Heritage",
                "tagTone", "red",
                "detailsLayout", "columns",
                "detailsPt", "[{\"label\":\"Melhor horário\",\"text\":\"16h00\"}]",
                "detailsEn", "[{\"label\":\"Best time\",\"text\":\"16:00\"}]");
    }

    @Test
    @DisplayName("Deve montar o Guia de Recife no idioma pedido, com fallback para o português")
    void shouldBuildRecifeGuideInRequestedLanguage() {
        when(spotRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(spot()));
        when(tipRepository.findAllByOrderByPositionAsc()).thenReturn(List.of());
        when(bannerRepository.findBySlug("recife")).thenReturn(Optional.empty());

        RecifeGuideDTO result = service().findRecifeGuide(Language.EN);

        GuideSpotDTO dto = result.spots().get(0);
        assertEquals("Historic Site of Olinda", dto.title());
        assertEquals("UNESCO World Heritage", dto.tag().label());
        assertEquals("red", dto.tag().tone());
        assertEquals("[{\"label\":\"Best time\",\"text\":\"16:00\"}]", dto.details().toString());
        // Sem tradução da descrição, usa o português; endereço não se traduz.
        assertEquals("Descrição em português", dto.description());
        assertEquals("Alto da Sé", dto.address());
    }

    @Test
    @DisplayName("Deve omitir selo, distância e imagem que o local não tem")
    void shouldOmitMissingOptionalParts() {
        when(spotRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(spot()));
        when(tipRepository.findAllByOrderByPositionAsc()).thenReturn(List.of());
        when(bannerRepository.findBySlug("recife")).thenReturn(Optional.empty());

        GuideSpotDTO dto = service().findRecifeGuide(Language.PT).spots().get(0);

        assertNull(dto.badge());
        assertNull(dto.distance());
        assertNull(dto.image());
    }

    @Test
    @DisplayName("Deve devolver dica sem link quando ela não tem rótulo, e aviso nulo quando não existe")
    void shouldHandleTipWithoutLinkAndMissingBanner() {
        GuideTipEntity tip = entity(GuideTipEntity.class, "slug", "vem", "titlePt", "Cartão VEM", "textPt", "Texto");
        when(spotRepository.findAllByOrderByPositionAsc()).thenReturn(List.of());
        when(tipRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(tip));
        when(bannerRepository.findBySlug("recife")).thenReturn(Optional.empty());

        RecifeGuideDTO result = service().findRecifeGuide(Language.PT);

        assertNull(result.tips().get(0).link());
        assertNull(result.support());
    }

    @Test
    @DisplayName("Deve traduzir o aviso de apoio e manter o destaque sem tradução")
    void shouldTranslateSupportBanner() {
        GuideSupportBannerEntity banner = entity(GuideSupportBannerEntity.class,
                "slug", "recife",
                "beforePt", "Procure a ", "beforeEn", "Contact the ",
                "highlight", "PROGEST / DACE",
                "afterPt", " no Prédio Central.", "afterEn", " at the Central Building.",
                "ctaLabelPt", "Falar com Apoio", "ctaLabelEn", "Talk to Support",
                "ctaHref", "/contato");
        when(spotRepository.findAllByOrderByPositionAsc()).thenReturn(List.of());
        when(tipRepository.findAllByOrderByPositionAsc()).thenReturn(List.of());
        when(bannerRepository.findBySlug("recife")).thenReturn(Optional.of(banner));

        var support = service().findRecifeGuide(Language.EN).support();

        // Os espaços nas bordas fazem parte do texto.
        assertEquals("Contact the ", support.before());
        assertEquals("PROGEST / DACE", support.highlight());
        assertEquals(" at the Central Building.", support.after());
        assertEquals("Talk to Support", support.cta().label());
        assertEquals("/contato", support.cta().href());
    }

    @Test
    @DisplayName("Deve separar contatos de apoio, emergência e downloads")
    void shouldSplitResources() {
        GuideContactEntity support = entity(GuideContactEntity.class,
                "kind", "apoio", "labelPt", "Telefone", "labelEn", "Phone", "value", "+55 (81) 3320-6010", "href", "tel:+558133206010");
        GuideContactEntity emergency = entity(GuideContactEntity.class,
                "kind", "emergencia", "labelPt", "Polícia", "value", "190", "href", "tel:190");
        GuideDownloadEntity download = entity(GuideDownloadEntity.class,
                "labelPt", "Cartilha", "labelEn", "Booklet", "languageLabel", "PT", "href", "/cartilhas/a.pdf");
        when(contactRepository.findByKindOrderByPositionAsc("apoio")).thenReturn(List.of(support));
        when(contactRepository.findByKindOrderByPositionAsc("emergencia")).thenReturn(List.of(emergency));
        when(downloadRepository.findAllByOrderByPositionAsc()).thenReturn(List.of(download));

        GuideResourcesDTO result = service().findResources(Language.EN);

        assertEquals("Phone", result.support().get(0).label());
        assertEquals("tel:+558133206010", result.support().get(0).href());
        // Sem tradução do rótulo, mantém o português.
        assertEquals("Polícia", result.emergency().get(0).label());
        assertEquals("190", result.emergency().get(0).value());
        assertEquals("Booklet", result.downloads().get(0).label());
        assertEquals("PT", result.downloads().get(0).language());
    }
}
