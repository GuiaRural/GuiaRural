"use client";

import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { getRecifeGuide } from "../../services/guideService";
import Breadcrumb from "./Breadcrumb";
import GuideCard from "./GuideCard";
import GuideLoadError from "./GuideLoadError";
import GuideTipsSection from "./GuideTipsSection";
import HeroBanner from "./HeroBanner";
import InfoChip from "./InfoChip";
import PageFooter from "./PageFooter";

const TIPS_ID = "dicas-rapidas";

export default function RecifeGuideView() {
  const { t, language } = useLanguage();
  // O texto vem da API já no idioma escolhido; trocar o idioma refaz a busca.
  const state = useApi(getRecifeGuide, language);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb
            label={t.guide.breadcrumbLabel}
            homeLabel={t.guide.breadcrumbHome}
            currentLabel={t.guide.breadcrumbCurrent}
          />
          <div className="flex flex-wrap items-center gap-2">
            <InfoChip icon="pin">{t.guide.defaultOrigin}</InfoChip>
            <InfoChip icon="bus" tone="yellow" href={`#${TIPS_ID}`}>
              {t.guide.quickTips}
            </InfoChip>
          </div>
        </div>

        <div className="mt-4">
          <HeroBanner title={t.guide.heroTitle} subtitle={t.guide.heroSubtitle} />
        </div>

        {state.status === "loading" && <p role="status" className="mt-6 text-sm text-slate-600">{t.common.loading}</p>}
        {state.status === "ready" && (
          <>
            <div className="mt-6 grid gap-x-5 gap-y-10 lg:grid-cols-2">
              {state.data.spots.map((spot) => (
                <GuideCard key={spot.slug} spot={spot} />
              ))}
            </div>
            <GuideTipsSection
              id={TIPS_ID}
              title={t.guide.tipsTitle}
              subtitle={t.guide.tipsSubtitle}
              partnerships={t.guide.partnerships}
              tips={state.data.tips}
              support={state.data.support}
            />
          </>
        )}
        {state.status === "error" && (
          <div className="mt-6">
            <GuideLoadError onRetry={state.retry} />
          </div>
        )}

        <PageFooter
          brand={t.guide.footerBrand}
          tagline={t.guide.footerTagline}
          institution={t.guide.footerInstitution}
          scale={t.guide.scale}
        />
      </div>
    </div>
  );
}
