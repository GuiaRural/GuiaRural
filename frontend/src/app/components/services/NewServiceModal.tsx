"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  NAME_MAX_LENGTH,
  ServicoValidationError,
  createServico,
  validateServico,
  type Servico,
  type ServicoField,
  type ServicoFieldError,
  type ServicoInput,
} from "../../services/servicosService";
import Icon from "../common/Icon";
import Modal from "../ui/Modal";

type Errors = Partial<Record<ServicoField, ServicoFieldError>>;

const FIELD_LABELS: Record<ServicoField, string> = {
  category: "Categoria do serviço",
  name: "Nome do serviço",
  sector: "Setor / órgão responsável",
  description: "Descrição geral",
  steps: "Como solicitar",
  requirements: "Requisitos e documentos",
  url: "Link do edital ou guia",
  deadline: "Prazo",
};

const ERROR_TEXT: Record<ServicoFieldError, string> = {
  required: "Campo obrigatório.",
  tooLong: `Use no máximo ${NAME_MAX_LENGTH} caracteres.`,
  invalidUrl: "Informe o link completo, começando com https://",
};

// Ordem dos campos na tela: o foco vai para o primeiro com erro.
const FIELD_ORDER: ServicoField[] = ["category", "name", "sector", "description", "steps", "requirements", "url", "deadline"];

const fieldClass =
  "w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow";

type Step = { key: number; text: string };

// UC19 — Adicionar Serviço. Fechar o modal descarta o que foi digitado (FA-19.01).
export default function NewServiceModal({
  open,
  author,
  onCancel,
  onCreated,
}: {
  open: boolean;
  author: string;
  onCancel: () => void;
  onCreated: (servico: Servico) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Cadastrar Novo Serviço"
      description="Preencha as informações, o passo a passo e os canais de atendimento para exibição pública"
      size="lg"
      icon={<Icon name="plus" className="size-5" />}
    >
      <NewServiceForm author={author} onCancel={onCancel} onCreated={onCreated} />
    </Modal>
  );
}

