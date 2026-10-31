"use client";

import { notFound, useParams } from "next/navigation";
import GuideTopicEditor, { emptyTopic } from "../../../../../components/admin/GuideTopicEditor";
import { EDITABLE_SECTIONS } from "../../../../../services/guidesService";

export default function NewGuideTopicPage() {
  const { secao } = useParams<{ secao: string }>();
  const section = EDITABLE_SECTIONS.find((s) => s === secao);
  if (!section) notFound();
  return <GuideTopicEditor key={section} initial={emptyTopic(section)} />;
}
