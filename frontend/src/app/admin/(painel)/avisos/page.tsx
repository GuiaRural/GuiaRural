"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import PageHeader, { ctaButton, primaryButton, secondaryButton } from "../../../components/admin/PageHeader";
import Modal, { ConfirmModal } from "../../../components/ui/Modal";
import type { Notice } from "../../../data/mockNotices";
import { NoticeValidationError, createNotice, deleteNotice, listNotices, updateNotice, type NoticeInput } from "../../../services/noticesService";

const MAX_DESCRIPTION = 600;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Avisos do campus: CRUD do painel sobre /api/avisos; o resultado aparece em /avisos.
export default function NoticesAdminPage() {
  const { session } = useAdmin();
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [query, setQuery] = useState("");
  // null: modal fechado; "novo": criação; Notice: edição.
  const [editing, setEditing] = useState<Notice | "novo" | null>(null);
  const [toDelete, setToDelete] = useState<Notice | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function reload() {
    listNotices().then(setNotices);
  }
  useEffect(reload, []);

  const q = normalize(query.trim());
  const visible = notices?.filter((n) => !q || normalize(`${n.title} ${n.description}`).includes(q));

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Avisos do campus"
        subtitle="Comunicados exibidos na página pública Avisos do campus, do mais recente para o mais antigo."
        actions={
          <>
            <Link href="/avisos" className={`${secondaryButton} h-11`}>
              Ver página pública
            </Link>
            <button type="button" onClick={() => setEditing("novo")} className={`${ctaButton} h-11 px-5 text-base`}>
              <span aria-hidden className="text-lg leading-none">+</span> Novo aviso
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Buscar aviso</span>
          <svg aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou texto"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
          />
        </label>
        <p className="text-xs font-semibold text-slate-500">{visible?.length ?? 0} avisos</p>
      </div>

      {message && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {message}
        </p>
      )}

      {!notices && <p className="text-sm text-slate-500">Carregando...</p>}
      {notices && visible!.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-bold text-navy-900">{notices.length ? "Nenhum aviso encontrado" : "Nenhum aviso publicado"}</p>
          <p className="mt-1 text-sm text-slate-600">{notices.length ? "Tente outra busca." : "Os avisos criados aqui aparecem para todos os visitantes."}</p>
        </div>
      )}

      <ul className="space-y-3">
        {visible?.map((n) => (
          <li key={n.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {new Date(n.createdAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                </p>
                <h2 className="mt-1 font-semibold text-navy-900">{n.title}</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{n.description}</p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setEditing(n)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                  Editar
                </button>
                <button type="button" onClick={() => setToDelete(n)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                  Excluir
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "novo" ? "Novo aviso" : "Editar aviso"}
        description="Visível para todos na página Avisos do campus"
      >
        {editing !== null && (
          <NoticeForm
            key={editing === "novo" ? "novo" : editing.id}
            notice={editing === "novo" ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={async (input) => {
              if (editing === "novo") {
                await createNotice(input, session.name);
                setMessage(`Aviso "${input.title.trim()}" publicado.`);
              } else {
                await updateNotice(editing.id, input, session.name);
                setMessage(`Aviso "${input.title.trim()}" atualizado.`);
              }
              setEditing(null);
              reload();
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        open={toDelete !== null}
        title="Excluir aviso"
        danger
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        message={`"${toDelete?.title}" deixará de aparecer no site. A exclusão pode ser desfeita pelo histórico de mudanças.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteNotice(toDelete.id, session.name);
          setMessage(`Aviso "${toDelete.title}" excluído.`);
          setToDelete(null);
          reload();
        }}
      />
    </div>
  );
}

function NoticeForm({ notice, onCancel, onSave }: { notice: Notice | null; onCancel: () => void; onSave: (input: NoticeInput) => Promise<void> }) {
  const [title, setTitle] = useState(notice?.title ?? "");
  const [description, setDescription] = useState(notice?.description ?? "");
  const [errors, setErrors] = useState<Partial<Record<keyof NoticeInput, true>>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSummary(null);
    try {
      await onSave({ title, description });
    } catch (err) {
      if (err instanceof NoticeValidationError) setErrors(Object.fromEntries(err.fields.map((f) => [f, true])));
      setSummary(err instanceof Error ? err.message : "Não foi possível salvar o aviso.");
      setSaving(false);
    }
  }

  const fieldCls = (key: keyof NoticeInput) =>
    `w-full rounded-lg border bg-stone-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow ${
      errors[key] ? "border-red-500 bg-red-50/50" : "border-stone-200"
    }`;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </p>
      )}
      <div>
        <label htmlFor="nt-title" className="block text-xs font-bold text-slate-800">
          Título <span className="text-red-600">*</span>
        </label>
        <input
          id="nt-title"
          value={title}
          maxLength={120}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((x) => ({ ...x, title: undefined }));
          }}
          aria-invalid={!!errors.title}
          placeholder="Ex: RU fechado no feriado"
          className={`${fieldCls("title")} mt-2 h-11`}
        />
      </div>
      <div>
        <label htmlFor="nt-desc" className="block text-xs font-bold text-slate-800">
          Descrição <span className="text-red-600">*</span>
        </label>
        <textarea
          id="nt-desc"
          rows={6}
          value={description}
          maxLength={MAX_DESCRIPTION}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((x) => ({ ...x, description: undefined }));
          }}
          aria-invalid={!!errors.description}
          placeholder="O que muda, quando e onde."
          className={`${fieldCls("description")} mt-2 py-2`}
        />
        <p className="mt-1 text-right text-[11px] text-slate-500">
          {description.length}/{MAX_DESCRIPTION}
        </p>
      </div>
      {notice && <p className="text-xs text-slate-500">A data de publicação ({new Date(notice.createdAt).toLocaleDateString("pt-BR")}) não muda ao editar.</p>}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={`${secondaryButton} justify-center`}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={`${primaryButton} justify-center`}>
          {saving ? "Salvando..." : notice ? "Salvar alterações" : "Publicar aviso"}
        </button>
      </div>
    </form>
  );
}
