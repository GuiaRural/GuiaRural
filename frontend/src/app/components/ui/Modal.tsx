"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";

// Usa <dialog> nativo: foco preso no modal, Esc fecha e o fundo fica inerte.
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
  closeOnBackdrop = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  // Só para avisos: em formulários, um clique fora sem querer perderia o que foi digitado.
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useLanguage();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const width = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // O clique no fundo escurecido chega ao próprio <dialog>; cliques no conteúdo têm outro alvo.
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%-2rem)] ${width} overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/60`}
    >
      {open && (
        <>
          <header className="flex items-start justify-between gap-3 bg-navy-900 px-5 py-4 text-white sm:px-6">
            <div className="flex items-center gap-3">
              {icon && (
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg border border-blue-300/40 bg-blue-500/20 text-blue-200">
                  {icon}
                </span>
              )}
              <div>
                <h2 id={titleId} className="text-lg font-bold">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-xs text-slate-300">{description}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-yellow"
            >
              <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>
          <div className="max-h-[75dvh] overflow-y-auto p-5">{children}</div>
        </>
      )}
    </dialog>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Sim",
  cancelLabel = "Não",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="text-sm text-slate-700">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60 ${
            danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-navy-900 text-white hover:bg-navy-700"
          }`}
        >
          {busy ? "Aguarde..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
