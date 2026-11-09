"use client";

import { useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import Icon from "../../../components/common/Icon";
import ApiFailure from "../../../components/courses/ApiFailure";
import { ConfirmModal } from "../../../components/ui/Modal";
import ServiceFormModal from "../../../components/services/ServiceFormModal";
import ServiceCard from "../../../components/services/ServiceCard";
import { useApi } from "../../../hooks/useApi";
import { deleteServico, listServicos, type Servico } from "../../../services/servicosService";

const noArg = null;

const actionButton = "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold";

// Serviço despublicado não aparece para os estudantes (só aqui no painel).
function UnpublishedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">Despublicado</span>
  );
}

function ServiceActions({ servico, onEdit, onDelete }: { servico: Servico; onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      {!servico.active && <UnpublishedBadge />}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar serviço: ${servico.name}`}
        className={`${actionButton} bg-slate-100 text-navy-700 hover:bg-slate-200`}
      >
        <Icon name="pencil" className="size-3.5" /> Editar
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Deletar serviço: ${servico.name}`}
        className={`${actionButton} bg-red-50 text-red-700 hover:bg-red-100`}
      >
        <Icon name="trash" className="size-3.5" /> Deletar
      </button>
    </>
  );
}

// Serviços estudantis, visão do administrador (UC19 — Adicionar Serviço).
export default function AdminServicosPage() {
  const { session } = useAdmin();
  // Contas "Somente leitura" veem os serviços, mas não podem alterá-los.
  const canManage = session.permission !== "leitura";
  const state = useApi(listServicos, noArg);
  const [creating, setCreating] = useState(false);
  // Serviços criados nesta visita: entram no topo da lista na hora, sem recarregar, e recebem o selo "Novo".
  const [added, setAdded] = useState<Servico[]>([]);
  const [success, setSuccess] = useState<Servico | null>(null);
  const [editing, setEditing] = useState<Servico | null>(null);
  // Serviços editados ou excluídos nesta visita valem sobre a lista que veio do servidor, sem recarregar.
  const [edits, setEdits] = useState<Record<number, Servico>>({});
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [toDelete, setToDelete] = useState<Servico | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const servicos =
    state.status === "ready"
      ? [...added, ...state.data.filter((s) => !added.some((a) => a.id === s.id))]
          .map((s) => edits[s.id] ?? s)
          .filter((s) => !deletedIds.includes(s.id))
      : null;

  function handleCreated(servico: Servico) {
    setCreating(false);
    setAdded((list) => [servico, ...list]);
    setFlash(null);
    setSuccess(servico);
  }

  function handleEdited(servico: Servico) {
    setEditing(null);
    setEdits((map) => ({ ...map, [servico.id]: servico }));
    setSuccess(null);
    setFlash(`Serviço "${servico.name}" atualizado com sucesso.${servico.active ? "" : " Ele está despublicado e não aparece para os estudantes."}`);
  }

  function openEdit(servico: Servico) {
    setSuccess(null);
    setFlash(null);
    setEditing(servico);
  }

  function openDelete(servico: Servico) {
    setSuccess(null);
    setFlash(null);
    setDeleteError(null);
    setToDelete(servico);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteServico(toDelete.id);
      setDeletedIds((ids) => [...ids, toDelete.id]);
      setFlash(`Serviço "${toDelete.name}" excluído. A exclusão fica registrada no histórico de mudanças.`);
      setToDelete(null);
    } catch {
      // O modal continua aberto para nova tentativa.
      setDeleteError("Não foi possível excluir o serviço. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-navy-700">
          <Icon name="ticket" className="size-5" />
        </span>
        <div className="min-w-0 flex-1 basis-60">
          <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Gerenciamento de Serviços</h1>
          <p className="mt-1 text-sm text-slate-600">
            Serviços estudantis exibidos para os alunos: como solicitar, requisitos, prazos e editais.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setCreating(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Icon name="plus" className="size-4" /> Adicionar Novo Serviço
          </button>
        )}
      </div>

      {success && (
        // RN-19.02: o serviço salvo já está publicado para os estudantes.
        <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Novo serviço &quot;{success.name}&quot; publicado com sucesso!</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-emerald-800">
              Já visível para os estudantes.
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-300">
                Recém adicionado
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Fechar mensagem"
            className="grid size-8 shrink-0 place-items-center rounded-md text-emerald-700 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      )}

      {flash && (
        <p role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          <span>{flash}</span>
          <button type="button" onClick={() => setFlash(null)} aria-label="Fechar mensagem" className="shrink-0 text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </p>
      )}

      {state.status === "loading" && <p className="text-sm text-slate-600">Carregando serviços...</p>}
      {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
      {servicos?.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">Nenhum serviço cadastrado no momento.</p>
      )}
      {servicos && servicos.length > 0 && (
        <ul className="space-y-4">
          {servicos.map((servico) => (
            <li key={servico.id}>
              <ServiceCard
                servico={servico}
                isNew={added.some((a) => a.id === servico.id)}
                actions={
                  canManage ? (
                    <ServiceActions servico={servico} onEdit={() => openEdit(servico)} onDelete={() => openDelete(servico)} />
                  ) : !servico.active ? (
                    <UnpublishedBadge />
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <ServiceFormModal open={creating} onCancel={() => setCreating(false)} onSaved={handleCreated} />
      <ServiceFormModal open={editing !== null} servico={editing} onCancel={() => setEditing(null)} onSaved={handleEdited} />
      <ConfirmModal
        open={toDelete !== null}
        title="Excluir serviço"
        danger
        busy={deleting}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        message={
          <>
            <p>
              &quot;{toDelete?.name}&quot; deixará de existir para os estudantes. A exclusão não pode ser desfeita por aqui, mas fica no histórico de mudanças.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {deleteError}
              </p>
            )}
          </>
        }
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
