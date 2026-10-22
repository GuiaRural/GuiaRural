"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import AppShell from "../../components/common/AppShell";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import { GUIDE_SECTIONS, type GuideSection, type GuideTopic } from "../../data/mockGuides";
import { getGuideTopics, isFullyTranslated, translate } from "../../services/guidesService";

function isSection(value: string): value is GuideSection {
  return (GUIDE_SECTIONS as readonly string[]).includes(value);
}

export default function GuidePage({ params }: PageProps<"/acolhimento/[secao]">) {
  const { secao } = use(params);
  if (!isSection(secao)) notFound();
  return (
    <AppShell>
      <GuideSectionView key={secao} section={secao} />
    </AppShell>
  );
}

type LoadState = { status: "loading" } | { status: "ready"; topics: GuideTopic[] } | { status: "error" };

function GuideSectionView({ section }: { section: GuideSection }) {
  const { t, language } = useLanguage();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [topicId, setTopicId] = useState<string | null>(null);

  useEffect(() => {
    getGuideTopics(section)
      .then((topics) => setState({ status: "ready", topics }))
      .catch(() => setState({ status: "error" }));
  }, [section]);

  const info = t.guides.sections[section];
  const topic = state.status === "ready" ? state.topics.find((g) => g.id === topicId) : undefined;
  const tr = (text: Parameters<typeof translate>[0]) => translate(text, language).text;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{t.sidebar.welcomeSection}</p>
            <h1 className="text-2xl font-bold text-navy-900">{info.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{info.intro}</p>
          </div>
          {/* FA01: alternar idioma da cartilha */}
          <div className="flex flex-col items-end gap-1">
            <LanguageSwitcher />
            <p className="text-[11px] text-slate-500">{t.guides.translateHint}</p>
          </div>
        </div>

        {state.status === "loading" && <p className="mt-6 text-sm text-slate-600">{t.common.loading}</p>}
        {state.status === "error" && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {t.guides.unavailable}
          </p>
        )}

        {state.status === "ready" && !topic && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700">{t.guides.chooseTopic}</h2>
            {state.topics.length === 0 ? (
              <p className="mt-3 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.guides.unavailable}</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {state.topics.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setTopicId(g.id)}
                      className="h-full w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:shadow focus-visible:outline-2 focus-visible:outline-navy-900"
                    >
                      <span className="block font-bold text-navy-900">{tr(g.title)}</span>
                      <span className="mt-1 block text-sm text-slate-600">{tr(g.summary)}</span>
                      {!isFullyTranslated(g, language) && (
                        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">PT</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {topic && (
          <article className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <button type="button" onClick={() => setTopicId(null)} className="text-sm font-semibold text-navy-900 hover:underline">
              ← {t.guides.backToTopics}
            </button>
            <h2 className="mt-3 text-xl font-bold text-navy-900">{tr(topic.title)}</h2>
            {/* FE01: sem tradução, o texto em português é exibido e o usuário é avisado */}
            {!isFullyTranslated(topic, language) && (
              <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                {t.guides.fallbackNotice}
              </p>
            )}
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-800">
              {topic.body.map((p, i) => {
                const { text, fallback } = translate(p, language);
                return (
                  <p key={i} lang={fallback ? "pt" : language}>
                    {text}
                  </p>
                );
              })}
            </div>
            {topic.links.length > 0 && (
              <section className="mt-6 border-t border-slate-200 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.guides.supportLinks}</h3>
                <ul className="mt-2 space-y-1">
                  {topic.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-700 underline">
                        {tr(l.label)} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
