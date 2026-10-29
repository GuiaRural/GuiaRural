"use client";

import { useLanguage } from "../../context/LanguageContext";
import type { RecifeGuide } from "../../data/mockGuide";
import Breadcrumb from "./Breadcrumb";
import GuideCard from "./GuideCard";
import GuideLoadError from "./GuideLoadError";
import GuideTipsSection from "./GuideTipsSection";
import HeroBanner from "./HeroBanner";
import InfoChip from "./InfoChip";
import PageFooter from "./PageFooter";

const TIPS_ID = "dicas-rapidas";

export default function RecifeGuideView({ guide }: { guide: RecifeGuide | null }) {
  const { t } = useLanguage();

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

        {guide ? (
          <>
            <div className="mt-6 grid gap-x-5 gap-y-10 lg:grid-cols-2">
              {guide.spots.map((spot) => (
                <GuideCard key={spot.id} spot={spot} />
              ))}
            </div>
            <GuideTipsSection
              id={TIPS_ID}
              title={t.guide.tipsTitle}
              subtitle={t.guide.tipsSubtitle}
              partnerships={t.guide.partnerships}
              tips={guide.tips}
              support={guide.support}
            />
          </>
        ) : (
          <div className="mt-6">
            <GuideLoadError />
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
