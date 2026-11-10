"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { dictionaries } from "../../i18n/dictionaries";
import { setFlash } from "../../lib/flash";
import { CAMPUS_BOUNDS } from "../../data/mapConfig";
import { formatCoord, isInsideCampus, type LatLng } from "../../lib/geo";
import { isValidHours } from "../../lib/hours";
import { getCourses, type CourseSummary } from "../../services/coursesService";
import {
  PLACE_CATEGORIES,
  PlaceValidationError,
  deletePlacePhoto,
  listAllPlaces,
  savePlace,
  uploadPlacePhoto,
  type Place,
  type PlaceCategory,
  type PlaceLink,
} from "../../services/placesService";
import { listServicos, type Servico } from "../../services/servicosService";
import MapLoading from "../common/MapLoading";
import type { MapMarker } from "../map/CampusMap";
import Modal from "../ui/Modal";
import { useAdmin } from "./AdminShell";

const t = dictionaries.pt;

// O Leaflet acessa `window` ao ser importado: o mapa só carrega no cliente.
const CampusMap = dynamic(() => import("../map/CampusMap"), { ssr: false, loading: () => <MapLoading /> });

// O servidor confere de novo e reduz a imagem (JPEG de até 1280 px); aqui só se evita enviar arquivo inútil.
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png"];
const MAX_CONTACTS = 5;

const MESSAGES = {
  required: "Preencha todos os campos obrigatórios para continuar.",
  coords: "Coordenadas inválidas. Verifique a latitude e a longitude informadas.",
  photo: "Formato ou tamanho de imagem inválido. Envie um arquivo JPG ou PNG de até 5MB.",
  georef: "Para publicar, informe a latitude e a longitude do local ou ajuste o pin no mapa.",
  hours: "Horário de funcionamento inválido: o fechamento deve ser depois da abertura.",
  contactName: "Informe o nome de cada responsável (ou remova a linha em branco).",
  contactEmail: "Informe um e-mail válido para o responsável.",
};

const CATEGORY_ICONS: Record<PlaceCategory, ReactNode> = {
  departamento: <path d="M4 6h16v10H4zM2 19h20M9 16v3M15 16v3" />,
  administrativo: <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />,
  biblioteca: <path d="M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5zM19 4h-4a2 2 0 0 0-2 2M19 4v14h-6" />,
  alimentacao: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9" />,
  portaria: <path d="M6 4h12a2 2 0 0 1 2 2v10H4V6a2 2 0 0 1 2-2zM4 11h16M7 19v2M17 19v2M4 16v3h16v-3M8 14h.01M16 14h.01" />,
  auditorio: <path d="M4 5h16v8a8 8 0 0 1-16 0zM9 9h.01M15 9h.01M9 14a4 4 0 0 0 6 0" />,
  esporte: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9h17M3.5 15h17M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18" />,
  sala: <path d="M4 5h16v11H4zM8 20h8M12 16v4M8 9h8M8 12h5" />,
  saude: <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11zM12 9v6M9 12h6" />,
  moradia: <path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6" />,
  apoio: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01" />,
};

type FieldKey = "name" | "shortName" | "category" | "lat" | "lng" | "photo" | "hours";
type ContactRow = { name: string; email: string };

// Um intervalo só vira os campos "abertura até fechamento"; vários intervalos (ex.: RU) ficam em texto livre.
function splitHours(hours: string) {
  if (!hours.trim()) return { open: "", close: "", text: null };
  const ranges = hours.split(",").map((r) => r.split(/[-–]/).map((s) => s.trim()));
  return ranges.length === 1 && ranges[0].length === 2 ? { open: ranges[0][0], close: ranges[0][1], text: null } : { open: "", close: "", text: hours };
}

function withoutCoordErrors<T extends { lat?: true; lng?: true }>(errors: T): T {
  const next = { ...errors };
  delete next.lat;
  delete next.lng;
  return next;
}

