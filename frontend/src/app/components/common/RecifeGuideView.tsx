"use client";

import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { isSameFilter, matchesFilter, type RecifeFilter } from "../../lib/recifeFilter";
import { getRecifeGuide, type GuideCategory, type GuideSpot } from "../../services/guideService";
import Breadcrumb from "./Breadcrumb";
import GuideCard from "./GuideCard";
import GuideLoadError from "./GuideLoadError";
import GuideTipsSection from "./GuideTipsSection";
import HeroBanner from "./HeroBanner";
import InfoChip from "./InfoChip";
import PageFooter from "./PageFooter";

const TIPS_ID = "dicas-rapidas";

function FilteredSpots({ categories, spots }: { categories: GuideCategory[]; spots: GuideSpot[] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<RecifeFilter>({ kind: "all" });

  const hasUncategorized = spots.some((spot) => spot.category === null);
  const visible = spots.filter((spot) => matchesFilter(spot, filter));

  const options: { filter: RecifeFilter; key: string; label: string }[] = [
    { filter: { kind: "all" }, key: "all", label: t.guide.filterAll },
    ...categories.map((category) => ({
      filter: { kind: "category", slug: category.slug } as const,
      key: `category:${category.slug}`,
      label: category.label,
    })),
    ...(hasUncategorized ? [{ filter: { kind: "other" } as const, key: "other", label: t.guide.filterOther }] : []),
  ];

  return (
    <>
      <div role="group" aria-label={t.guide.filterLabel} className="mt-6 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = isSameFilter(option.filter, filter);
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.filter)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-navy-700 ${
                active
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-navy-700 hover:text-navy-900"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p role="status" className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">
          {t.guide.noSpotsInCategory}
        </p>
      ) : (
        <div className="mt-6 grid gap-x-5 gap-y-10 lg:grid-cols-2">
          {visible.map((spot) => (
            <GuideCard key={spot.slug} spot={spot} />
          ))}
        </div>
      )}
    </>
  );
}

export default function RecifeGuideView() {
  const { t, language } = useLanguage();
  // O texto vem da API já no idioma escolhido; trocar o idioma refaz a busca.
  const state = useApi(getRecifeGuide, language);

  return (
    <div className="min-h-full">
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
            {/* A key volta o filtro para "Todas" ao mudar o idioma, que refaz a busca das categorias. */}
            <FilteredSpots key={language} categories={state.data.categories} spots={state.data.spots} />
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