function NewServiceForm({ author, onCancel, onCreated }: { author: string; onCancel: () => void; onCreated: (servico: Servico) => void }) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ key: 0, text: "" }]);
  const [nextStepKey, setNextStepKey] = useState(1);
  const [requirements, setRequirements] = useState("");
  const [url, setUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addStep() {
    setSteps((list) => [...list, { key: nextStepKey, text: "" }]);
    setNextStepKey((k) => k + 1);
  }

  function updateStep(key: number, text: string) {
    setSteps((list) => list.map((s) => (s.key === key ? { ...s, text } : s)));
  }

  function removeStep(key: number) {
    setSteps((list) => list.filter((s) => s.key !== key));
  }

  function showErrors(next: Errors) {
    setErrors(next);
    const missing = FIELD_ORDER.filter((f) => next[f] === "required").map((f) => FIELD_LABELS[f]);
    // FE-19.01: a mensagem diz quais campos faltam.
    setSummary(missing.length ? `Preencha os campos obrigatórios: ${missing.join(", ")}.` : "Corrija os campos destacados para continuar.");
    const first = FIELD_ORDER.find((f) => next[f]);
    if (first) document.getElementById(first === "steps" ? `svc-step-${steps[0]?.key}` : `svc-${first}`)?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: ServicoInput = {
      category,
      name,
      sector,
      description,
      steps: steps.map((s) => s.text),
      requirements,
      url,
      deadline,
    };
    // RN-19.01
    const next = validateServico(input);
    if (Object.keys(next).length) {
      showErrors(next);
      return;
    }
    setErrors({});
    setSummary(null);
    setSaving(true);
    try {
      onCreated(await createServico(input, author));
    } catch (err) {
      if (err instanceof ServicoValidationError) showErrors(err.errors);
      // FE-19.02: o formulário continua aberto e preenchido.
      else setSummary("Não foi possível concluir o cadastro do serviço. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: ServicoField) => `${fieldClass} ${errors[key] ? "border-red-500 bg-red-50/40" : "border-slate-300"}`;
  const a11y = (key: ServicoField) => ({
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `svc-${key}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:px-1 sm:py-1">
      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </p>
      )}

      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id="svc-category" label={FIELD_LABELS.category} error={errors.category} required>
          <input id="svc-category" className={`h-11 ${field("category")}`} placeholder="Ex: Bolsas & Assistência Estudantil" value={category} onChange={(e) => setCategory(e.target.value)} aria-required {...a11y("category")} />
        </Field>
        <Field id="svc-name" label={FIELD_LABELS.name} error={errors.name} hint={`Até ${NAME_MAX_LENGTH} caracteres`} required>
          <input id="svc-name" className={`h-11 ${field("name")}`} placeholder="Ex: Auxílio Conectividade" value={name} onChange={(e) => setName(e.target.value)} aria-required {...a11y("name")} />
        </Field>
        <Field id="svc-sector" label={FIELD_LABELS.sector} error={errors.sector} required>
          <input id="svc-sector" className={`h-11 ${field("sector")}`} placeholder="Ex: PRAE" value={sector} onChange={(e) => setSector(e.target.value)} aria-required {...a11y("sector")} />
        </Field>
        {/* RN-19.02: todo serviço novo nasce publicado; o status só muda na edição (UC20). */}
        <div>
          <p className="block text-xs font-bold uppercase tracking-wider text-slate-700">Status de exibição</p>
          <p className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-800">
            <span aria-hidden className="size-2 rounded-full bg-emerald-500" /> Publicado / Ativo
          </p>
        </div>
      </div>

      <Field id="svc-description" label={FIELD_LABELS.description} error={errors.description} hint="Para que serve o serviço e quem pode usar." required>
        <textarea id="svc-description" rows={3} className={`py-2.5 ${field("description")}`} value={description} onChange={(e) => setDescription(e.target.value)} aria-required {...a11y("description")} />
      </Field>

      <fieldset className={`rounded-xl border p-4 ${errors.steps ? "border-red-300 bg-red-50/40" : "border-amber-200 bg-amber-50/50"}`} aria-describedby={errors.steps ? "svc-steps-error" : undefined}>
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-slate-700">
          {FIELD_LABELS.steps} / passo a passo do aluno <span className="text-red-600">*</span>
        </legend>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={step.key} className="flex items-center gap-2">
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <label htmlFor={`svc-step-${step.key}`} className="sr-only">
                Etapa {i + 1}
              </label>
              <input
                id={`svc-step-${step.key}`}
                className={`h-10 ${field("steps")}`}
                placeholder={i === 0 ? "Ex: Faça a inscrição no SIGA" : `Etapa ${i + 1}`}
                value={step.text}
                onChange={(e) => updateStep(step.key, e.target.value)}
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(step.key)}
                  aria-label={`Remover etapa ${i + 1}`}
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-navy-900"
                >
                  <Icon name="trash" className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ol>
        {errors.steps && (
          <p id="svc-steps-error" className="mt-2 text-xs text-red-700">
            Preencha pelo menos uma etapa.
          </p>
        )}
        <button
          type="button"
          onClick={addStep}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-navy-900"
        >
          <Icon name="plus" className="size-4" /> Adicionar etapa
        </button>
      </fieldset>

      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id="svc-requirements" label={FIELD_LABELS.requirements} error={errors.requirements} hint="Documentos que o estudante precisa ter em mãos.">
          <textarea id="svc-requirements" rows={4} className={`py-2.5 ${field("requirements")}`} value={requirements} onChange={(e) => setRequirements(e.target.value)} {...a11y("requirements")} />
        </Field>
        <div className="space-y-5">
          <Field id="svc-url" label={FIELD_LABELS.url} error={errors.url}>
            <input id="svc-url" type="url" inputMode="url" className={`h-11 ${field("url")}`} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} {...a11y("url")} />
          </Field>
          <Field id="svc-deadline" label={FIELD_LABELS.deadline} error={errors.deadline} hint="Só para serviços disponíveis por um período.">
            <input id="svc-deadline" className={`h-11 ${field("deadline")}`} placeholder="Ex: Inscrições de 10 a 28/02" value={deadline} onChange={(e) => setDeadline(e.target.value)} {...a11y("deadline")} />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <p className="mr-auto flex items-center gap-1.5 text-xs text-slate-600">
          <span aria-hidden className="text-emerald-600">✓</span> O serviço ficará disponível para os alunos assim que for salvo.
        </p>
        {/* FA-19.01 */}
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60"
        >
          <span aria-hidden>✓</span>
          {saving ? "Salvando..." : "Salvar Serviço"}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, error, hint, required = false, children }: { id: string; label: string; error?: ServicoFieldError; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {ERROR_TEXT[error]}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
