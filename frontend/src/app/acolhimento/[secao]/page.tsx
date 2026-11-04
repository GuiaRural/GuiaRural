"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState, type ReactNode } from "react";
import AppShell from "../../components/common/AppShell";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import {
  EMERGENCY_NUMBERS,
  GUIDE_DOWNLOADS,
  GUIDE_SECTIONS,
  SUPPORT_CONTACTS,
  type GuideBlock,
  type GuideSection,
  type GuideStage,
  type GuideTopic,
  type Translated,
} from "../../data/mockGuides";
import {
  getChecklist,
  getGuideTopics,
  isFullyTranslated,
  searchGuides,
  toggleChecklistItem,
  translate,
} from "../../services/guidesService";

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

const STAGES: GuideStage[] = ["antes", "chegada", "primeiras-semanas", "mobilidade"];

function useTr() {
  const { language } = useLanguage();
  return (text: Translated) => translate(text, language).text;
}

// ~200 palavras por minuto, nunca menos de 1 min.
function readingMinutes(texts: string[]): number {
  const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function GuideSectionView({ section }: { section: GuideSection }) {
  const { t, language } = useLanguage();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [topicId, setTopicId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getGuideTopics(section)
      .then((topics) => setState({ status: "ready", topics }))
      .catch(() => setState({ status: "error" }));
  }, [section]);

  // O tópico aberto fica no endereço (#cpf) para poder ser compartilhado e aberto pela busca.
  useEffect(() => {
    const syncFromHash = () => setTopicId(decodeURIComponent(window.location.hash.slice(1)) || null);
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function openTopic(id: string | null) {
    setTopicId(id);
    setQuery("");
    window.history.replaceState(null, "", id ? `#${id}` : window.location.pathname);
  }

  const info = t.guides.sections[section];
  const topics = state.status === "ready" ? state.topics : [];
  const topic = topics.find((g) => g.id === topicId);
  const results = searchGuides(query, language);
  const searching = query.trim().length >= 2;

  return (
    <div className="h-full overflow-y-auto">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-yellow">{t.sidebar.welcomeSection}</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{info.title}</h1>
              <p className="mt-2 text-sm text-slate-300">{info.intro}</p>
            </div>
            {/* FA01: alternar idioma da cartilha */}
            <div className="flex flex-col items-end gap-1.5">
              <LanguageSwitcher />
              <p className="text-[11px] text-slate-400">{t.guides.translateHint}</p>
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <label htmlFor="guide-search" className="sr-only">
              {t.guides.searchLabel}
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 shadow-lg focus-within:ring-2 focus-within:ring-brand-yellow">
              <svg aria-hidden className="size-5 shrink-0 text-navy-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="guide-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.guides.searchPlaceholder}
                className="h-11 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Passo 1 / FA02: alternar entre as cartilhas da seção Acolhimento */}
          <nav aria-label={t.guides.sectionsLabel} className="-mx-1 mt-5 flex gap-1 overflow-x-auto">
            {GUIDE_SECTIONS.map((s) => {
              const active = s === section;
              return (
                <Link
                  key={s}
                  href={`/acolhimento/${s}`}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-yellow ${
                    active ? "bg-background text-navy-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.guides.sections[s].title}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {searching ? (
          <SearchResults results={results} currentSection={section} onOpen={openTopic} />
        ) : (
          <>
            {state.status === "loading" && <TopicsSkeleton label={t.common.loading} />}
            {(state.status === "error" || (state.status === "ready" && topics.length === 0)) && <Unavailable message={t.guides.unavailable} />}

            {state.status === "ready" && topics.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                {/* No celular, a lista some enquanto a cartilha está aberta */}
                <div className={`space-y-6 ${topic ? "hidden lg:block" : ""}`}>
                  <TopicList section={section} topics={topics} activeId={topicId} onSelect={openTopic} />
                  <HelpCard />
                  {(section === "cultura" || section === "documentos") && <DownloadsCard />}
                </div>

                {topic ? (
                  <GuideReader key={topic.id} topic={topic} onBack={() => openTopic(null)} />
                ) : section === "documentos" ? (
                  <DocumentsTimeline topics={topics} onSelect={openTopic} />
                ) : (
                  <EmptyReader />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TopicList({
  section,
  topics,
  activeId,
  onSelect,
}: {
  section: GuideSection;
  topics: GuideTopic[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useLanguage();
  const groups =
    section === "documentos"
      ? STAGES.map((stage) => ({ stage, items: topics.filter((g) => g.stage === stage) })).filter((g) => g.items.length > 0)
      : [{ stage: null, items: topics }];
  let index = 0;

  return (
    <section aria-labelledby="topics-title">
      <h2 id="topics-title" className="flex items-baseline justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
        {t.guides.chooseTopic}
        <span className="font-semibold normal-case tracking-normal">
          {topics.length} {t.guides.topicsCount}
        </span>
      </h2>
      {groups.map(({ stage, items }) => (
        <div key={stage ?? "all"} className="mt-3">
          {stage && <h3 className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-amber-700">{t.guides.stages[stage]}</h3>}
          <ul className="space-y-3">
            {items.map((g) => (
              <li key={g.id}>
                <TopicCard topic={g} index={index++} active={g.id === activeId} onSelect={() => onSelect(g.id)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function TopicCard({ topic, index, active, onSelect }: { topic: GuideTopic; index: number; active: boolean; onSelect: () => void }) {
  const { language } = useLanguage();
  const tr = useTr();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`flex w-full gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 ${
        active ? "border-brand-yellow ring-2 ring-brand-yellow" : "border-slate-200 hover:border-amber-300 hover:shadow"
      }`}
    >
      <span
        aria-hidden
        className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${active ? "bg-brand-yellow text-navy-900" : "bg-navy-900 text-white"}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="font-bold text-navy-900">{tr(topic.title)}</span>
          {!isFullyTranslated(topic, language) && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">PT</span>
          )}
        </span>
        <span className="mt-1 block text-sm text-slate-600">{tr(topic.summary)}</span>
      </span>
    </button>
  );
}

function SearchResults({ results, currentSection, onOpen }: { results: GuideTopic[]; currentSection: GuideSection; onOpen: (id: string) => void }) {
  const { t } = useLanguage();
  const tr = useTr();

  return (
    <section aria-live="polite">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {results.length} {t.guides.searchResults}
      </h2>
      {results.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-5 text-sm text-slate-600 shadow-sm">{t.guides.noResults}</p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((g) => {
            const className =
              "block h-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow focus-visible:outline-2 focus-visible:outline-navy-900";
            const content = (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{t.guides.sections[g.section].title}</span>
                <span className="mt-0.5 block font-bold text-navy-900">{tr(g.title)}</span>
                <span className="mt-1 block text-sm text-slate-600">{tr(g.summary)}</span>
              </>
            );
            return (
              <li key={g.id}>
                {g.section === currentSection ? (
                  <button type="button" onClick={() => onOpen(g.id)} className={`w-full ${className}`}>
                    {content}
                  </button>
                ) : (
                  <Link href={`/acolhimento/${g.section}#${g.id}`} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Passo 2: detalhes completos da cartilha e links de apoio.
function GuideReader({ topic, onBack }: { topic: GuideTopic; onBack: () => void }) {
  const { t, language } = useLanguage();
  const tr = useTr();
  const [copied, setCopied] = useState(false);
  const title = translate(topic.title, language);
  const minutes = readingMinutes(topic.blocks.flatMap((b) => ("text" in b && typeof b.text === "object" ? [tr(b.text)] : [])));

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // área de transferência indisponível
    }
  }

  return (
    <article aria-labelledby="guide-title" className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-l-4 border-brand-yellow bg-amber-50/60 px-6 py-5">
        <button type="button" onClick={onBack} className="mb-3 text-sm font-semibold text-navy-900 hover:underline lg:hidden">
          ← {t.guides.backToTopics}
        </button>
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
          {topic.stage ? t.guides.stages[topic.stage] : t.guides.sections[topic.section].title} · {minutes} {t.guides.readingTime}
        </p>
        <h2 id="guide-title" lang={title.fallback ? "pt" : language} className="mt-1 text-2xl font-bold text-navy-900">
          {title.text}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{tr(topic.summary)}</p>
      </div>

      <div className="px-6 py-5">
        {/* FE01: sem tradução, o texto em português é exibido e o usuário é avisado */}
        {!isFullyTranslated(topic, language) && (
          <p role="status" className="mb-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <span aria-hidden className="font-bold">
              ⓘ
            </span>
            {t.guides.fallbackNotice}
          </p>
        )}

        <div className="space-y-5 text-[15px] leading-relaxed text-slate-800">
          {topic.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {topic.links.length > 0 && (
          <section className="mt-8 border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.guides.supportLinks}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topic.links.map((l) => {
                const className =
                  "inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-4 py-2.5 text-sm font-bold text-navy-900 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";
                return (
                  <li key={l.url}>
                    {l.url.startsWith("/") ? (
                      <Link href={l.url} className={className}>
                        {tr(l.label)} <span aria-hidden>→</span>
                      </Link>
                    ) : (
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className={className}>
                        {tr(l.label)} <span aria-hidden>↗</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p>
            {t.guides.source}: {tr(topic.source)}
          </p>
          <div className="flex gap-2">
            {topic.placeId && (
              <Link href={`/locais/${topic.placeId}`} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50">
                {t.guides.viewOnMap}
              </Link>
            )}
            <button type="button" onClick={copyLink} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50">
              {copied ? t.guides.linkCopied : t.guides.copyLink}
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Localized({ text, as: Tag = "span", className }: { text: Translated; as?: "span" | "p" | "h3" | "li" | "dt" | "dd"; className?: string }) {
  const { language } = useLanguage();
  const { text: value, fallback } = translate(text, language);
  return (
    <Tag lang={fallback ? "pt" : language} className={className}>
      {value}
    </Tag>
  );
}

const CALLOUT_STYLES = {
  info: { box: "border-sky-200 bg-sky-50 text-sky-950", icon: "ⓘ" },
  tip: { box: "border-emerald-200 bg-emerald-50 text-emerald-950", icon: "✦" },
  warning: { box: "border-red-200 bg-red-50 text-red-950", icon: "!" },
} as const;

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "heading":
      return <Localized as="h3" text={block.text} className="pt-1 text-base font-bold text-navy-900" />;
    case "p":
      return <Localized as="p" text={block.text} className="max-w-prose" />;
    case "list":
      return (
        <ul className="max-w-prose space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-yellow ring-2 ring-amber-200" />
              <Localized text={item} />
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-4">
          {block.items.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="pt-0.5">
                <Localized as="p" text={step.title} className="font-semibold text-navy-900" />
                {step.text && <Localized as="p" text={step.text} className="mt-0.5 text-sm text-slate-700" />}
              </div>
            </li>
          ))}
        </ol>
      );
    case "checklist":
      return <Checklist block={block} />;
    case "callout": {
      const style = CALLOUT_STYLES[block.tone];
      return (
        <div className={`flex gap-3 rounded-xl border p-4 text-sm ${style.box}`}>
          <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-white/70 font-bold">
            {style.icon}
          </span>
          <div>
            {block.title && <Localized as="p" text={block.title} className="font-bold" />}
            <Localized as="p" text={block.text} className={block.title ? "mt-0.5" : undefined} />
          </div>
        </div>
      );
    }
    case "facts":
      return (
        <dl className="grid gap-3 sm:grid-cols-2">
          {block.items.map((f, i) => (
            <div key={i} className="rounded-xl bg-background p-3 ring-1 ring-slate-200">
              <Localized as="dt" text={f.label} className="text-[11px] font-bold uppercase tracking-wide text-amber-700" />
              <Localized as="dd" text={f.value} className="mt-1 text-sm text-slate-800" />
            </div>
          ))}
        </dl>
      );
    case "video":
      return <VideoBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
  }
}

function Checklist({ block }: { block: Extract<GuideBlock, { type: "checklist" }> }) {
  const { t } = useLanguage();
  const tr = useTr();
  // A cartilha só é renderizada no navegador (após carregar os tópicos), então o progresso salvo pode ser lido direto.
  const [checked, setChecked] = useState(() => getChecklist(block.id));

  const done = checked.length;
  const total = block.items.length;

  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-bold text-navy-900">{tr(block.title)}</legend>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-600">
          {done} {t.guides.progressOf} {total}
        </span>
      </div>
      <ul className="space-y-1">
        {block.items.map((item, i) => {
          const isChecked = checked.includes(i);
          return (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => setChecked(toggleChecklistItem(block.id, i))}
                  className="mt-0.5 size-4 shrink-0 accent-navy-900"
                />
                <Localized text={item} className={isChecked ? "text-slate-500 line-through" : "text-slate-800"} />
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function VideoBlock({ block }: { block: Extract<GuideBlock, { type: "video" }> }) {
  const tr = useTr();
  return (
    <figure className="overflow-hidden rounded-xl bg-navy-900 shadow-sm">
      <div className="aspect-video">
        <iframe
          src={`https://drive.google.com/file/d/${block.driveId}/preview`}
          title={tr(block.title)}
          allow="autoplay; fullscreen"
          allowFullScreen
          loading="lazy"
          className="size-full"
        />
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-white">
        <span className="font-semibold">{tr(block.title)}</span>
        <span className="text-xs text-slate-300">© {block.credit}</span>
      </figcaption>
    </figure>
  );
}

function GalleryBlock({ block }: { block: Extract<GuideBlock, { type: "gallery" }> }) {
  const { t } = useLanguage();
  const tr = useTr();
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200">
      {block.embed && (
        <iframe
          src={`https://drive.google.com/embeddedfolderview?id=${block.folderId}#grid`}
          title={tr(block.title)}
          loading="lazy"
          className="h-80 w-full border-b border-slate-200 bg-white"
        />
      )}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 bg-background px-4 py-3">
        <span>
          <span className="block font-semibold text-navy-900">{tr(block.title)}</span>
          <span className="text-xs text-slate-600">
            {t.guides.photoCredit}: © {block.credit}
          </span>
        </span>
        <a href={block.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-700 underline">
          {t.guides.openFolder} ↗
        </a>
      </figcaption>
    </figure>
  );
}

// FA02: visão geral dos documentos na ordem em que o estudante precisa deles.
function DocumentsTimeline({ topics, onSelect }: { topics: GuideTopic[]; onSelect: (id: string) => void }) {
  const { t } = useLanguage();
  const tr = useTr();

  return (
    <section aria-labelledby="timeline-title" className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 id="timeline-title" className="text-xl font-bold text-navy-900">
        {t.guides.timelineTitle}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t.guides.timelineIntro}</p>
      <ol className="mt-6 space-y-6">
        {STAGES.map((stage, i) => {
          const items = topics.filter((g) => g.stage === stage);
          if (items.length === 0) return null;
          return (
            <li key={stage} className="relative flex gap-4">
              {i < STAGES.length - 1 && <span aria-hidden className="absolute left-4 top-9 h-[calc(100%-1rem)] w-0.5 bg-slate-200" />}
              <span aria-hidden className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-brand-yellow text-sm font-bold text-navy-900">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-navy-900">{t.guides.stages[stage]}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onSelect(g.id)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-navy-900"
                    >
                      {tr(g.title)}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function HelpCard() {
  const { t } = useLanguage();
  const tr = useTr();
  return (
    <SideCard title={t.guides.helpTitle}>
      <ul className="mt-3 space-y-2.5 text-sm">
        {SUPPORT_CONTACTS.map((c) => (
          <li key={c.href}>
            <span className="block text-xs text-slate-500">{tr(c.label)}</span>
            <a
              href={c.href}
              {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-semibold text-navy-700 underline-offset-2 hover:underline"
            >
              {c.value}
            </a>
          </li>
        ))}
      </ul>
      <h3 className="mt-5 text-[11px] font-bold uppercase tracking-wider text-red-700">{t.guides.emergencyTitle}</h3>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {EMERGENCY_NUMBERS.map((e) => (
          <li key={e.number}>
            <a
              href={`tel:${e.number}`}
              className="flex h-full flex-col items-center rounded-xl bg-red-50 px-2 py-2 text-center ring-1 ring-red-100 hover:bg-red-100"
            >
              <span className="text-lg font-bold text-red-700">{e.number}</span>
              <span className="text-[11px] leading-tight text-red-900">{tr(e.label)}</span>
            </a>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function DownloadsCard() {
  const { t } = useLanguage();
  const tr = useTr();
  return (
    <SideCard title={t.guides.downloadsTitle}>
      <ul className="mt-3 space-y-2">
        {GUIDE_DOWNLOADS.map((d) => (
          <li key={d.href}>
            <a
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm hover:border-amber-300 hover:bg-amber-50"
            >
              <span className="font-semibold text-navy-900">{tr(d.label)}</span>
              <span className="shrink-0 rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-bold text-white">{d.language}</span>
            </a>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function EmptyReader() {
  const { t } = useLanguage();
  return (
    <div className="hidden min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center lg:flex">
      <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-amber-50 text-xl ring-1 ring-amber-200">
        📖
      </span>
      <p className="mt-3 font-semibold text-navy-900">{t.guides.chooseTopic}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-600">{t.guides.emptyReader}</p>
    </div>
  );
}

function Unavailable({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
      {message}
    </p>
  );
}

function TopicsSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="hidden h-64 animate-pulse rounded-2xl bg-white shadow-sm lg:block" />
    </div>
  );
}
