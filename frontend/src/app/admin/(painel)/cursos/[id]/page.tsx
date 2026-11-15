"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import CourseForm from "../../../../components/admin/CourseForm";
import ApiFailure from "../../../../components/courses/ApiFailure";
import { useApi } from "../../../../hooks/useApi";
import { getCourseAdmin } from "../../../../services/coursesService";
import { isNotFound } from "../../../../lib/api";

// UC35 — Editar Curso (e ponto de partida do UC36 — Deletar Curso).
export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const state = useApi(getCourseAdmin, id);

  if (state.status === "loading") return <p className="p-6 text-sm text-slate-500">Carregando...</p>;
  if (state.status === "error") {
    if (!isNotFound(state.error)) {
      return (
        <div className="p-6">
          <ApiFailure error={state.error} onRetry={state.retry} />
        </div>
      );
    }
    return (
      <div className="p-6 text-sm text-slate-700">
        <p>Curso não encontrado.</p>
        <Link href="/admin/cursos" className="mt-2 inline-block font-semibold text-navy-900 underline">
          Voltar para Cursos
        </Link>
      </div>
    );
  }
  return <CourseForm key={state.data.id} course={state.data} />;
}
