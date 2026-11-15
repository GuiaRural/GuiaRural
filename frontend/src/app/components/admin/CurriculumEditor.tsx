"use client";

import { useRef, useState } from "react";
import Icon from "../common/Icon";
import type { SubjectErrors, SubjectField, SubjectInput, SubjectNature } from "../../services/coursesService";

// Matriz curricular dentro do formulário de curso (FA-35.01): uma aba por período e uma para as optativas.
// Quem guarda a lista é o formulário; este componente só edita e devolve a lista nova.

type Tab = number | "electives";

const NATURE_LABELS: Record<SubjectNature, string> = { OBRIGATORIA: "Obrigatória", OPTATIVA: "Optativa" };

const DEFAULT_PERIODS = 8;
const MAX_PERIOD = 12;

const cell =
  "h-10 w-full rounded-md border bg-stone-50 px-2.5 text-sm text-slate-900 outline-none focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-brand-yellow disabled:opacity-70";

function periodOf(subject: SubjectInput): Tab {
  return subject.period === "" ? "electives" : Number(subject.period);
}

export default function CurriculumEditor({
  subjects,
  errors,
  disabled,
  onChange,
}: {
  subjects: SubjectInput[];
  errors: SubjectErrors;
  disabled: boolean;
  onChange: (subjects: SubjectInput[]) => void;
}) {
  const [tab, setTab] = useState<Tab>(1);
  // Linhas novas ainda não têm id do servidor: chaves negativas não colidem com as dos ids.
  const nextKey = useRef(-1);

  const highestPeriod = subjects.reduce((max, s) => (s.period === "" ? max : Math.max(max, Number(s.period))), DEFAULT_PERIODS);
  const periods = Array.from({ length: Math.min(highestPeriod, MAX_PERIOD) }, (_, i) => i + 1);
  const tabs: Tab[] = [...periods, "electives"];

  const inTab = (t: Tab) => subjects.map((subject, index) => ({ subject, index })).filter(({ subject }) => periodOf(subject) === t);
  const rows = inTab(tab);
  const hasErrors = (t: Tab) => inTab(t).some(({ index }) => errors[index]);

  function update(index: number, patch: Partial<SubjectInput>) {
    onChange(subjects.map((subject, i) => (i === index ? { ...subject, ...patch } : subject)));
  }

  function add() {
    const electives = tab === "electives";
    onChange([
      ...subjects,
      {
        key: nextKey.current--,
        period: electives ? "" : String(tab),
        code: "",
        name: "",
        syllabus: "",
        workloadHours: "",
        credits: "",
        nature: electives ? "OPTATIVA" : "OBRIGATORIA",
        prerequisites: "",
      },
    ]);
  }

  function remove(index: number) {
    onChange(subjects.filter((_, i) => i !== index));
  }

  const label = (t: Tab) => (t === "electives" ? "Optativas / Eletivas" : `${t}º Período`);

  return (
    <div>
      <div role="tablist" aria-label="Períodos da matriz curricular" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const selected = t === tab;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              id={`curriculum-tab-${t}`}
              aria-selected={selected}
              aria-controls="curriculum-panel"
              onClick={() => setTab(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow ${
                selected ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 bg-white text-navy-900 hover:bg-slate-50"
              }`}
            >
              {label(t)} <span className="font-normal opacity-80">({inTab(t).length})</span>
              {hasErrors(t) && (
                <span className="ml-1 text-red-500" role="img" aria-label="com erro">
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id="curriculum-panel" role="tabpanel" aria-labelledby={`curriculum-tab-${tab}`} className="mt-4 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Nenhuma disciplina neste período.</p>
        )}
        {rows.map(({ subject, index }) => {
          const row = errors[index] ?? {};
          const invalid = (field: SubjectField) => Boolean(row[field]);
          const cls = (field: SubjectField) => `${cell} ${invalid(field) ? "border-red-500 bg-red-50/50" : "border-stone-200"}`;
          const id = `subject-${subject.key}`;
          const error = (field: SubjectField) =>
            row[field] && (
              <p id={`${id}-${field}-error`} role="alert" className="mt-1 text-xs font-semibold text-red-700">
                {row[field]}
              </p>
            );
          const describe = (field: SubjectField) => (invalid(field) ? `${id}-${field}-error` : undefined);
          return (
            <div key={subject.key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-6">
                <div className="sm:col-span-1">
                  <label htmlFor={`${id}-code`} className="block text-xs font-bold text-slate-800">
                    Código <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`${id}-code`}
                    className={cls("code")}
                    value={subject.code}
                    onChange={(e) => update(index, { code: e.target.value })}
                    aria-invalid={invalid("code")}
                    aria-describedby={describe("code")}
                    disabled={disabled}
                  />
                  {error("code")}
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor={`${id}-name`} className="block text-xs font-bold text-slate-800">
                    Disciplina <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`${id}-name`}
                    className={cls("name")}
                    value={subject.name}
                    onChange={(e) => update(index, { name: e.target.value })}
                    aria-invalid={invalid("name")}
                    aria-describedby={describe("name")}
                    disabled={disabled}
                  />
                  {error("name")}
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor={`${id}-hours`} className="block text-xs font-bold text-slate-800">
                    Carga horária <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`${id}-hours`}
                    inputMode="numeric"
                    className={cls("workloadHours")}
                    value={subject.workloadHours}
                    onChange={(e) => update(index, { workloadHours: e.target.value })}
                    aria-invalid={invalid("workloadHours")}
                    aria-describedby={describe("workloadHours")}
                    disabled={disabled}
                  />
                  {error("workloadHours")}
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor={`${id}-credits`} className="block text-xs font-bold text-slate-800">
                    Créditos
                  </label>
                  <input
                    id={`${id}-credits`}
                    inputMode="numeric"
                    className={cls("credits")}
                    value={subject.credits}
                    onChange={(e) => update(index, { credits: e.target.value })}
                    aria-invalid={invalid("credits")}
                    aria-describedby={describe("credits")}
                    disabled={disabled}
                  />
                  {error("credits")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${id}-nature`} className="block text-xs font-bold text-slate-800">
                    Natureza
                  </label>
                  <select
                    id={`${id}-nature`}
                    className={`${cell} border-stone-200`}
                    value={subject.nature}
                    onChange={(e) => update(index, { nature: e.target.value as SubjectNature })}
                    disabled={disabled}
                  >
                    {(Object.keys(NATURE_LABELS) as SubjectNature[]).map((n) => (
                      <option key={n} value={n}>
                        {NATURE_LABELS[n]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor={`${id}-prereq`} className="block text-xs font-bold text-slate-800">
                    Pré-requisitos <span className="font-normal text-slate-500">(códigos separados por vírgula)</span>
                  </label>
                  <input
                    id={`${id}-prereq`}
                    className={cls("prerequisites")}
                    value={subject.prerequisites}
                    onChange={(e) => update(index, { prerequisites: e.target.value })}
                    placeholder="Nenhum"
                    aria-invalid={invalid("prerequisites")}
                    aria-describedby={describe("prerequisites")}
                    disabled={disabled}
                  />
                  {error("prerequisites")}
                </div>
                <div className="flex items-end justify-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled}
                    aria-label={`Remover disciplina ${subject.code.trim() || subject.name.trim() || "sem código"}`}
                    className="inline-flex h-10 items-center gap-1 rounded-md bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-red-700"
                  >
                    <Icon name="trash" className="size-3.5" /> Remover
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-navy-900 bg-white px-4 text-sm font-semibold text-navy-900 hover:bg-navy-900/5 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <Icon name="plus" className="size-4" /> Adicionar nova disciplina
        </button>
      </div>
    </div>
  );
}
