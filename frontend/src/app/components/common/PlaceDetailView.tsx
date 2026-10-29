"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { useSavedIds } from "../../hooks/useSavedIds";
import { formatDays, formatHours, isOpenAt } from "../../utils/openingHours";
import Breadcrumb from "./Breadcrumb";
import Icon from "./Icon";
import { SAVED_PLACES_KEY } from "./PlaceCard";

function BackToMap({ placeId }: { placeId?: string }) {
  const { t } = useLanguage();
  // Volta com o card do local aberto (?local=id), como o usuário deixou o mapa.
  const href = placeId ? `/?local=${encodeURIComponent(placeId)}` : "/";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-brand-yellow"
    >
      <Icon name="arrow" className="size-4 rotate-180" />
      {t.place.backToMap}
    </Link>
  );
}

function LoadError() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
      <h1 className="text-lg font-bold text-navy-900">{t.place.loadErrorTitle}</h1>
      <p className="mt-1 text-sm text-slate-600">{t.place.loadErrorText}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg border border-navy-900 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-yellow"
        >
          {t.place.retry}
        </button>
        <BackToMap />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

// place = null: falha ao carregar (o "não encontrado" é tratado por not-found.tsx da rota).
export default function PlaceDetailView({ place }: { place: Place | null }) {
  const { t, language } = useLanguage();
  const { ids, toggle } = useSavedIds(SAVED_PLACES_KEY);

  if (!place) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <LoadError />
        </div>
      </div>
    );
  }

  const saved = ids.includes(place.id);
  const open = isOpenAt(place.hours, new Date());

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb label={t.place.breadcrumbLabel} homeLabel={t.place.home} currentLabel={place.name} />
          <BackToMap placeId={place.id} />
        </div>

        <article className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="relative h-48 bg-navy-900 sm:h-72">
            {place.image && (
              <Image
                src={place.image.src}
                alt={place.image.alt}
                fill
                priority
                sizes="(min-width: 896px) 56rem, 100vw"
                className="object-cover"
              />
            )}
            <span className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-md bg-navy-900/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-red-500" />
              <span className="truncate">{place.tag}</span>
            </span>
            {open !== null && (
              <span
                className={`absolute bottom-4 right-4 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold text-white ${
                  open ? "bg-emerald-600" : "bg-slate-600"
                }`}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-white" />
                {open ? t.place.openNow : t.place.closed}
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-navy-900">{place.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Icon name="pin" className="size-4 shrink-0" />
                {place.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(place.id)}
              aria-pressed={saved}
              aria-label={`${saved ? t.place.unsave : t.place.save}: ${place.name}`}
              className="shrink-0 rounded-md p-1 text-slate-500 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-brand-yellow"
            >
              <Icon name="bookmark" className={`size-6 ${saved ? "fill-current text-navy-900" : ""}`} />
            </button>
          </div>
        </article>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Section title={t.place.about}>
              <p className="text-sm leading-relaxed text-slate-700">{place.description}</p>
            </Section>
          </div>

          <Section title={t.place.hours}>
            {place.hours.length > 0 ? (
              <ul className="space-y-1.5">
                {place.hours.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-navy-900">
                    <Icon name="clock" className="size-4 shrink-0 text-amber-500" />
                    <span className="font-medium capitalize">{formatDays(h.days, language)}</span>
                    <span className="text-slate-600">{formatHours([h], t.place.until)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">{t.place.noHours}</p>
            )}
          </Section>

          {place.services && place.services.length > 0 && (
            <Section title={t.place.servicesTitle}>
              <ul className="flex flex-wrap gap-2">
                {place.services.map((s) => (
                  <li key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-navy-900">
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {place.reference && (
            <div className="md:col-span-2">
              <Section title={t.place.howToGet}>
                <p className="text-sm text-slate-700">{place.reference}</p>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
