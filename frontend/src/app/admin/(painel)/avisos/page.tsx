"use client";

import { useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import Icon from "../../../components/common/Icon";
import ApiFailure from "../../../components/courses/ApiFailure";
import AvisoCard from "../../../components/notices/AvisoCard";
import DeleteAvisoModal from "../../../components/notices/DeleteAvisoModal";
import { useApi } from "../../../hooks/useApi";
import { deleteAviso, listAvisos, type Aviso } from "../../../services/avisosService";

const noArg = null;

const actionButton = "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-navy-900";

function AvisoActions({ aviso, onDelete }: { aviso: Aviso; onDelete: () => void }) {
  return (
    <>
      {/* Edição de avisos é outro caso de uso, ainda não implementado. */}
      <button
        type="button"
        disabled
        title="Edição de avisos ainda não disponível"
        aria-label={`Editar aviso: ${aviso.nome}`}
        className={`${actionButton} cursor-not-allowed bg-slate-100 text-navy-700`}
      >
        <Icon name="pencil" className="size-3.5" /> Editar
      </button>
      <button type="button" onClick={onDelete} aria-label={`Deletar aviso: ${aviso.nome}`} className={`${actionButton} bg-red-50 text-red-600 hover:bg-red-100`}>
        <Icon name="trash" className="size-3.5" /> Deletar
      </button>
    </>
  );
}

// Avisos do campus, visão do administrador (UC18 — Deletar Aviso).
export default function AdminAvisosPage() {
  const { session } = useAdmin();
  // Contas "Somente leitura" veem os avisos, mas não podem alterá-los.
  const canManage = session.permission !== "leitura";
  const state = useApi(listAvisos, noArg);
  const [toDelete, setToDelete] = useState<Aviso | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  // RN-18.02: o aviso excluído sai da lista na hora, sem recarregar.
  const avisos = state.status === "ready" ? state.data.filter((a) => !deletedIds.includes(a.id)) : null;
  const latest = avisos?.[0];

  function openDelete(aviso: Aviso) {
    setShowSuccess(false);
    setDeleteError(null);
    setToDelete(aviso);
  }

  function cancelDelete() {
    setToDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAviso(toDelete.id);
      setDeletedIds((ids) => [...ids, toDelete.id]);
      setToDelete(null);
      setShowSuccess(true);
    } catch {
      // FE-18.01: o modal continua aberto para nova tentativa.
      setDeleteError("Não foi possível concluir a exclusão. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      {showSuccess && (
        // Com muitos avisos a lista rola; traz a mensagem para a tela ao aparecer.
        <div ref={(el) => el?.scrollIntoView({ block: "nearest" })} role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Aviso excluído com sucesso!</p>
            <p className="mt-0.5 text-sm text-emerald-800">O comunicado institucional foi despublicado e removido do mural oficial do campus.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Fechar mensagem"
            className="grid size-8 shrink-0 place-items-center rounded-md text-emerald-700 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-navy-700">
            <span aria-hidden className="h-0.5 w-6 bg-brand-yellow" />
            Comunicação institucional
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">Avisos do campus</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Informações importantes sobre serviços, horários e atividades do Campus Dois Irmãos.
          </p>
        </div>
        {avisos && (
          <p className="rounded-lg border border-slate-200 bg-sand-100 px-4 py-2 text-xs text-slate-600">
            <strong className="block text-navy-900">
              {avisos.length} {avisos.length === 1 ? "aviso publicado" : "avisos publicados"}
            </strong>
            {latest && `Atualizado em ${new Date(latest.data).toLocaleDateString("pt-BR", { dateStyle: "long" })}`}
          </p>
        )}
      </div>

      {state.status === "loading" && <p className="text-sm text-slate-600">Carregando avisos...</p>}
      {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
      {avisos?.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">Nenhum aviso publicado no momento.</p>
      )}
      {avisos && avisos.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span aria-hidden>↓</span> Mais recentes primeiro
          </p>
          <ul className="space-y-4">
            {avisos.map((aviso) => (
              <li key={aviso.id}>
                <AvisoCard
                  aviso={aviso}
                  latestLabel={aviso === latest ? "Mais recente" : undefined}
                  actions={canManage && <AvisoActions aviso={aviso} onDelete={() => openDelete(aviso)} />}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <DeleteAvisoModal aviso={toDelete} busy={deleting} error={deleteError} onCancel={cancelDelete} onConfirm={confirmDelete} />
    </div>
  );
}
