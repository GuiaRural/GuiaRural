"use client";

import { useEffect, useId, useRef } from "react";
import type { Aviso } from "../../services/avisosService";
import Icon from "../common/Icon";

// UC18 — confirmação obrigatória antes de excluir um aviso (RN-18.01).
// Mesmo <dialog> nativo do Modal (foco preso, Esc fecha), com o visual do protótipo: sem cabeçalho azul.
export default function DeleteAvisoModal({
  aviso,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  // Aviso a excluir; null mantém o modal fechado.
  aviso: Aviso | null;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const textId = useId();
  const open = aviso !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const date = aviso ? new Date(aviso.data) : null;

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby={titleId}
      aria-describedby={textId}
      className="m-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      {aviso && date && (
        <>
          <div className="space-y-5 p-5 sm:p-8">
            <div className="flex gap-4">
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                <Icon name="trash" className="size-5" />
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded bg-red-50 px-2 py-0.5 font-bold uppercase tracking-wide text-red-700">Ação irreversível</span>
                  • Área de Gestão
                </p>
                <h2 id={titleId} className="mt-2 text-xl font-bold text-navy-900 sm:text-2xl">
                  Confirmar exclusão de aviso
                </h2>
                <p id={textId} className="mt-2 text-sm text-slate-600 sm:text-base">
                  Tem certeza de que deseja excluir o aviso <strong className="text-navy-900">&quot;{aviso.nome}&quot;</strong>? Esta ação
                  removerá o comunicado do mural público do Campus Dois Irmãos e não poderá ser desfeita.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Item selecionado para remoção</p>
              <div className="mt-3 flex items-center gap-3">
                <time
                  dateTime={aviso.data}
                  className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white text-navy-900"
                >
                  <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                  <span className="mt-1 text-[10px] uppercase">
                    {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")} {date.getFullYear()}
                  </span>
                </time>
                <div className="min-w-0">
                  <p className="font-semibold text-navy-900">{aviso.nome}</p>
                  <p className="truncate text-sm text-slate-600">{aviso.descricao}</p>
                </div>
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              Usuários conectados deixarão de visualizar este aviso imediatamente após a exclusão.
            </p>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3 bg-slate-50 px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-900 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60"
            >
              <Icon name="trash" className="size-4" />
              {busy ? "Excluindo..." : "Sim, excluir aviso"}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
