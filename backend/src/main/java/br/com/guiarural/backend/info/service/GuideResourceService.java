package br.com.guiarural.backend.info.service;

import br.com.guiarural.backend.info.dto.ContactDTO;
import br.com.guiarural.backend.info.dto.DistanceDTO;
import br.com.guiarural.backend.info.dto.DownloadDTO;
import br.com.guiarural.backend.info.dto.GuideResourcesDTO;
import br.com.guiarural.backend.info.dto.GuideSpotDTO;
import br.com.guiarural.backend.info.dto.GuideTipDTO;
import br.com.guiarural.backend.info.dto.ImageDTO;
import br.com.guiarural.backend.info.dto.LinkDTO;
import br.com.guiarural.backend.info.dto.RecifeGuideDTO;
import br.com.guiarural.backend.info.dto.SupportBannerDTO;
import br.com.guiarural.backend.info.dto.ToneLabelDTO;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

@Service
public class GuideResourceService {
    private static final String SUPPORT_KIND = "apoio";
    private static final String EMERGENCY_KIND = "emergencia";
    // O aviso de apoio da página do Guia de Recife.
    private static final String RECIFE_BANNER = "recife";

    private final GuideSpotRepository spotRepository;
    private final GuideTipRepository tipRepository;
    private final GuideSupportBannerRepository bannerRepository;
    private final GuideContactRepository contactRepository;
    private final GuideDownloadRepository downloadRepository;
    private final JsonMapper jsonMapper;

    public GuideResourceService(GuideSpotRepository spotRepository,
                                GuideTipRepository tipRepository,
                                GuideSupportBannerRepository bannerRepository,
                                GuideContactRepository contactRepository,
                                GuideDownloadRepository downloadRepository,
                                JsonMapper jsonMapper) {
        this.spotRepository = spotRepository;
        this.tipRepository = tipRepository;
        this.bannerRepository = bannerRepository;
        this.contactRepository = contactRepository;
        this.downloadRepository = downloadRepository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public RecifeGuideDTO findRecifeGuide(Language language) {
        List<GuideSpotDTO> spots = spotRepository.findAllByOrderByPositionAsc().stream()
                .map(spot -> toSpot(spot, language))
                .toList();
        List<GuideTipDTO> tips = tipRepository.findAllByOrderByPositionAsc().stream()
                .map(tip -> toTip(tip, language))
                .toList();
        SupportBannerDTO support = bannerRepository.findBySlug(RECIFE_BANNER)
                .map(banner -> toBanner(banner, language))
                .orElse(null);
        return new RecifeGuideDTO(spots, tips, support);
    }

    @Transactional(readOnly = true)
    public GuideResourcesDTO findResources(Language language) {
        return new GuideResourcesDTO(
                contacts(SUPPORT_KIND, language),
                contacts(EMERGENCY_KIND, language),
                downloadRepository.findAllByOrderByPositionAsc().stream()
                        .map(download -> toDownload(download, language))
                        .toList()
        );
    }

    private List<ContactDTO> contacts(String kind, Language language) {
        return contactRepository.findByKindOrderByPositionAsc(kind).stream()
                .map(contact -> toContact(contact, language))
                .toList();
    }

    private ContactDTO toContact(GuideContactEntity contact, Language language) {
        return new ContactDTO(
                language.pick(contact.getLabelPt(), contact.getLabelEn(), contact.getLabelEs()),
                contact.getValue(),
                contact.getHref()
        );
    }

    private DownloadDTO toDownload(GuideDownloadEntity download, Language language) {
        return new DownloadDTO(
                language.pick(download.getLabelPt(), download.getLabelEn(), download.getLabelEs()),
                download.getLanguageLabel(),
                download.getHref()
        );
    }

    private GuideSpotDTO toSpot(GuideSpotEntity spot, Language language) {
        ToneLabelDTO tag = spot.getTagLabelPt() == null ? null : new ToneLabelDTO(
                language.pick(spot.getTagLabelPt(), spot.getTagLabelEn(), spot.getTagLabelEs()), spot.getTagTone());
        ToneLabelDTO badge = spot.getBadgeLabelPt() == null ? null : new ToneLabelDTO(
                language.pick(spot.getBadgeLabelPt(), spot.getBadgeLabelEn(), spot.getBadgeLabelEs()), spot.getBadgeTone());
        DistanceDTO distance = spot.getDistanceLabelPt() == null ? null : new DistanceDTO(
                language.pick(spot.getDistanceLabelPt(), spot.getDistanceLabelEn(), spot.getDistanceLabelEs()),
                spot.getDistanceIcon());
        ImageDTO image = spot.getImageUrl() == null ? null : new ImageDTO(
                spot.getImageUrl(), language.pick(spot.getImageAltPt(), spot.getImageAltEn(), spot.getImageAltEs()));
        return new GuideSpotDTO(
                spot.getSlug(),
                language.pick(spot.getTitlePt(), spot.getTitleEn(), spot.getTitleEs()),
                spot.getAddress(),
                language.pick(spot.getDescriptionPt(), spot.getDescriptionEn(), spot.getDescriptionEs()),
                tag,
                badge,
                distance,
                image,
                spot.getDetailsLayout(),
                json(language.pick(spot.getDetailsPt(), spot.getDetailsEn(), spot.getDetailsEs()))
        );
    }

    private GuideTipDTO toTip(GuideTipEntity tip, Language language) {
        LinkDTO link = tip.getLinkLabelPt() == null ? null : new LinkDTO(
                language.pick(tip.getLinkLabelPt(), tip.getLinkLabelEn(), tip.getLinkLabelEs()), tip.getLinkHref());
        return new GuideTipDTO(
                tip.getSlug(),
                language.pick(tip.getTitlePt(), tip.getTitleEn(), tip.getTitleEs()),
                tip.getIcon(),
                language.pick(tip.getTextPt(), tip.getTextEn(), tip.getTextEs()),
                link
        );
    }

    private SupportBannerDTO toBanner(GuideSupportBannerEntity banner, Language language) {
        LinkDTO cta = banner.getCtaHref() == null || banner.getCtaLabelPt() == null
                ? null
                : new LinkDTO(language.pick(banner.getCtaLabelPt(), banner.getCtaLabelEn(), banner.getCtaLabelEs()),
                        banner.getCtaHref());
        return new SupportBannerDTO(
                language.pick(banner.getBeforePt(), banner.getBeforeEn(), banner.getBeforeEs()),
                banner.getHighlight(),
                language.pick(banner.getAfterPt(), banner.getAfterEn(), banner.getAfterEs()),
                cta
        );
    }

    private JsonNode json(String raw) {
        return raw == null ? jsonMapper.createArrayNode() : jsonMapper.readTree(raw);
    }
}
