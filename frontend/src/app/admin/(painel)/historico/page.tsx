"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import PageHeader, { primaryButton, secondaryButton } from "../../../components/admin/PageHeader";
import Modal, { ConfirmModal } from "../../../components/ui/Modal";
import type { AuditAction, AuditEntity, AuditLog } from "../../../data/mockAuditLogs";
import { listLogs } from "../../../services/auditService";
import { canRestore, restoreFromLog } from "../../../services/restoreService";

const ENTITIES: ("todos" | AuditEntity)[] = ["todos", "Local", "Aviso", "Cardápio", "Acolhimento", "Serviço", "Administrador"];

const ACTIONS: Record<AuditAction, [string, string]> = {
  criado: ["Criado", "bg-emerald-50 text-emerald-800 border-emerald-200"],
  editado: ["Editado", "bg-blue-50 text-blue-800 border-blue-200"],
  deletado: ["Deletado", "bg-red-50 text-red-700 border-red-200"],
  restaurado: ["Restaurado", "bg-amber-50 text-amber-800 border-amber-200"],
};

// Nomes legíveis dos campos guardados nos snapshots; campos sem rótulo aparecem com o nome técnico.
const FIELD_LABELS: Record<string, string> = {
  id: "Identificador",
  name: "Nome",
  shortName: "Sigla",
  category: "Categoria",
  status: "Status",
  operation: "Status operacional",
  hours: "Horário",
  address: "Endereço",
  position: "Posição no mapa",
  description: "Descrição",
  services: "Serviços",
  accessibility: "Acessibilidade",
  photoDataUrl: "Foto",
  courseIds: "Cursos vinculados",
  phone: "Telefone",
  email: "E-mail",
  sector: "Setor",
  permission: "Permissão",
  date: "Data",
  shift: "Turno",
  main: "Prato principal",
  vegetarian: "Opção vegetariana",
  sides: "Acompanhamentos",
  salad: "Salada",
  dessert: "Sobremesa",
  drink: "Bebida",
  title: "Título",
  createdAt: "Criado em",
  summary: "Resumo",
  section: "Seção",
  blocks: "Blocos de conteúdo",
  links: "Links de apoio",
  source: "Fonte",
};

