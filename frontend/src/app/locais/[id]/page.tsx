"use client";

import Link from "next/link";
import { use, useState } from "react";
import AppShell from "../../components/common/AppShell";
import ApiFailure from "../../components/courses/ApiFailure";
import { useApi } from "../../hooks/useApi";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import PlacePhoto from "../../components/places/PlacePhoto";
import { OriginPicker, useTraceRoute } from "../../components/map/RoutePlanner";
import { useLanguage } from "../../context/LanguageContext";
import { isOpenNow } from "../../lib/hours";
import { getDefaultOrigin, getPlace, isPlaceSaved, toggleSavedPlace, type Place, type PlaceKey } from "../../services/placesService";
import TranslationNotice from "../../components/common/TranslationNotice";
import { NO_ROUTE, getRoute, routeKey } from "../../services/routeService";

export default function PlacePage({ params }: PageProps<"/locais/[id]">) {
  const { id } = use(params);
  const { t, language } = useLanguage();
  const state = useApi(getPlace, `${id}:${language}` satisfies PlaceKey);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            {/* FA02 do UC10: desistir e voltar ao mapa */}
            <Link href="/" className="flex items-center gap-1 text-sm font-semibold text-navy-900 hover:underline">
              <span aria-hidden>←</span> {t.placePage.backToMap}
            </Link>
            <LanguageSwitcher />
          </div>
          {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
          {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
          {state.status === "ready" && state.data === null && (
            <div className="rounded-2xl bg-white p-8 text-center shadow">
              <h1 className="text-xl font-bold text-navy-900">{t.placePage.notFound}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.placePage.notFoundText}</p>
            </div>
          )}
          {state.status === "ready" && state.data && <PlaceDetails key={state.data.id} place={state.data} />}
        </div>
      </div>
    </AppShell>
  );
}

function PlaceDetails({ place }: { place: Place }) {
  const { t, language } = useLanguage();
  const [saved, setSaved] = useState(() => isPlaceSaved(place.id));
  const [copied, setCopied] = useState(false);
  const route = useTraceRoute();

  const origin = getDefaultOrigin(language);
  const routeState = useApi(getRoute, place.position && origin?.position && origin.id !== place.id ? routeKey(origin.position, place.position) : NO_ROUTE);
  const fromGate = routeState.status === "ready" ? routeState.data : null;
  const hasHours = place.hours !== "";
  const open = hasHours && isOpenNow(place.hours);
  const coords = place.position;

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: place.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  return (
    <article className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl shadow">
        <PlacePhoto place={place} className="h-48 sm:h-64" />
        {hasHours && (
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${open ? "bg-emerald-600" : "bg-slate-600"}`}>
            {open ? t.placeCard.openNow : t.placeCard.closed}
          </span>
        )}
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{t.categories[place.category]}</p>
          <h1 lang={place.lang !== language ? place.lang : undefined} className="text-2xl font-bold text-navy-900">
            {place.name}
          </h1>
          <TranslationNotice lang={place.lang} machineTranslated={place.machineTranslated} />
          <p className="text-sm text-slate-600">{place.address}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => setSaved(toggleSavedPlace(place.id))}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${saved ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-300 text-slate-800 hover:bg-slate-50"}`}
          >
            {saved ? `★ ${t.placeCard.saved}` : `☆ ${t.placeCard.save}`}
          </button>
          <button type="button" onClick={share} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            {copied ? t.placePage.linkCopied : t.placePage.share}
          </button>
        </div>
      </header>

      {/* Seção "Trajeto recomendado pelo GPS" (UC10, passo 2) */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">{t.placePage.recommendedRoute}</p>
          {fromGate && (
            <p className="text-lg font-bold text-navy-900">
              {fromGate.meters} {t.common.meters} {t.placePage.fromGate} · {fromGate.minutes} {t.common.minutes} {t.placeCard.walk}
            </p>
          )}
          {fromGate?.source === "straight" && <p className="text-xs font-semibold text-amber-800">{t.route.estimate}</p>}
          {fromGate && fromGate.stepsMeters > 0 && (
            <p className="text-xs text-slate-600">
              {t.route.steps}: {fromGate.stepsMeters} {t.common.meters}
            </p>
          )}
          <p className="text-xs text-slate-600">{t.placePage.externalOnly}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => route.trace(place.id)}
            disabled={route.locating}
            className="rounded-lg bg-brand-yellow px-4 py-2.5 text-sm font-bold text-navy-900 hover:brightness-95 disabled:opacity-70"
          >
            {route.locating ? t.route.locating : t.placePage.traceRoute}
          </button>
          <Link href={`/?local=${place.id}`} className="rounded-lg border border-navy-900 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-navy-900/5">
            {t.placePage.viewOnMap}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy-900">{t.placePage.about}</h2>
            {place.description && (
              <p lang={place.lang !== language ? place.lang : undefined} className="mt-2 text-sm text-slate-700">
                {place.description}
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy-900">{t.placePage.services}</h2>
            {place.services.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">{t.placePage.noServices}</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {place.services.map((s) => (
                  <li key={s.id}>
                    {/* O serviço fica no catálogo (/servicos), onde estão os passos e requisitos. */}
                    <Link href="/servicos" className="block rounded-xl border border-slate-200 p-3 font-semibold text-navy-900 hover:bg-slate-50">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* CT-037.01: do local para a página do departamento (UC37) */}
          {place.departments.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy-900">{t.placePage.departments}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {place.departments.map((d) => (
                  <li key={d.id}>
                    <Link href={`/departamentos/${d.id}`} className="block rounded-xl border border-slate-200 p-3 font-semibold text-navy-900 hover:bg-slate-50">
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {place.courses.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy-900">{t.placePage.courses}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {place.courses.map((c) => (
                  <li key={c.id}>
                    <Link href={`/cursos/${c.id}`} className="block rounded-xl border border-slate-200 p-3 font-semibold text-navy-900 hover:bg-slate-50">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {hasHours && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.placePage.hours}</h2>
              <p className="mt-1 text-xl font-bold text-navy-900">{place.hours.replaceAll("-", "–")}</p>
            </section>
          )}
          {place.contacts.length > 0 && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.placePage.contact}</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-800">
                {place.contacts.map((c) => (
                  <li key={`${c.name}-${c.email ?? ""}`}>
                    <p className="font-semibold">{c.name}</p>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-navy-700 underline">
                        {c.email}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {coords && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.placePage.address}</h2>
              {place.address && <p className="mt-1 text-sm text-slate-800">{place.address}</p>}
              <p className="mt-1 font-mono text-xs text-slate-500">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            </section>
          )}
        </aside>
      </div>

      <OriginPicker
        issue={route.issue}
        destinationId={place.id}
        onCancel={route.clearIssue}
        onConfirm={(originId) => route.goFrom(place.id, originId)}
      />
    </article>
  );
}
