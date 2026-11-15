"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import GuideTopicEditor from "../../../../../components/admin/GuideTopicEditor";
import ApiFailure from "../../../../../components/courses/ApiFailure";
import { useApi } from "../../../../../hooks/useApi";
import { getGuideTopic } from "../../../../../services/guidesAdminService";

export default function EditGuideTopicPage() {
  const { secao, topico } = useParams<{ secao: string; topico: string }>();
  const state = useApi(getGuideTopic, topico);

  if (state.status === "loading") return <p className="p-6 text-sm text-slate-500">Carregando...</p>;
  if (state.status === "error") {
    return (
      <div className="p-6">
        <ApiFailure error={state.error} onRetry={state.retry} />
      </div>
    );
  }

  const topic = state.data;
  if (topic === null || topic.section !== secao) {
    return (
      <div className="p-6 text-sm text-slate-700">
        <p>Tópico não encontrado.</p>
        <Link href={`/admin/acolhimento/${secao}`} className="mt-2 inline-block font-semibold text-navy-900 underline">
          Voltar para o acolhimento
        </Link>
      </div>
    );
  }
  return <GuideTopicEditor key={topic.id} initial={topic} />;
}
