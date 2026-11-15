"use client";

import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";
import type { GuideDetail, GuideSpot } from "../../services/guideService";
import { useSavedIds } from "../../hooks/useSavedIds";
import Icon from "./Icon";

const SAVED_GUIDE_SPOTS_KEY = "guiarural:guia-recife:salvos";

const TAG_TONES = {
  red: "bg-red-600",
  navy: "bg-navy-900",
  olive: "bg-yellow-700",
} as const;

const ICON_TONES = {
  green: "text-emerald-600",
  amber: "text-amber-500",
  red: "text-red-600",
} as const;

function Detail({ detail }: { detail: GuideDetail }) {
  return (
    <div className="flex min-w-0 gap-2">
      {detail.icon && (
        <Icon name={detail.icon} className={`mt-0.5 size-4 shrink-0 ${ICON_TONES[detail.iconTone ?? "green"]}`} />
      )}
      <div className="min-w-0">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{detail.label}</h3>
        <p className={`mt-0.5 text-xs ${detail.emphasis ? "font-semibold text-navy-900" : "text-slate-600"}`}>
          {detail.text}
        </p>
      </div>
    </div>
  );
}

export default function GuideCard({ spot }: { spot: GuideSpot }) {
  const { t } = useLanguage();
  const { ids, toggle } = useSavedIds(SAVED_GUIDE_SPOTS_KEY);
  const saved = ids.includes(spot.slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300">
        {spot.image ? (
          <Image
            src={spot.image.src}
            alt={spot.image.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Icon name="pin" className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-white/60" />
        )}
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-center gap-2">
          {spot.tag && (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${TAG_TONES[spot.tag.tone]}`}
            >
              {spot.tag.label}
            </span>
          )}
          {spot.badge && spot.badge.tone === "highlight" ? (
            <span className="flex items-center gap-1 rounded-full bg-brand-yellow px-2.5 py-1 text-[10px] font-bold text-navy-900">
              <Icon name="bolt" className="size-3" />
              {spot.badge.label}
            </span>
          ) : (
            spot.badge && (
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                {spot.badge.label}
              </span>
            )
          )}
        </div>
        {spot.distance && (
          <p className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-navy-900/80 px-2 py-1 text-[10px] font-semibold text-white">
            <Icon name={spot.distance.icon} className="size-3" />
            {spot.distance.label}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-navy-900">{spot.title}</h2>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={`${saved ? t.guide.unsaveSpot : t.guide.saveSpot}: ${spot.title}`}
            onClick={() => toggle(spot.slug)}
            className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-700"
          >
            <Icon name="bookmark" className={`size-5 ${saved ? "fill-current text-navy-900" : ""}`} />
          </button>
        </div>
        {spot.address && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Icon name="pin" className="size-3.5 text-amber-600" />
            {spot.address}
          </p>
        )}
        <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-600">{spot.description}</p>

        <div
          className={`mt-4 grid flex-1 content-start gap-4 rounded-xl bg-sand-100 p-4 ${
            spot.detailsLayout === "columns" ? "sm:grid-cols-2" : ""
          }`}
        >
          {spot.details.map((detail) => (
            <Detail key={detail.label} detail={detail} />
          ))}
        </div>
      </div>
    </article>
  );
}
