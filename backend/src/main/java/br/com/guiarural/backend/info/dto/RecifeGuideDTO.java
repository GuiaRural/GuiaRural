package br.com.guiarural.backend.info.dto;

import java.util.List;

public record RecifeGuideDTO(List<GuideCategoryDTO> categories, List<GuideSpotDTO> spots, List<GuideTipDTO> tips, SupportBannerDTO support) {
}
