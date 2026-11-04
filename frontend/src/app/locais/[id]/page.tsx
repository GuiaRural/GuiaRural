"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import AppShell from "../../components/common/AppShell";
import ApiFailure from "../../components/courses/ApiFailure";
import { useApi } from "../../hooks/useApi";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import PlacePhoto from "../../components/places/PlacePhoto";
import Modal from "../../components/ui/Modal";
import { useLanguage } from "../../context/LanguageContext";
import type { Place } from "../../data/mockPlaces";
import { isOpenNow } from "../../lib/hours";
import { getDefaultOrigin, getPlace, getPublicPlaces, isPlaceSaved, toggleSavedPlace } from "../../services/placesService";
import { computeRoute, getCurrentCampusPosition } from "../../services/routeService";

export default function PlacePage({ params }: PageProps<"/locais/[id]">) {
  const { id } = use(params);
  const { t } = useLanguage();
  const state = useApi(getPlace, id);

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
  const { t } = useLanguage();
  const router = useRouter();
  const [saved, setSaved] = useState(() => isPlaceSaved(place.id));
  const [copied, setCopied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [originIssue, setOriginIssue] = useState<"denied" | "outside" | null>(null);

  const origin = getDefaultOrigin();
  const fromGate = place.position && origin?.position && origin.id !== place.id ? computeRoute(origin.position, place.position) : null;
  const hasHours = place.hours !== "";
  const open = hasHours && isOpenNow(place.hours);
  const coords = place.position;

  // Passo 3 do UC10: tenta o GPS; sem ele (FE01) ou fora do campus, pede a origem manual.
  async function traceRoute() {
    setLocating(true);
    const gps = await getCurrentCampusPosition();
    setLocating(false);
    if (gps.ok) {
      const { lat, lng } = gps.point;
      router.push(`/?rota=${place.id}&origem=gps:${lat.toFixed(6)},${lng.toFixed(6)}`);
    } else {
      setOriginIssue(gps.reason === "outside" ? "outside" : "denied");
    }
  }

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
          <h1 className="text-2xl font-bold text-navy-900">{place.name}</h1>
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
          <p className="text-xs text-slate-600">{t.placePage.externalOnly}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={traceRoute}
            disabled={locating}
            className="rounded-lg bg-brand-yellow px-4 py-2.5 text-sm font-bold text-navy-900 hover:brightness-95 disabled:opacity-70"
          >
            {locating ? t.route.locating : t.placePage.traceRoute}
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
            {place.description && <p className="mt-2 text-sm text-slate-700">{place.description}</p>}
            {place.accessibility.length > 0 && (
              <>
                <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{t.accessibility.title}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {place.accessibility.map((a) => (
                    <li key={a} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {t.accessibility[a]}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-navy-900">{t.placePage.services}</h2>
            {place.services.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">{t.placePage.noServices}</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {place.services.map((s) => (
                  <li key={s.name} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-600">{s.description}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-800">{s.hours.replaceAll("-", "–")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {hasHours && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.placePage.hours}</h2>
              <p className="mt-1 text-xl font-bold text-navy-900">{place.hours.replaceAll("-", "–")}</p>
            </section>
          )}
          {(place.phone || place.email || place.officeHours) && (
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.placePage.contact}</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-800">
                {place.phone && <li>{place.phone}</li>}
                {place.email && (
                  <li>
                    <a href={`mailto:${place.email}`} className="text-navy-700 underline">
                      {place.email}
                    </a>
                  </li>
                )}
                {place.officeHours && (
                  <li className="text-xs text-slate-600">
                    {t.placePage.officeHours}: {place.officeHours}
                  </li>
                )}
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
        issue={originIssue}
        destinationId={place.id}
        onCancel={() => setOriginIssue(null)}
        onConfirm={(originId) => router.push(`/?rota=${place.id}&origem=${originId}`)}
      />
    </article>
  );
}

// FE01 do UC10: escolha manual de um prédio ou portaria de partida.
function OriginPicker({
  issue,
  destinationId,
  onCancel,
  onConfirm,
}: {
  issue: "denied" | "outside" | null;
  destinationId: string;
  onCancel: () => void;
  onConfirm: (originId: string) => void;
}) {
  const { t } = useLanguage();
  const [options, setOptions] = useState<Place[]>([]);
  const [choice, setChoice] = useState("");

  useEffect(() => {
    if (issue) getPublicPlaces().then((all) => setOptions(all.filter((p) => p.id !== destinationId)));
  }, [issue, destinationId]);

  const gates = options.filter((p) => p.category === "portaria");
  const buildings = options.filter((p) => p.category !== "portaria");

  return (
    <Modal open={issue !== null} onClose={onCancel} title={t.route.chooseOrigin}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (choice) onConfirm(choice);
        }}
      >
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {issue === "outside" ? t.route.outside : t.route.gpsDenied}
        </p>
        <label htmlFor="origin" className="mt-4 block text-sm font-semibold text-slate-800">
          {t.route.from}
        </label>
        <select
          id="origin"
          required
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            —
          </option>
          <optgroup label={t.route.gates}>
            {gates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
          <optgroup label={t.route.buildings}>
            {buildings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </optgroup>
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={!choice} className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-bold text-navy-900 disabled:opacity-60">
            {t.route.confirm}
          </button>
        </div>
      </form>
    </Modal>
  );
}
