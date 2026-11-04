"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "../../../../components/admin/AdminShell";
import PageHeader, { ctaButton, secondaryButton } from "../../../../components/admin/PageHeader";
import { ConfirmModal } from "../../../../components/ui/Modal";
import type { GuideTopic } from "../../../../data/mockGuides";
import { dictionaries } from "../../../../i18n/dictionaries";
import { takeFlash } from "../../../../lib/flash";
import { EDITABLE_SECTIONS, deleteGuideTopic, getGuideTopics, isFullyTranslated } from "../../../../services/guidesService";

type Section = (typeof EDITABLE_SECTIONS)[number];
const sections = dictionaries.pt.guides.sections;

function isSection(value: string): value is Section {
  return (EDITABLE_SECTIONS as readonly string[]).includes(value);
}

// Acolhimento: tópicos de uma seção das cartilhas (UC09), editados para a página pública /acolhimento/[secao].
export default function GuideSectionAdminPage() {
  const { secao } = useParams<{ secao: string }>();
  if (!isSection(secao)) notFound();
  return <SectionTopics key={secao} section={secao} />;
}

function SectionTopics({ section }: { section: Section }) {
  const { session } = useAdmin();
  const [topics, setTopics] = useState<GuideTopic[] | null>(null);
  const [toDelete, setToDelete] = useState<GuideTopic | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function reload() {
    getGuideTopics(section).then(setTopics);
  }
  useEffect(() => {
    const flash = takeFlash();
    getGuideTopics(section).then((all) => {
      setTopics(all);
      if (flash) setMessage(flash);
    });
  }, [section]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <PageHeader
        title={`Acolhimento · ${sections[section].title}`}
        subtitle={`${sections[section].intro} Português é obrigatório; inglês e espanhol são opcionais.`}
        actions={
          <>
            <Link href={`/acolhimento/${section}`} className={`${secondaryButton} h-11`}>
              Ver página pública
            </Link>
            <Link href={`/admin/acolhimento/${section}/novo`} className={`${ctaButton} h-11 px-5 text-base`}>
              <span aria-hidden className="text-lg leading-none">+</span> Novo tópico
            </Link>
          </>
        }
      />

      <nav aria-label="Seções do acolhimento" className="flex flex-wrap gap-1 rounded-full bg-slate-200/70 p-1 sm:w-fit">
        {EDITABLE_SECTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/acolhimento/${s}`}
            aria-current={s === section ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${s === section ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-white"}`}
          >
            {sections[s].title}
          </Link>
        ))}
      </nav>

      {message && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Tópico</th>
              <th className="px-4 py-3 font-semibold">Blocos</th>
              <th className="px-4 py-3 font-semibold">Traduções</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!topics && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            )}
            {topics?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Nenhum tópico nesta seção.
                </td>
              </tr>
            )}
            {topics?.map((topic) => (
              <tr key={topic.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{topic.title.pt}</p>
                  <p className="line-clamp-1 text-xs text-text-2nd">{topic.summary.pt}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{topic.blocks.length}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(["en", "es"] as const).map((lang) => {
                      const complete = isFullyTranslated(topic, lang);
                      return (
                        <span
                          key={lang}
                          title={complete ? "Tradução completa" : "Tradução incompleta: o visitante vê partes em português"}
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase ${
                            complete ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {lang} {complete ? "✓" : "•"}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/acolhimento/${section}/${topic.id}`} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                      Editar
                    </Link>
                    <button type="button" onClick={() => setToDelete(topic)} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={toDelete !== null}
        title="Excluir tópico"
        danger
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        message={`"${toDelete?.title.pt}" deixará de aparecer em ${sections[section].title}. A exclusão pode ser desfeita pelo histórico de mudanças.`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteGuideTopic(toDelete.id, session.name);
          setMessage(`"${toDelete.title.pt}" foi excluído.`);
          setToDelete(null);
          reload();
        }}
      />
    </div>
  );
}
