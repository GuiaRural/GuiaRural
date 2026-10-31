"use client";

import { PERMISSIONS } from "../../data/mockAdmins";
import type { Session } from "../../services/authService";
import Modal from "../ui/Modal";

export function LogoutIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.replace(/^(Prof[a]?\.|Dr[a]?\.)\s*/i, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// UC24 — Logout: confirmação (RN-01), cancelamento (FA01) e aviso de alterações não salvas (FE01).
export default function LogoutModal({
  open,
  session,
  dirty,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  session: Session;
  dirty: boolean;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title="Sair do painel"
      description="Encerrar a sessão na área do administrador"
      icon={<LogoutIcon className="size-4" />}
      size="sm"
    >
      <div className="space-y-4 sm:px-1 sm:py-1">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-brand-yellow">
            {initials(session.name)}
          </span>
          <div className="min-w-0 text-sm leading-tight">
            <p className="truncate font-semibold text-navy-900">{session.name}</p>
            <p className="truncate text-xs text-slate-500">{session.email}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {session.sector} · {PERMISSIONS[session.permission]}
            </p>
          </div>
        </div>

        {dirty ? (
          <div role="alert" className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <svg aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <div>
              <p className="font-semibold">Há alterações não salvas neste formulário.</p>
              <p className="mt-0.5">Se sair agora, as edições serão perdidas.</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700">Deseja realmente encerrar sua sessão na área do administrador?</p>
        )}

        <p className="text-xs text-slate-500">Para voltar ao painel será preciso entrar novamente com seu e-mail institucional.</p>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-brand-yellow disabled:opacity-60"
          >
            {dirty ? "Voltar ao formulário" : "Não, continuar"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-brand-yellow disabled:opacity-60 ${
              dirty ? "bg-red-600 hover:bg-red-700" : "bg-navy-900 hover:bg-navy-700"
            }`}
          >
            {busy ? (
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <LogoutIcon className="size-4" />
            )}
            {busy ? "Encerrando sessão..." : dirty ? "Descartar e sair" : "Sim, sair"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