function parseCoord(value: string) {
  const n = Number(value.trim().replace(",", "."));
  return value.trim() && Number.isFinite(n) ? n : null;
}

const levelLabel = (level: CourseSummary["level"]) => (level === "POS" ? "Pós-graduação" : "Graduação");

// UC14 — Adicionar Local (também usado para continuar um rascunho ou editar um local existente).
// Cursos e serviços vêm da API (RN-UC14.03: só os já cadastrados podem ser vinculados); a foto vai por upload.
export default function PlaceForm({ place }: { place?: Place }) {
  const router = useRouter();
  const { setDirty } = useAdmin();
  // Depois do primeiro salvamento (mesmo que a foto falhe) o formulário passa a editar o local que acabou de criar.
  const [savedId, setSavedId] = useState(place?.id);
  const editing = Boolean(savedId);
  const initialCoords = place?.position ?? null;
  const initialHours = splitHours(place?.hours ?? "");

  const [name, setName] = useState(place?.name ?? "");
  const [shortName, setShortName] = useState(place?.shortName ?? "");
  const [category, setCategory] = useState<PlaceCategory | null>(place?.category ?? null);
  const [address, setAddress] = useState(place?.address ?? "");
  const [lat, setLat] = useState(initialCoords ? formatCoord(initialCoords.lat) : "");
  const [lng, setLng] = useState(initialCoords ? formatCoord(initialCoords.lng) : "");
  const [open, setOpen] = useState(initialHours.open);
  const [close, setClose] = useState(initialHours.close);
  const [hoursText, setHoursText] = useState(initialHours.text);
  const [description, setDescription] = useState(place?.description ?? "");
  const [contacts, setContacts] = useState<ContactRow[]>((place?.contacts ?? []).map((c) => ({ name: c.name, email: c.email ?? "" })));

  // Foto: a que já está no servidor, a escolhida agora (só enviada ao salvar) e o pedido de remover.
  const currentPhoto = place?.photoUrl;
  const [newPhoto, setNewPhoto] = useState<{ file: File; previewUrl: string } | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Vínculos: o nome vem junto para aparecer mesmo se o item sair do catálogo (ex.: serviço despublicado).
  const [courseLinks, setCourseLinks] = useState<PlaceLink[]>(place?.courses ?? []);
  const [serviceLinks, setServiceLinks] = useState<PlaceLink[]>(place?.services ?? []);
  const [courseToAdd, setCourseToAdd] = useState("");
  const [serviceToAdd, setServiceToAdd] = useState("");
  const [courseCatalog, setCourseCatalog] = useState<CourseSummary[] | null>(null);
  const [serviceCatalog, setServiceCatalog] = useState<Servico[] | null>(null);

  const [errors, setErrors] = useState<Partial<Record<FieldKey, true>>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState<"rascunho" | "publicado" | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [others, setOthers] = useState<MapMarker[]>([]);

  useEffect(() => {
    listAllPlaces()
      .then((all) =>
        setOthers(
          all
            .filter((p) => p.id !== place?.id && p.position)
            .map((p) => ({ id: p.id, label: p.shortName, point: p.position!, kind: p.category === "portaria" ? "gate" : "place" })),
        ),
      )
      .catch(() => setOthers([]));
  }, [place?.id]);

  // Se o catálogo não carregar, o seletor fica vazio e avisa; os vínculos já feitos continuam na tela.
  useEffect(() => {
    getCourses().then(setCourseCatalog).catch(() => setCourseCatalog([]));
    listServicos().then(setServiceCatalog).catch(() => setServiceCatalog([]));
  }, []);

  // A pré-visualização é um endereço temporário do navegador: libera ao trocar o arquivo e ao sair da tela.
  const previewRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );
  function setPreview(photo: { file: File; previewUrl: string } | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = photo?.previewUrl ?? null;
    setNewPhoto(photo);
  }

  // Envolve os setters para marcar o formulário como alterado (FE01 do UC24).
  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  const latNum = parseCoord(lat);
  const lngNum = parseCoord(lng);
  const coordsFilled = lat.trim() !== "" || lng.trim() !== "";
  const coordsValid = latNum !== null && lngNum !== null && isInsideCampus({ lat: latNum, lng: lngNum });
  const position: LatLng | null = coordsValid ? { lat: latNum!, lng: lngNum! } : null;
  const hours = hoursText ?? (open && close ? `${open}-${close}` : "");
  const shownPhoto = newPhoto ? newPhoto.previewUrl : removePhoto ? undefined : currentPhoto;

  function checkCoords() {
    if (coordsFilled && !coordsValid) {
      setErrors((e) => ({ ...e, lat: true, lng: true }));
      setSummary(MESSAGES.coords);
    } else if (summary === MESSAGES.coords) {
      setErrors(withoutCoordErrors);
      setSummary(null);
    }
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // FE-14.03
    if (!PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      setPhotoError(true);
      return;
    }
    setPhotoError(false);
    setRemovePhoto(false);
    setPreview({ file, previewUrl: URL.createObjectURL(file) });
    setDirty(true);
  }

  function dropPhoto() {
    setPreview(null);
    // Só há o que remover no servidor se já existir uma foto lá.
    setRemovePhoto(Boolean(currentPhoto));
    setDirty(true);
  }

  function updateContact(index: number, patch: Partial<ContactRow>) {
    change(setContacts)(contacts.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  // O resumo do erro fica no topo do formulário; rola até ele para que seja visto mesmo ao salvar pelo rodapé.
  function fail(fields: Partial<Record<FieldKey, true>>, message: string) {
    setErrors(fields);
    setSummary(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(status: "rascunho" | "publicado") {
    const missing: Partial<Record<FieldKey, true>> = {};
    if (!name.trim()) missing.name = true;
    // FA-14.01: o rascunho só precisa do nome; publicar exige a identificação completa e o horário.
    if (status === "publicado") {
      if (!shortName.trim()) missing.shortName = true;
      if (!category) missing.category = true;
      if (!hours) missing.hours = true;
    }
    if (Object.keys(missing).length) return fail(missing, MESSAGES.required);
    // FE-14.02
    if (coordsFilled && !coordsValid) return fail({ lat: true, lng: true }, MESSAGES.coords);
    if (hours && !isValidHours(hours)) return fail({ hours: true }, MESSAGES.hours);
    // RN-UC14.01
    if (status === "publicado" && !position) return fail({ lat: true, lng: true }, MESSAGES.georef);
    // Responsável: linha totalmente em branco é ignorada; com e-mail ou nome, o nome é obrigatório.
    const filledContacts = contacts.filter((c) => c.name.trim() || c.email.trim());
    if (filledContacts.some((c) => !c.name.trim())) return fail({}, MESSAGES.contactName);
    if (filledContacts.some((c) => c.email.trim() && !/^\S+@\S+\.\S+$/.test(c.email.trim()))) return fail({}, MESSAGES.contactEmail);

    setErrors({});
    setSummary(null);
    setSaving(status);
    let saved: Place;
    try {
      saved = await savePlace({
        id: savedId,
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        category: category ?? "departamento",
        status,
        position,
        address: address.trim(),
        hours,
        description: description.trim(),
        contacts: filledContacts.map((c) => ({ name: c.name.trim(), email: c.email.trim() || undefined })),
        serviceIds: serviceLinks.map((s) => s.id),
        courseIds: courseLinks.map((c) => c.id),
      });
      setSavedId(saved.id);
    } catch (err) {
      setSummary(err instanceof PlaceValidationError ? err.message : "Não foi possível salvar o local. Tente novamente.");
      setSaving(null);
      return;
    }

    // A foto vai depois do local (precisa do identificador). Se ela falhar, o local já está salvo e o formulário
    // continua aberto para tentar de novo: o próximo "salvar" edita o mesmo local.
    try {
      if (newPhoto) await uploadPlacePhoto(saved.id, newPhoto.file);
      else if (removePhoto) await deletePlacePhoto(saved.id);
    } catch (err) {
      setSummary(
        `O local foi salvo, mas a foto não: ${err instanceof PlaceValidationError ? err.message : "tente enviar novamente."}`,
      );
      setSaving(null);
      return;
    }

    setDirty(false);
    setFlash(
      status === "publicado"
        ? `"${saved.name}" foi publicado e já aparece no mapa interativo e na busca.`
        : `"${saved.name}" foi salvo como rascunho. Ele não aparece no mapa nem na busca até ser publicado.`,
    );
    router.push("/admin/locais");
  }

  const inputCls = (key?: FieldKey) =>
    `h-11 w-full rounded-lg border bg-stone-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow ${
      key && errors[key] ? "border-red-500 bg-red-50/50" : "border-stone-200"
    }`;
  const availableCourses = (courseCatalog ?? []).filter((c) => !courseLinks.some((l) => l.id === c.id));
  const availableServices = (serviceCatalog ?? []).filter((s) => !serviceLinks.some((l) => l.id === s.id));
  const courseDetails = new Map((courseCatalog ?? []).map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Cabeçalho com ações */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:-mx-6 sm:rounded-b-xl sm:px-6">
        <div>
          <nav aria-label="Trilha" className="text-[11px] text-slate-500">
            <Link href="/admin" className="hover:underline">
              Início
            </Link>{" "}
            ›{" "}
            <Link href="/admin/locais" className="hover:underline">
              Locais
            </Link>{" "}
            › <span className="font-semibold text-slate-800">{editing ? "Editar Local" : "Cadastrar Novo Local"}</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">
              {editing ? `Editar Local • ${place?.name ?? name}` : "Cadastrar Novo Local • Campus Dois Irmãos"}
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
              {editing ? (place?.status === "rascunho" ? "Rascunho" : "Modo de edição") : "Modo de criação"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* FA-14.02 */}
          <Link
            href="/admin/locais"
            onClick={() => setDirty(false)}
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          {/* FA-14.01 */}
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("rascunho")}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M6 3h9l4 4v14H6zM14 3v5h5" />
            </svg>
            {saving === "rascunho" ? "Salvando..." : "Salvar como Rascunho"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => save("publicado")}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy-900 px-4 text-sm font-bold text-white shadow-sm hover:bg-navy-700 disabled:opacity-60"
          >
            <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M5 3h11l3 3v15H5zM8 3v5h7V3M8 14h8v7H8z" />
            </svg>
            {saving === "publicado" ? "Publicando..." : "Salvar e Publicar Local"}
          </button>
        </div>
      </div>

      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </p>
      )}

      {/* 1. Classificação */}
      <Section
        n={1}
        title="Classificação e Identificação Primária"
        subtitle="Determine a natureza arquitetônica e administrativa deste ponto"
        badge={<span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">Obrigatório</span>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="pl-name" label="Nome oficial do prédio / local" required>
            <input id="pl-name" className={inputCls("name")} placeholder="Ex: Departamento de Computação (DC)" value={name} onChange={(e) => change(setName)(e.target.value)} aria-invalid={!!errors.name} />
          </Field>
          <Field id="pl-short" label="Sigla / identificador curto" required>
            <input id="pl-short" className={inputCls("shortName")} placeholder="Ex: DC" value={shortName} onChange={(e) => change(setShortName)(e.target.value)} aria-invalid={!!errors.shortName} />
          </Field>
        </div>

        <fieldset className="mt-6">
          <legend className="text-xs font-bold uppercase tracking-wide text-slate-800">
            Tipo de instalação no campus <span className="text-red-600">*</span>
          </legend>
          <div className={`mt-3 grid grid-cols-2 gap-3 rounded-xl sm:grid-cols-3 lg:grid-cols-5 ${errors.category ? "p-2 ring-2 ring-red-400" : ""}`}>
            {PLACE_CATEGORIES.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => change(setCategory)(c)}
                  className={`flex min-h-14 items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    selected ? "border-navy-900 bg-navy-900 text-white shadow" : "border-stone-200 bg-stone-50 text-slate-800 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <svg aria-hidden className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {CATEGORY_ICONS[c]}
                  </svg>
                  {t.categories[c]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2. Fotografia */}
        <Section
          n={2}
          title="Fotografia de Fachada"
          subtitle="Imagens facilitam a identificação visual por calouros e visitantes"
          badge={<span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">JPG/PNG até 5MB</span>}
        >
          {shownPhoto ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização do arquivo escolhido ou foto já salva no backend */}
              <img src={shownPhoto} alt={`Fachada — ${name || "novo local"}`} className="aspect-video w-full object-cover" />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-navy-900/85 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                {newPhoto ? "Nova foto (enviada ao salvar)" : "✓ Foto principal definida"}
              </span>
              <div className="absolute right-3 top-3 flex gap-2">
                <label className="cursor-pointer rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy-900 shadow hover:bg-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-yellow">
                  Substituir imagem de fachada
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={handlePhoto}
                    aria-invalid={photoError}
                    aria-describedby={photoError ? "pl-photo-error" : undefined}
                  />
                </label>
                <button type="button" onClick={dropPhoto} className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-red-700 shadow hover:bg-white">
                  Remover
                </button>
              </div>
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-8 text-sm font-semibold text-white">
                {name || "Novo local"}
              </p>
            </div>
          ) : (
            <label
              className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center ${
                photoError ? "border-red-400 bg-red-50" : "border-stone-300 bg-stone-50 hover:border-navy-700 hover:bg-white"
              } has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-yellow`}
            >
              <svg aria-hidden className="size-9 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h3l2-3h6l2 3h3v13H4z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-sm font-semibold text-navy-900">Enviar fotografia de fachada</span>
              <span className="text-xs text-slate-500">JPG ou PNG, até 5MB</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={handlePhoto}
                aria-invalid={photoError}
                aria-describedby={photoError ? "pl-photo-error" : undefined}
              />
            </label>
          )}
          {photoError && (
            <p id="pl-photo-error" role="alert" className="mt-2 text-sm text-red-700">
              {MESSAGES.photo}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">O servidor reduz a imagem (até 1280 px) e a salva em JPEG ao salvar o local.</p>
        </Section>

        {/* 3. Localização e horário */}
        <Section
          n={3}
          title="Localização Geográfica & Horário"
          subtitle="Coordenadas precisas de GPS e horário de funcionamento"
          badge={
            position ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">✓ Georreferenciado</span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">Sem coordenadas</span>
            )
          }
        >
          <Field id="pl-address" label="Endereço / referência interna no campus">
            <input id="pl-address" className={inputCls()} placeholder="Ex: Bloco Central de Exatas, em frente ao CEAGRI II" value={address} onChange={(e) => change(setAddress)(e.target.value)} />
          </Field>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field id="pl-lat" label="Latitude (GPS)">
              <input id="pl-lat" inputMode="decimal" className={inputCls("lat")} placeholder="-8.01630" value={lat} onChange={(e) => change(setLat)(e.target.value)} onBlur={checkCoords} aria-invalid={!!errors.lat} />
            </Field>
            <Field id="pl-lng" label="Longitude (GPS)">
              <input id="pl-lng" inputMode="decimal" className={inputCls("lng")} placeholder="-34.95071" value={lng} onChange={(e) => change(setLng)(e.target.value)} onBlur={checkCoords} aria-invalid={!!errors.lng} />
            </Field>
            {/* FA-14.03 */}
            <button
              type="button"
              onClick={() => setPinOpen(true)}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 text-sm font-bold text-white hover:bg-navy-700 sm:col-span-1"
            >
              <svg aria-hidden className="size-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Ajustar pin no mapa
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Limites do campus Sede: latitude {CAMPUS_BOUNDS[0][0]} a {CAMPUS_BOUNDS[1][0]}, longitude {CAMPUS_BOUNDS[0][1]} a {CAMPUS_BOUNDS[1][1]}.
          </p>
          {place?.coordinatesSource && (
            <p className="mt-1 text-[11px] text-slate-500">Origem da coordenada cadastrada: {place.coordinatesSource}.</p>
          )}

          <div className="relative mt-3 h-44 overflow-hidden rounded-xl border border-stone-200">
            {position ? (
              <>
                <CampusMap key={`${position.lat}-${position.lng}`} markers={others} pin={position} initialCenter={position} />
                <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow">
                  <span aria-hidden className="mr-1 inline-block size-2 rounded-full bg-red-600" />
                  Ponto fixado: {shortName || "novo local"} (Lat: {latNum}, Long: {lngNum})
                </p>
              </>
            ) : (
              <div className="grid h-full place-items-center bg-stone-50 p-4 text-center text-xs text-slate-500">
                Informe a latitude e a longitude ou use &quot;Ajustar pin no mapa&quot; para georreferenciar o local.
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-800">
              Horário de funcionamento <span className="text-red-600">*</span>
            </p>
            {hoursText !== null ? (
              <input aria-label="Horário de funcionamento" className={`mt-2 ${inputCls("hours")}`} value={hoursText} onChange={(e) => change(setHoursText)(e.target.value)} placeholder="11:00-14:00, 17:30-19:30" />
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <input type="time" aria-label="Abertura" className={inputCls("hours")} value={open} onChange={(e) => change(setOpen)(e.target.value)} />
                <span className="text-xs text-slate-500">até</span>
                <input type="time" aria-label="Fechamento" className={inputCls("hours")} value={close} onChange={(e) => change(setClose)(e.target.value)} />
              </div>
            )}
            <p className="mt-1 text-[11px] text-slate-500">Dias: segunda a sexta-feira.</p>
          </div>
        </Section>
      </div>

      {/* 4. Descrição */}
      <Section n={4} title="Descrição" subtitle="Apresentação do local e orientação aos estudantes">
        <Field id="pl-desc" label="Descrição do local">
          <textarea
            id="pl-desc"
            rows={4}
            className={`${inputCls()} h-auto py-2.5`}
            placeholder="Informações sobre o local, serviços oferecidos e orientação aos estudantes..."
            value={description}
            onChange={(e) => change(setDescription)(e.target.value)}
          />
        </Field>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 5. Cursos */}
        <Section n={5} title="Cursos Vinculados" subtitle="Cursos sediados com aulas teóricas e práticas no prédio">
          {courseLinks.length === 0 ? (
            <p className="rounded-lg bg-stone-50 p-4 text-center text-xs text-slate-500">Nenhum curso vinculado a este local.</p>
          ) : (
            <ul className="space-y-2">
              {courseLinks.map((c) => {
                const detail = courseDetails.get(c.id);
                return (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-xs font-bold text-white">
                      {detail?.level === "POS" ? "PG" : "GR"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      {detail && (
                        <p className="text-[11px] text-slate-500">
                          {levelLabel(detail.level)}
                          {detail.shift ? ` • Turno ${detail.shift}` : ""}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => change(setCourseLinks)(courseLinks.filter((l) => l.id !== c.id))}
                      aria-label={`Remover ${c.name}`}
                      className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {/* RN-UC14.03: só cursos já cadastrados podem ser vinculados */}
          <div className="mt-3 flex gap-2">
            <select aria-label="Curso para vincular" className={inputCls()} value={courseToAdd} onChange={(e) => setCourseToAdd(e.target.value)} disabled={availableCourses.length === 0}>
              <option value="">
                {courseCatalog === null
                  ? "Carregando cursos..."
                  : availableCourses.length
                    ? "Selecione um curso cadastrado..."
                    : courseLinks.length
                      ? "Todos os cursos cadastrados já estão vinculados"
                      : "Nenhum curso cadastrado ainda"}
              </option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!courseToAdd}
              onClick={() => {
                const course = availableCourses.find((c) => String(c.id) === courseToAdd);
                if (course) change(setCourseLinks)([...courseLinks, { id: course.id, name: course.name }]);
                setCourseToAdd("");
              }}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-navy-900 hover:bg-stone-50 disabled:opacity-50"
            >
              ⊕ Vincular curso
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">Para vincular um curso novo, cadastre-o antes (UC34).</p>
        </Section>

        {/* 6. Serviços */}
        <Section n={6} title="Serviços Prestados no Local" subtitle="Serviços do catálogo (página Serviços) atendidos neste local">
          {serviceLinks.length === 0 ? (
            <p className="rounded-lg bg-stone-50 p-4 text-center text-xs text-slate-500">Nenhum serviço vinculado a este local.</p>
          ) : (
            <ul className="space-y-2">
              {serviceLinks.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{s.name}</p>
                  <button
                    type="button"
                    onClick={() => change(setServiceLinks)(serviceLinks.filter((l) => l.id !== s.id))}
                    aria-label={`Remover ${s.name}`}
                    className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <select aria-label="Serviço para vincular" className={inputCls()} value={serviceToAdd} onChange={(e) => setServiceToAdd(e.target.value)} disabled={availableServices.length === 0}>
              <option value="">
                {serviceCatalog === null
                  ? "Carregando serviços..."
                  : availableServices.length
                    ? "Selecione um serviço cadastrado..."
                    : serviceLinks.length
                      ? "Todos os serviços cadastrados já estão vinculados"
                      : "Nenhum serviço cadastrado ainda"}
              </option>
              {availableServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.active ? "" : " (despublicado)"}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!serviceToAdd}
              onClick={() => {
                const service = availableServices.find((s) => String(s.id) === serviceToAdd);
                if (service) change(setServiceLinks)([...serviceLinks, { id: service.id, name: service.name }]);
                setServiceToAdd("");
              }}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-navy-900 hover:bg-stone-50 disabled:opacity-50"
            >
              ⊕ Vincular serviço
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            O serviço aparece na página Serviços com este local. Para criar um serviço novo, use{" "}
            <Link href="/admin/servicos" className="underline">
              Serviços
            </Link>
            .
          </p>
        </Section>
      </div>

      {/* 7. Responsável */}
      <Section n={7} title="Responsável" subtitle="Nome e e-mail institucional de quem responde pelo local (coordenação, chefia ou secretaria)">
        {contacts.length === 0 ? (
          <p className="rounded-lg bg-stone-50 p-4 text-center text-xs text-slate-500">Nenhum responsável cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {contacts.map((c, i) => (
              <li key={i} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field id={`pl-contact-name-${i}`} label="Nome do responsável">
                  <input id={`pl-contact-name-${i}`} className={inputCls()} placeholder="Prof. Dr. Nome Sobrenome" value={c.name} onChange={(e) => updateContact(i, { name: e.target.value })} />
                </Field>
                <Field id={`pl-contact-email-${i}`} label="E-mail">
                  <input id={`pl-contact-email-${i}`} type="email" className={inputCls()} placeholder="secretaria@ufrpe.br" value={c.email} onChange={(e) => updateContact(i, { email: e.target.value })} />
                </Field>
                <button
                  type="button"
                  onClick={() => change(setContacts)(contacts.filter((_, j) => j !== i))}
                  aria-label={`Remover responsável ${i + 1}`}
                  className="grid size-11 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={contacts.length >= MAX_CONTACTS}
          onClick={() => change(setContacts)([...contacts, { name: "", email: "" }])}
          className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-navy-900 hover:bg-stone-50 disabled:opacity-50"
        >
          ⊕ Adicionar responsável
        </button>
      </Section>

      <Modal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        title="Marcar Coordenadas no Mapa"
        description="Defina a localização exata do prédio no campus Dois Irmãos"
        size="lg"
        icon={
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        }
      >
        {pinOpen && (
          <PinPicker
            markers={others}
            initial={position}
            onCancel={() => setPinOpen(false)}
            onConfirm={(coords) => {
              change(setLat)(formatCoord(coords.lat));
              change(setLng)(formatCoord(coords.lng));
              setErrors(withoutCoordErrors);
              if (summary === MESSAGES.coords || summary === MESSAGES.georef) setSummary(null);
              setPinOpen(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// Centro do campus Sede: posição inicial do pin quando o local ainda não tem coordenadas.
const CAMPUS_CENTER: LatLng = {
  lat: (CAMPUS_BOUNDS[0][0] + CAMPUS_BOUNDS[1][0]) / 2,
  lng: (CAMPUS_BOUNDS[0][1] + CAMPUS_BOUNDS[1][1]) / 2,
};

// FA-14.03: mapa em modo de edição; clique ou arraste o pin e confirme.
function PinPicker({
  markers,
  initial,
  onCancel,
  onConfirm,
}: {
  markers: MapMarker[];
  initial: LatLng | null;
  onCancel: () => void;
  onConfirm: (point: LatLng) => void;
}) {
  const [pin, setPin] = useState<LatLng>(initial ?? CAMPUS_CENTER);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const coords = pin;

  function useGps() {
    if (!("geolocation" in navigator)) {
      setGpsMessage("Não foi possível acessar o GPS do dispositivo.");
      return;
    }
    setGpsMessage("Obtendo sua localização...");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        const here = { lat: c.latitude, lng: c.longitude };
        if (!isInsideCampus(here)) {
          setGpsMessage("Você está fora dos limites do campus Sede. Posicione o pin manualmente.");
          return;
        }
        setPin(here);
        setMapKey((k) => k + 1);
        setGpsMessage(null);
      },
      () => setGpsMessage("Não foi possível acessar o GPS do dispositivo."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-80 overflow-hidden rounded-xl border border-slate-200">
        <CampusMap key={mapKey} markers={markers} pin={pin} onPinMove={setPin} initialCenter={pin} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span aria-hidden className="size-2 rounded-full bg-emerald-500" /> Posicionamento geográfico:
          </p>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Arrastável</span>
        </div>
        <p aria-live="polite" className="mt-2 flex justify-between rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm">
          <span>
            Latitude: <strong>{formatCoord(coords.lat)}</strong>
          </span>
          <span>
            Longitude: <strong>{formatCoord(coords.lng)}</strong>
          </span>
        </p>
        <p className="mt-2 text-xs text-slate-500">Clique no mapa ou arraste o pin para definir a localização exata do prédio para a rota de navegação.</p>
      </div>
      <button type="button" onClick={useGps} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50">
        <svg aria-hidden className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" />
        </svg>
        Usar minha localização atual (GPS)
      </button>
      {gpsMessage && (
        <p role="status" className="text-xs text-slate-600">
          {gpsMessage}
        </p>
      )}
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Este ponto será usado pelas rotas do mapa interativo para guiar estudantes até a entrada do prédio.
      </p>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Cancelar
        </button>
        <button type="button" onClick={() => onConfirm(pin)} className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-700">
          ✓ Confirmar localização
        </button>
      </div>
    </div>
  );
}

function Section({ n, title, subtitle, badge, children }: { n: number; title: string; subtitle: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={`sec-${n}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-navy-900 text-xs font-bold text-white">
            {n}
          </span>
          <div>
            <h2 id={`sec-${n}`} className="font-bold text-navy-900">
              {title}
            </h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {badge}
      </header>
      {children}
    </section>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
