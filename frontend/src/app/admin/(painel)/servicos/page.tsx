"use client";

import { useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import Icon from "../../../components/common/Icon";
import ApiFailure from "../../../components/courses/ApiFailure";
import NewServiceModal from "../../../components/services/NewServiceModal";
import ServiceCard from "../../../components/services/ServiceCard";
import { useApi } from "../../../hooks/useApi";
import { listServicos, type Servico } from "../../../services/servicosService";

const noArg = null;

const actionButton = "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold";

// Editar (UC20) e Deletar (UC21) são outros casos de uso, ainda não implementados.
function ServiceActions({ servico }: { servico: Servico }) {
  return (
    <>
      <button
        type="button"
        disabled
        title="Edição de serviços ainda não disponível"
        aria-label={`Editar serviço: ${servico.name}`}
        className={`${actionButton} cursor-not-allowed bg-slate-100 text-navy-700`}
      >
        <Icon name="pencil" className="size-3.5" /> Editar
      </button>
      <button
        type="button"
        disabled
        title="Exclusão de serviços ainda não disponível"
        aria-label={`Deletar serviço: ${servico.name}`}
        className={`${actionButton} cursor-not-allowed bg-red-50 text-red-700`}
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
  const servicos =
    state.status === "ready" ? [...added, ...state.data.filter((s) => !added.some((a) => a.id === s.id))] : null;

  function handleCreated(servico: Servico) {
    setCreating(false);
    setAdded((list) => [servico, ...list]);
    setSuccess(servico);
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
                actions={canManage && <ServiceActions servico={servico} />}
              />
            </li>
          ))}
        </ul>
      )}

      <NewServiceModal
        open={creating}
        onCancel={() => setCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
