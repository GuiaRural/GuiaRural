"use client";

import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { getRecifeGuide, type GuideSpot } from "../../services/guideService";
import Breadcrumb from "./Breadcrumb";
import GuideCard from "./GuideCard";
import GuideLoadError from "./GuideLoadError";
import GuideTipsSection from "./GuideTipsSection";
import HeroBanner from "./HeroBanner";
import InfoChip from "./InfoChip";
import PageFooter from "./PageFooter";

const TIPS_ID = "dicas-rapidas";

// Categoria = rótulo da etiqueta (tag) do lugar; lugares sem etiqueta ficam em "Outros".
type CategoryFilter = { kind: "all" } | { kind: "tag"; label: string } | { kind: "other" };

function matches(spot: GuideSpot, filter: CategoryFilter): boolean {
  if (filter.kind === "all") return true;
  if (filter.kind === "other") return spot.tag === null;
  return spot.tag?.label === filter.label;
}

function FilteredSpots({ spots }: { spots: GuideSpot[] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<CategoryFilter>({ kind: "all" });

  const labels = [...new Set(spots.flatMap((spot) => (spot.tag ? [spot.tag.label] : [])))];
  const hasUntagged = spots.some((spot) => spot.tag === null);
  const visible = spots.filter((spot) => matches(spot, filter));

  const options: { filter: CategoryFilter; label: string }[] = [
    { filter: { kind: "all" }, label: t.guide.filterAll },
    ...labels.map((label) => ({ filter: { kind: "tag", label } as const, label })),
    ...(hasUntagged ? [{ filter: { kind: "other" } as const, label: t.guide.filterOther }] : []),
  ];

  const isActive = (option: CategoryFilter) =>
    option.kind === filter.kind && (option.kind !== "tag" || (filter.kind === "tag" && option.label === filter.label));

  return (
    <>
      <div role="group" aria-label={t.guide.filterLabel} className="mt-6 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = isActive(option.filter);
          return (
            <button
              key={`${option.filter.kind}:${option.label}`}
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
            {/* A key troca o filtro ao mudar o idioma: os rótulos das categorias mudam junto. */}
            <FilteredSpots key={language} spots={state.data.spots} />
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
