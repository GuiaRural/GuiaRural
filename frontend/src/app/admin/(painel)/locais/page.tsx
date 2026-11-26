"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PageHeader, { ctaButton } from "../../../components/admin/PageHeader";
import PlaceDescriptionModal from "../../../components/admin/PlaceDescriptionModal";
import { ConfirmModal } from "../../../components/ui/Modal";
import { dictionaries } from "../../../i18n/dictionaries";
import { takeFlash } from "../../../lib/flash";
import { formatCoord } from "../../../lib/geo";
import { PlaceValidationError, deletePlace, listAllPlaces, setPlaceStatus, type Place, type PlaceStatus } from "../../../services/placesService";

const PAGE_SIZE = 6;
const SEARCH_DELAY_MS = 300;
const FILTERS = [
  ["todos", "Todos"],
  ["publicado", "Ativos"],
  ["rascunho", "Rascunhos"],
  ["inativo", "Inativos"],
] as const;
type Filter = (typeof FILTERS)[number][0];

const STATUS: Record<PlaceStatus, [string, string]> = {
  publicado: ["Publicado", "bg-emerald-50 text-emerald-800 border-emerald-200"],
  rascunho: ["Rascunho", "bg-amber-50 text-amber-800 border-amber-200"],
  inativo: ["Inativo", "bg-slate-100 text-slate-600 border-slate-200"],
};

const categories = dictionaries.pt.categories;

// Busca sem diferença de maiúsculas nem acentos.
function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export default function PlacesAdminPage() {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");
  // query é o texto do campo; term é o termo já aplicado à lista, depois do debounce.
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Place | null>(null);
  const [describing, setDescribing] = useState<Place | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function reload() {
    listAllPlaces()
      .then(setPlaces)
      .catch(() => setMessage({ kind: "error", text: "Não foi possível carregar a lista de locais. Tente novamente." }));
  }
  // Ao abrir, mostra a mensagem deixada pelo cadastro ao salvar (UC14).
  useEffect(() => {
    const flash = takeFlash();
    listAllPlaces()
      .then((all) => {
        setPlaces(all);
        if (flash) setMessage({ kind: "ok", text: flash });
      })
      .catch(() => {
        setPlaces([]);
        setMessage({ kind: "error", text: "Não foi possível carregar a lista de locais. Tente novamente." });
      });
  }, []);

  useEffect(() => {
    if (query === term) return;
    const timer = setTimeout(() => {
      setTerm(query);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, term]);

  function clearSearch() {
    setQuery("");
    setTerm("");
    setPage(1);
    searchRef.current?.focus();
  }

  const q = normalize(term);
  const filtered = (places ?? []).filter((p) => (filter === "todos" || p.status === filter) && normalize(p.name).includes(q));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  async function toggleStatus(place: Place) {
    try {
      const next: PlaceStatus = place.status === "publicado" ? "inativo" : "publicado";
      await setPlaceStatus(place.id, next);
      setMessage({ kind: "ok", text: `${place.name} agora está ${STATUS[next][0].toLowerCase()}.` });
      reload();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof PlaceValidationError ? err.message : "Não foi possível alterar o status." });
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Locais"
        subtitle="Prédios, departamentos e pontos de referência do campus."
        actions={
          <Link href="/admin/locais/novo" className={`${ctaButton} h-11 px-5 text-base`}>
            <span aria-hidden className="text-lg leading-none">+</span> Adicionar local
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filtrar locais" className="flex gap-1 rounded-full bg-slate-200/70 p-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === key ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto sm:min-w-64 sm:max-w-md sm:flex-1">
          <label htmlFor="place-search" className="sr-only">
            Buscar local por nome
          </label>
          <svg aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          {/* O "x" nativo do type="search" fica oculto: o botão ao lado funciona igual em todos os navegadores. */}
          <input
            ref={searchRef}
            id="place-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar local por nome..."
            className="h-10 w-full rounded-full border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpar busca"
              title="Limpar busca"
              className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-900"
            >
              <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>
        <p aria-live="polite" className="text-xs font-semibold text-slate-500">
          {filtered.length} registros
        </p>
      </div>

      {message && (
        <p role="status" className={`rounded-lg p-3 text-sm ${message.kind === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Local</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Horário</th>
              <th className="px-4 py-3 font-semibold">Vínculos</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!places && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {places && visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  {q ? (
                    <>
                      Nenhum local encontrado para &apos;{term.trim()}&apos;.{" "}
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="rounded font-semibold text-navy-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                      >
                        Limpar busca
                      </button>
                    </>
                  ) : (
                    "Nenhum local neste filtro."
                  )}
                </td>
              </tr>
            )}
            {visible.map((p) => {
              const coords = p.position;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {coords ? `${formatCoord(coords.lat)}, ${formatCoord(coords.lng)}` : "sem coordenadas"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{categories[p.category]}</td>
                  <td className="px-4 py-3 text-slate-700">{p.hours.replaceAll("-", "–")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {p.services.length} serviços · {p.courses.length} cursos
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS[p.status][1]}`}>{STATUS[p.status][0]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/locais/${p.id}`} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                        {p.status === "rascunho" ? "Continuar" : "Editar"}
                      </Link>
                      {/* UC28: ação própria para editar só a descrição */}
                      <button type="button" onClick={() => setDescribing(p)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                        Editar descrição
                      </button>
                      {p.status !== "rascunho" && (
                        <button type="button" onClick={() => toggleStatus(p)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                          {p.status === "publicado" ? "Desativar" : "Ativar"}
                        </button>
                      )}
                      <button type="button" onClick={() => setToDelete(p)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>
            Mostrando {visible.length} de {filtered.length} locais cadastrados
          </span>
          <nav aria-label="Paginação" className="flex gap-1">
            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">
              Anterior
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === current ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`rounded px-2 py-1 font-semibold ${n === current ? "bg-brand-yellow text-navy-900" : "border border-slate-300"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40">
              Próximo
            </button>
          </nav>
        </div>
      </div>

      {describing && (
        <PlaceDescriptionModal
          key={describing.id}
          place={describing}
          onClose={() => setDescribing(null)}
          onSaved={(saved) => {
            setDescribing(null);
            setMessage({ kind: "ok", text: `A descrição de "${saved.name}" foi atualizada. A alteração está no histórico de mudanças.` });
            reload();
          }}
        />
      )}

      <ConfirmModal
        open={toDelete !== null}
        title="Excluir local"
        danger
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        message={`"${toDelete?.name}" deixará de aparecer no mapa e na busca. A exclusão fica registrada no histórico de mudanças, mas ainda não pode ser desfeita por lá.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deletePlace(toDelete.id);
            setMessage({ kind: "ok", text: `${toDelete.name} foi excluído.` });
            reload();
          } catch {
            setMessage({ kind: "error", text: `Não foi possível excluir ${toDelete.name}. Tente novamente.` });
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
