"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GuideTopicEditor from "../../../../../components/admin/GuideTopicEditor";
import type { GuideTopic } from "../../../../../data/mockGuides";
import { getGuideTopic } from "../../../../../services/guidesService";

export default function EditGuideTopicPage() {
  const { secao, topico } = useParams<{ secao: string; topico: string }>();
  const [topic, setTopic] = useState<GuideTopic | null | undefined>(undefined);

  useEffect(() => {
    getGuideTopic(topico).then(setTopic);
  }, [topico]);

  if (topic === undefined) return <p className="p-6 text-sm text-slate-500">Carregando...</p>;
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
