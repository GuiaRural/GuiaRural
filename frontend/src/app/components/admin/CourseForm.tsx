"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { setFlash } from "../../lib/flash";
import { useApi } from "../../hooks/useApi";
import {
  CourseValidationError,
  TYPES_BY_LEVEL,
  createCourse,
  deleteCourse,
  emptyCourseInput,
  getDepartments,
  inputOf,
  updateCourse,
  type CourseDetail,
  type CourseErrors,
  type CourseField,
  type CourseInput,
  type CourseLevel,
  type CourseType,
} from "../../services/coursesService";
import { ConfirmModal } from "../ui/Modal";
import { useAdmin } from "./AdminShell";
import { primaryButton, secondaryButton } from "./PageHeader";

const noArg = null;

export const LEVEL_LABELS: Record<CourseLevel, string> = { GRADUACAO: "Graduação", POS: "Pós-graduação" };
export const TYPE_LABELS: Record<CourseType, string> = {
  BACHARELADO: "Bacharelado",
  LICENCIATURA: "Licenciatura",
  STRICTO_SENSU: "Stricto sensu",
};

// UC35 (editar) e o cadastro, que segue as mesmas regras. Sem `course`, é um curso novo.
// A matriz curricular entra na 5c; aqui ficam os dados gerais e a coordenação.
export default function CourseForm({ course }: { course?: CourseDetail }) {
  const router = useRouter();
  const { session, setDirty } = useAdmin();
  // Conta "Somente leitura" vê o curso, mas não altera.
  const canManage = session.permission !== "leitura";
  const departments = useApi(getDepartments, noArg);
  const [input, setInput] = useState<CourseInput>(() => (course ? inputOf(course) : emptyCourseInput()));
  const [errors, setErrors] = useState<CourseErrors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const editing = course !== undefined;

  // Ao mexer num campo, o erro dele some.
  function clearErrors(...keys: CourseField[]) {
    setErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[key];
      return next;
    });
  }

  function set<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setDirty(true);
    if (key !== "active") clearErrors(key as CourseField);
  }

  const onText = (key: CourseField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(key, e.target.value as never);

  function changeLevel(level: CourseLevel | "") {
    setInput((current) => ({
      ...current,
      level,
      // Tipo que não combina com o novo nível é descartado (D14).
      type: level && current.type && !TYPES_BY_LEVEL[level].includes(current.type) ? "" : current.type,
    }));
    setDirty(true);
    clearErrors("level", "type");
  }

  async function save() {
    setSaving(true);
    setSummary(null);
    try {
      const saved = course ? await updateCourse(course.id, input) : await createCourse(input);
      setDirty(false);
      setFlash(
        course
          ? `Curso "${saved.name}" atualizado. A mudança já aparece na página pública do curso e do departamento.`
          : `Curso "${saved.name}" cadastrado${saved.active ? " e já visível na página do departamento" : ", mas está inativo e não aparece para os estudantes"}.`,
      );
      router.push("/admin/cursos");
    } catch (error) {
      if (error instanceof CourseValidationError) {
        setErrors(error.errors);
        setSummary(error.summary ?? "Confira os campos destacados.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSummary("Não foi possível salvar o curso. Tente novamente.");
      }
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!course) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCourse(course.id);
      setDirty(false);
      setFlash(`Curso "${course.name}" excluído definitivamente, junto com a coordenação e a matriz curricular.`);
      router.push("/admin/cursos");
    } catch {
      // FE-36.01: a exclusão falhou, o curso continua como estava e a tela permanece aberta.
      setDeleteError("Não foi possível concluir a exclusão. O curso foi mantido sem alterações.");
      setDeleting(false);
    }
  }

  const cls = (key: CourseField) =>
    `h-11 w-full rounded-lg border bg-stone-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow disabled:opacity-70 ${
      errors[key] ? "border-red-500 bg-red-50/50" : "border-stone-200"
    }`;

  const field = (key: CourseField, label: string, opts: { required?: boolean; placeholder?: string; inputMode?: "numeric" | "email" | "tel" } = {}) => (
    <Field id={`course-${key}`} label={label} required={opts.required} error={errors[key]}>
      <input
        id={`course-${key}`}
        className={cls(key)}
        value={input[key]}
        onChange={onText(key)}
        placeholder={opts.placeholder}
        inputMode={opts.inputMode}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `course-${key}-error` : undefined}
      />
    </Field>
  );

  const types = input.level ? TYPES_BY_LEVEL[input.level] : (Object.keys(TYPE_LABELS) as CourseType[]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/cursos" className="text-sm font-semibold text-navy-900 hover:underline">
            <span aria-hidden>←</span> Voltar para Cursos
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">{editing ? "Editar curso" : "Novo curso"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {editing ? course.name : "Dados gerais e coordenação. A matriz curricular será editada em uma próxima etapa."}
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/cursos" className={secondaryButton}>
              Cancelar
            </Link>
            <button type="button" onClick={save} disabled={saving} className={primaryButton}>
              {saving ? "Salvando..." : editing ? "Salvar Alterações" : "Cadastrar Curso"}
            </button>
          </div>
        )}
      </div>

      {!canManage && (
        <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Sua conta é somente leitura: os dados abaixo não podem ser alterados.
        </p>
      )}
      {summary && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {summary}
        </p>
      )}

      <fieldset disabled={!canManage || saving} className="min-w-0 space-y-6">
        <Section n={1} title="Dados gerais" subtitle="Identificação do curso e informações acadêmicas">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{field("name", "Nome do curso", { required: true, placeholder: "Ex: Bacharelado em Ciência da Computação" })}</div>
            <Field id="course-departmentId" label="Departamento" required error={errors.departmentId}>
              <select
                id="course-departmentId"
                className={cls("departmentId")}
                value={input.departmentId}
                onChange={onText("departmentId")}
                aria-invalid={!!errors.departmentId}
                aria-describedby={errors.departmentId ? "course-departmentId-error" : undefined}
              >
                <option value="">Selecione...</option>
                {departments.status === "ready" &&
                  departments.data.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.shortName ? `${d.shortName} — ${d.name}` : d.name}
                    </option>
                  ))}
              </select>
              {departments.status === "error" && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  Não foi possível carregar os departamentos.{" "}
                  <button type="button" onClick={departments.retry} className="font-semibold underline">
                    Tentar novamente
                  </button>
                </p>
              )}
            </Field>
            {field("code", "Código", { placeholder: "Ex: 142" })}
            <Field id="course-level" label="Nível" required error={errors.level}>
              <select
                id="course-level"
                className={cls("level")}
                value={input.level}
                onChange={(e) => changeLevel(e.target.value as CourseLevel | "")}
                aria-invalid={!!errors.level}
                aria-describedby={errors.level ? "course-level-error" : undefined}
              >
                <option value="">Selecione...</option>
                {(Object.keys(LEVEL_LABELS) as CourseLevel[]).map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="course-type" label="Tipo" required error={errors.type}>
              <select
                id="course-type"
                className={cls("type")}
                value={input.type}
                onChange={onText("type")}
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "course-type-error" : undefined}
              >
                <option value="">Selecione...</option>
                {types.map((tp) => (
                  <option key={tp} value={tp}>
                    {TYPE_LABELS[tp]}
                  </option>
                ))}
              </select>
            </Field>
            {field("modality", "Modalidade", { placeholder: "Ex: Presencial" })}
            {field("shift", "Turno", { placeholder: "Ex: Integral" })}
            {field("durationSemesters", "Duração (semestres)", { inputMode: "numeric", placeholder: "Ex: 8" })}
            {field("totalWorkloadHours", "Carga horária total (horas)", { inputMode: "numeric", placeholder: "Ex: 3200" })}
            {field("mecGrade", "Nota do MEC (1 a 5)", { inputMode: "numeric" })}
            {field("capesGrade", "Nota da CAPES (1 a 7)", { inputMode: "numeric" })}
            <div className="sm:col-span-2">
              <Field id="course-description" label="Descrição" error={errors.description}>
                <textarea
                  id="course-description"
                  rows={5}
                  className={`w-full rounded-lg border bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow disabled:opacity-70 ${
                    errors.description ? "border-red-500 bg-red-50/50" : "border-stone-200"
                  }`}
                  value={input.description}
                  onChange={onText("description")}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "course-description-error" : undefined}
                />
              </Field>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-800 sm:col-span-2">
              <input
                type="checkbox"
                checked={input.active}
                onChange={(e) => set("active", e.target.checked)}
                className="mt-0.5 size-4 accent-navy-900"
              />
              <span>
                <span className="font-semibold">Curso ativo</span>
                <span className="block text-xs text-slate-500">Curso inativo não aparece na página do departamento, na lista de cursos nem na busca.</span>
              </span>
            </label>
          </div>
        </Section>

        <Section n={2} title="Coordenação" subtitle="Quem coordena o curso e como falar com a coordenação">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("coordinatorName", "Coordenador(a)")}
            {field("viceCoordinatorName", "Vice-coordenador(a)")}
            {field("email", "E-mail", { inputMode: "email" })}
            {field("secondaryEmail", "E-mail secundário", { inputMode: "email" })}
            {field("phone", "Telefone", { inputMode: "tel" })}
            {field("extension", "Ramal", { inputMode: "numeric" })}
            {field("officeLocation", "Local de atendimento")}
            {field("officeHours", "Horário de atendimento")}
            <div className="sm:col-span-2">{field("attendanceMode", "Forma de atendimento", { placeholder: "Ex: Presencial e por e-mail" })}</div>
          </div>
        </Section>
      </fieldset>

      {editing && canManage && (
        <section aria-labelledby="course-danger" className="rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
          <h2 id="course-danger" className="font-bold text-red-800">
            Excluir curso
          </h2>
          <p className="mt-1 text-sm text-red-900">
            A exclusão é <strong>definitiva</strong>: o curso, a coordenação e a matriz curricular são removidos e não podem ser recuperados (RN-UC36-01).
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmingDelete(true);
            }}
            className="mt-3 inline-flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Excluir Curso
          </button>
        </section>
      )}

      <ConfirmModal
        open={confirmingDelete}
        title="Excluir curso"
        danger
        busy={deleting}
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        message={
          <>
            <p>
              Excluir <strong>&quot;{course?.name}&quot;</strong>? O curso e todas as informações associadas (coordenação e matriz curricular) serão removidos
              permanentemente. <strong>Esta ação não pode ser desfeita.</strong>
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {deleteError}
              </p>
            )}
          </>
        }
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Section({ n, title, subtitle, children }: { n: number; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`course-sec-${n}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-navy-900 text-xs font-bold text-white">
          {n}
        </span>
        <div>
          <h2 id={`course-sec-${n}`} className="font-bold text-navy-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
