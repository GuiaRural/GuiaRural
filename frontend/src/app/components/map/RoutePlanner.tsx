"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { routeHref } from "../../lib/routeLink";
import { getPublicPlaces, type Place } from "../../services/placesService";
import { getCurrentCampusPosition } from "../../services/routeService";
import Modal from "../ui/Modal";

// Traçado de rota (UC10) compartilhado pela página do local e pelo botão amarelo da busca (CT-038.04).
// Só monta o endereço ?rota=&origem=; quem desenha a rota é o MapExplorer, que não muda.

export type OriginIssue = "denied" | "outside";

// Passo 3 do UC10: tenta o GPS; sem ele (FE01) ou fora do campus, devolve o motivo para pedir a origem manual.
export function useTraceRoute() {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [issue, setIssue] = useState<OriginIssue | null>(null);

  async function trace(destinationId: string) {
    setLocating(true);
    const gps = await getCurrentCampusPosition();
    setLocating(false);
    if (gps.ok) router.push(routeHref(destinationId, { gps: gps.point }));
    else setIssue(gps.reason === "outside" ? "outside" : "denied");
  }

  return {
    locating,
    issue,
    trace,
    clearIssue: () => setIssue(null),
    goFrom: (destinationId: string, originId: string) => router.push(routeHref(destinationId, { placeId: originId })),
  };
}

// Prédios e portarias de partida (FE01 do UC10), sem o próprio destino.
function OriginSelect({ id, places, destinationId, value, onChange }: {
  id: string;
  places: Place[];
  destinationId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const options = places.filter((p) => p.id !== destinationId);
  const gates = options.filter((p) => p.category === "portaria");
  const buildings = options.filter((p) => p.category !== "portaria");

  return (
    <select
      id={id}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
  );
}

function usePublicPlaces(enabled: boolean) {
  const { language } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  useEffect(() => {
    if (enabled) getPublicPlaces(language).then(setPlaces, () => setPlaces([]));
  }, [enabled, language]);
  return places;
}

// FE01 do UC10: escolha manual de um prédio ou portaria de partida.
export function OriginPicker({
  issue,
  destinationId,
  onCancel,
  onConfirm,
}: {
  issue: OriginIssue | null;
  destinationId: string;
  onCancel: () => void;
  onConfirm: (originId: string) => void;
}) {
  const { t } = useLanguage();
  const places = usePublicPlaces(issue !== null);
  const [choice, setChoice] = useState("");

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
        <OriginSelect id="origin" places={places} destinationId={destinationId} value={choice} onChange={setChoice} />
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

// CT-038.04: painel da Home para escolher destino e origem (GPS por padrão; manual como na página do local).
export function RoutePlannerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const places = usePublicPlaces(open);
  const { locating, issue, trace, clearIssue, goFrom } = useTraceRoute();
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<"gps" | "manual">("gps");
  const [origin, setOrigin] = useState("");

  // GPS negado ou fora do campus: o painel passa para a origem manual e mostra o motivo.
  const manual = mode === "manual" || issue !== null;
  const canSubmit = destination !== "" && (!manual || origin !== "") && !locating;

  function close() {
    clearIssue();
    setMode("gps");
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title={t.route.planTitle} description={t.route.planDescription}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          if (manual) goFrom(destination, origin);
          else trace(destination);
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="route-destination" className="block text-sm font-semibold text-slate-800">
            {t.route.destination}
          </label>
          <select
            id="route-destination"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="" disabled>
              —
            </option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">{t.route.from}</legend>
          <div className="mt-2 space-y-2 text-sm text-slate-800">
            <label className="flex items-center gap-2">
              <input type="radio" name="route-origin-mode" checked={!manual} onChange={() => { clearIssue(); setMode("gps"); }} />
              {t.route.originGps}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="route-origin-mode" checked={manual} onChange={() => setMode("manual")} />
              {t.route.originManual}
            </label>
          </div>
        </fieldset>

        {issue && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {issue === "outside" ? t.route.outside : t.route.gpsDenied}
          </p>
        )}

        {manual && (
          <div>
            <label htmlFor="route-origin" className="block text-sm font-semibold text-slate-800">
              {t.route.chooseOrigin}
            </label>
            <OriginSelect id="route-origin" places={places} destinationId={destination} value={origin} onChange={setOrigin} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={close} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={!canSubmit} className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-bold text-navy-900 disabled:opacity-60">
            {locating ? t.route.locating : t.route.confirm}
          </button>
        </div>
      </form>
    </Modal>
  );
}