const PAGE_SIZE = 10;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    // Listas de objetos (blocos, links) ficam resumidas; o conteúdo completo é restaurado mesmo assim.
    if (value.some((v) => typeof v === "object" && v !== null)) return `${value.length} itens`;
    return value.map(formatValue).join(", ");
  }
  // Texto traduzido ({ pt, en, es }): mostra o português e quais idiomas existem.
  if (typeof value === "object" && "pt" in value) {
    const t = value as Record<string, string | undefined>;
    const langs = ["en", "es"].filter((l) => t[l]).map((l) => l.toUpperCase());
    return langs.length ? `${t.pt} (+${langs.join(", ")})` : String(t.pt);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function diffRows(log: AuditLog) {
  const keys = [...new Set([...Object.keys(log.before ?? {}), ...Object.keys(log.after ?? {})])];
  return keys.map((key) => {
    const before = formatValue(log.before?.[key]);
    const after = formatValue(log.after?.[key]);
    return { key, label: FIELD_LABELS[key] ?? key, before, after, changed: before !== after };
  });
}

// UC23 — Visualizar logs de mudanças
export default function HistoryPage() {
  const { session } = useAdmin();
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [entity, setEntity] = useState<(typeof ENTITIES)[number]>("todos");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function load() {
    listLogs()
      .then((all) => {
        setLogs(all);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }
  useEffect(load, []);

  const q = normalize(query.trim());
  const filtered = (logs ?? []).filter(
    (l) => (entity === "todos" || l.entity === entity) && (!q || [l.entityName, l.author].some((v) => normalize(v).includes(q))),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // FA01: desfazer a alteração selecionada.
  async function restore() {
    if (!selected) return;
    setRestoring(true);
    try {
      await restoreFromLog(selected, session.name);
      setMessage({ kind: "ok", text: `"${selected.entityName}" voltou à versão anterior. A restauração foi registrada no histórico.` });
      setSelected(null);
      setPage(1);
      load();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Não foi possível restaurar a versão anterior." });
    } finally {
      setRestoring(false);
      setConfirming(false);
    }
  }

  // FE01: nenhuma modificação registrada.
  if (logs && logs.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <PageHeader title="Histórico de mudanças" subtitle="Logs de auditoria do painel administrativo." />
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold text-navy-900">Nenhuma modificação registrada</p>
          <p className="mt-1 text-sm text-slate-600">Assim que locais, avisos, cardápios ou conteúdos de acolhimento forem alterados, as mudanças aparecerão aqui.</p>
          <Link href="/admin" className={`${primaryButton} mt-5`}>
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Histórico de mudanças"
        subtitle="Quem criou, editou ou deletou locais, avisos, cardápios, conteúdos de acolhimento e administradores. Os registros não podem ser apagados."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filtrar por tipo de registro" className="flex flex-wrap gap-1 rounded-full bg-slate-200/70 p-1">
          {ENTITIES.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={entity === key}
              onClick={() => {
                setEntity(key);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${entity === key ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-white"}`}
            >
              {key === "todos" ? "Todos" : key}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar por registro ou autor</span>
          <svg aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por registro ou autor"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
          />
        </label>
      </div>

      {message && (
        <p role="status" className={`rounded-lg p-3 text-sm ${message.kind === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </p>
      )}

      {failed ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold">Erro ao consultar o histórico.</p>
          <button type="button" onClick={load} className={`${secondaryButton} mt-3`}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Data e hora</th>
                <th className="px-4 py-3 font-semibold">Registro</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Ação</th>
                <th className="px-4 py-3 font-semibold">Responsável</th>
                <th className="px-4 py-3 text-right font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!logs && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Carregando...
                  </td>
                </tr>
              )}
              {logs && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Nenhuma modificação registrada para este filtro.
                  </td>
                </tr>
              )}
              {visible.map((l) => (
                <tr key={l.id} onClick={() => setSelected(l)} className="cursor-pointer hover:bg-amber-50/40">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{new Date(l.at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{l.entityName}</td>
                  <td className="px-4 py-3 text-slate-700">{l.entity}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ACTIONS[l.action][1]}`}>{ACTIONS[l.action][0]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.author}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(l);
                      }}
                      aria-label={`Ver detalhes da mudança em ${l.entityName}`}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            <span>
              Mostrando {visible.length} de {filtered.length} registros
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
      )}

      {/* Passo 2: detalhes com dados anteriores e atualizados */}
      <Modal
        open={selected !== null && !confirming}
        onClose={() => setSelected(null)}
        title="Detalhes da alteração"
        description={selected ? `${selected.entity} · ${selected.entityName}` : undefined}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <dl className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Ação</dt>
                <dd className="mt-1">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ACTIONS[selected.action][1]}`}>{ACTIONS[selected.action][0]}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Responsável</dt>
                <dd className="mt-1 font-semibold text-slate-900">{selected.author}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Data e hora</dt>
                <dd className="mt-1 font-semibold text-slate-900">{new Date(selected.at).toLocaleString("pt-BR")}</dd>
              </div>
            </dl>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Campo</th>
                    <th className="px-3 py-2 font-semibold">Dados anteriores</th>
                    <th className="px-3 py-2 font-semibold">Dados atualizados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diffRows(selected).map((row) => (
                    <tr key={row.key} className={row.changed ? "" : "text-slate-500"}>
                      <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-800">
                        {row.label}
                      </th>
                      <td className={`px-3 py-2 align-top break-words ${row.changed ? "bg-red-50/60 text-red-900 line-through decoration-red-300" : ""}`}>{row.before}</td>
                      <td className={`px-3 py-2 align-top break-words ${row.changed ? "bg-emerald-50/60 font-medium text-emerald-900" : ""}`}>{row.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selected.before === null && <p className="text-xs text-slate-500">O registro não existia antes desta mudança: desfazer remove o registro.</p>}
            {selected.after === null && <p className="text-xs text-slate-500">O registro foi deletado nesta mudança: desfazer traz o registro de volta.</p>}
            {!canRestore(selected) && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">A restauração de serviços ainda não é suportada pelo backend.</p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setSelected(null)} className={`${secondaryButton} justify-center`}>
                Fechar
              </button>
              <button type="button" disabled={!canRestore(selected)} onClick={() => setConfirming(true)} className={`${primaryButton} justify-center`}>
                <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6" />
                  <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
                </svg>
                Desfazer / Restaurar versão anterior
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={confirming}
        title="Restaurar versão anterior"
        busy={restoring}
        confirmLabel="Sim"
        cancelLabel="Não"
        message={`"${selected?.entityName}" voltará ao estado anterior a esta mudança. A restauração também ficará registrada no histórico.`}
        onCancel={() => setConfirming(false)}
        onConfirm={restore}
      />
    </div>
  );
}
