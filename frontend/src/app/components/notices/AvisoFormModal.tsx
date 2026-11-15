"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
  AvisoValidationError,
  DESCRICAO_MAX_LENGTH,
  NOME_MAX_LENGTH,
  createAviso,
  updateAviso,
  validateAviso,
  type Aviso,
  type AvisoField,
  type AvisoFieldError,
} from "../../services/avisosService";
import Icon from "../common/Icon";
import Modal from "../ui/Modal";

type Errors = Partial<Record<AvisoField, AvisoFieldError>>;

const fieldClass =
  "w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow";

const ERROR_TEXT: Record<AvisoField, Record<AvisoFieldError, string>> = {
  nome: { required: "Informe o título do aviso.", tooLong: `O título pode ter até ${NOME_MAX_LENGTH} caracteres.` },
  descricao: { required: "Informe a descrição do aviso.", tooLong: `A descrição pode ter até ${DESCRICAO_MAX_LENGTH} caracteres.` },
};

// Publicar ou editar um aviso do campus. Fechar o modal descarta o que foi digitado.
export default function AvisoFormModal({
  open,
  aviso,
  onCancel,
  onSaved,
}: {
  open: boolean;
  // Aviso a editar; ausente = novo aviso.
  aviso?: Aviso | null;
  onCancel: () => void;
  onSaved: (aviso: Aviso) => void;
}) {
  const editing = !!aviso;
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={editing ? "Editar aviso" : "Novo aviso"}
      description={
        editing
          ? "As mudanças aparecem para os estudantes assim que forem salvas. A data de publicação não muda."
          : "O aviso é publicado assim que for salvo e aparece para os estudantes na página de avisos."
      }
      size="md"
      icon={<Icon name="plus" className="size-5" />}
    >
      <AvisoForm aviso={aviso ?? null} onCancel={onCancel} onSaved={onSaved} />
    </Modal>
  );
}

function AvisoForm({ aviso, onCancel, onSaved }: { aviso: Aviso | null; onCancel: () => void; onSaved: (aviso: Aviso) => void }) {
  const [nome, setNome] = useState(aviso?.nome ?? "");
  const [descricao, setDescricao] = useState(aviso?.descricao ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function showErrors(next: Errors) {
    setErrors(next);
    setSummary("Corrija os campos destacados para continuar.");
    const first: AvisoField | undefined = next.nome ? "nome" : next.descricao ? "descricao" : undefined;
    if (first) document.getElementById(`aviso-${first}`)?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const local = validateAviso({ nome, descricao });
    if (Object.keys(local).length) {
      showErrors(local);
      return;
    }
    setErrors({});
    setSummary(null);
    setSaving(true);
    try {
      onSaved(aviso ? await updateAviso(aviso.id, { nome, descricao }) : await createAviso({ nome, descricao }));
    } catch (err) {
      if (err instanceof AvisoValidationError) showErrors(err.errors);
      // O formulário continua aberto e preenchido.
      else if (err instanceof ApiError && err.status === 403) setSummary("Seu perfil não tem permissão para alterar avisos.");
      else if (err instanceof ApiError && err.status === 404) setSummary("Este aviso não existe mais. Feche e atualize a página.");
      else setSummary(aviso ? "Não foi possível salvar o aviso. Tente novamente." : "Não foi possível publicar o aviso. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: AvisoField) => `${fieldClass} ${errors[key] ? "border-red-500 bg-red-50/40" : "border-slate-300"}`;
  const aria = (key: AvisoField) => ({ "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? `aviso-${key}-error` : undefined });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {summary}
        </p>
      )}

      <div>
        <label htmlFor="aviso-nome" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Título <span className="text-red-600">*</span>
        </label>
        <input
          id="aviso-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Manutenção programada no sistema acadêmico"
          className={`${field("nome")} h-11`}
          {...aria("nome")}
        />
        {errors.nome && (
          <p id="aviso-nome-error" className="mt-1 text-xs text-red-700">
            {ERROR_TEXT.nome[errors.nome]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="aviso-descricao" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Descrição <span className="text-red-600">*</span>
        </label>
        <textarea
          id="aviso-descricao"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="O que os estudantes precisam saber, e quando."
          className={`${field("descricao")} py-2.5`}
          {...aria("descricao")}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          {errors.descricao ? (
            <p id="aviso-descricao-error" className="text-xs text-red-700">
              {ERROR_TEXT.descricao[errors.descricao]}
            </p>
          ) : (
            <span />
          )}
          <span className={`shrink-0 text-xs ${descricao.length > DESCRICAO_MAX_LENGTH ? "font-semibold text-red-700" : "text-slate-500"}`}>
            {descricao.length}/{DESCRICAO_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60"
        >
          <span aria-hidden>✓</span>
          {saving ? (aviso ? "Salvando..." : "Publicando...") : aviso ? "Salvar alterações" : "Publicar aviso"}
        </button>
      </div>
    </form>
  );
}
