"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminShell";
import { LEVEL_LABELS, TYPE_LABELS } from "../../../components/admin/CourseForm";
import PageHeader, { primaryButton } from "../../../components/admin/PageHeader";
import Icon from "../../../components/common/Icon";
import ApiFailure from "../../../components/courses/ApiFailure";
import { useApi } from "../../../hooks/useApi";
import { takeFlash } from "../../../lib/flash";
import { getDepartments, listCoursesAdmin } from "../../../services/coursesService";

type StatusFilter = "todos" | "ativos" | "inativos";

// Busca sem diferença de maiúsculas nem acentos.
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

// Cursos, visão do administrador (UC35 e UC36 partem daqui). Mostra também os inativos.
export default function AdminCursosPage() {
  const { session } = useAdmin();
  const canManage = session.permission !== "leitura";
  const courses = useApi(listCoursesAdmin, null);
  const departments = useApi(getDepartments, "pt");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [flash, setFlash] = useState<string | null>(null);

  // Mensagem deixada pelo formulário ao salvar ou excluir (some ao recarregar).
  // A leitura fica num ref porque, em desenvolvimento, o efeito roda duas vezes e a segunda leitura já viria vazia.
  const taken = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (taken.current === undefined) taken.current = takeFlash();
    const message = taken.current;
    Promise.resolve().then(() => message && setFlash(message));
  }, []);

  const departmentName = new Map(
    (departments.status === "ready" ? departments.data : []).map((d) => [d.id, d.shortName ?? d.name] as const),
  );
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const visible =
    courses.status === "ready"
      ? courses.data
          .filter((c) => (status === "todos" ? true : status === "ativos" ? c.active : !c.active))
          .filter((c) => {
            const haystack = normalize(`${c.name} ${c.code ?? ""} ${departmentName.get(c.departmentId) ?? ""}`);
            return terms.every((term) => haystack.includes(term));
          })
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <PageHeader
        title="Cursos"
        subtitle="Cursos de graduação e pós-graduação exibidos na página dos departamentos e na busca."
        actions={
          canManage && (
            <Link href="/admin/cursos/novo" className={primaryButton}>
              <Icon name="plus" className="size-4" /> Novo curso
            </Link>
          )
        }
      />

      {flash && (
        <p role="status" className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          <span>{flash}</span>
          <button type="button" onClick={() => setFlash(null)} aria-label="Fechar mensagem" className="shrink-0 text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="course-search" className="block text-xs font-bold text-slate-800">
            Buscar
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, código ou departamento"
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
          />
        </div>
        <div>
          <label htmlFor="course-status" className="block text-xs font-bold text-slate-800">
            Situação
          </label>
          <select
            id="course-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="mt-1 h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      {courses.status === "loading" && <p className="text-sm text-slate-600">Carregando cursos...</p>}
      {courses.status === "error" && <ApiFailure error={courses.error} onRetry={courses.retry} />}
      {visible?.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
          {courses.status === "ready" && courses.data.length === 0
            ? "Nenhum curso cadastrado ainda."
            : "Nenhum curso encontrado para esse filtro."}
        </p>
      )}
      {visible && visible.length > 0 && (
        <ul className="space-y-3">
          {visible.map((course) => (
            <li
              key={course.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 basis-64">
                <p className="font-bold text-navy-900">{course.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {[
                    departmentName.get(course.departmentId),
                    LEVEL_LABELS[course.level],
                    TYPE_LABELS[course.type],
                    course.code && `código ${course.code}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {!course.active && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">Inativo</span>
              )}
              <Link
                href={`/admin/cursos/${course.id}`}
                aria-label={`${canManage ? "Editar" : "Ver"} curso: ${course.name}`}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-navy-700 hover:bg-slate-200"
              >
                <Icon name="pencil" className="size-3.5" /> {canManage ? "Editar" : "Ver"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
