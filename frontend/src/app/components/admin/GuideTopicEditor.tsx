"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { GuideBlock, GuideSection, GuideStage, GuideTopic, Translated } from "../../services/guidesService";
import { dictionaries, type Language } from "../../i18n/dictionaries";
import { setFlash } from "../../lib/flash";
import { GuideValidationError, saveGuideTopic } from "../../services/guidesAdminService";
import { isFullyTranslated } from "../../services/guidesService";
import { primaryButton, secondaryButton } from "./PageHeader";
import { useAdmin } from "./AdminShell";

const t = dictionaries.pt;
const LANGS: { code: Language; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

const BLOCK_LABELS: Record<GuideBlock["type"], string> = {
  heading: "Subtítulo",
  p: "Parágrafo",
  list: "Lista",
  steps: "Passo a passo",
  checklist: "Checklist de documentos",
  callout: "Destaque",
  facts: "Fatos rápidos",
  video: "Vídeo",
  gallery: "Galeria de fotos",
};

const NEW_BLOCKS: Partial<Record<GuideBlock["type"], () => GuideBlock>> = {
  p: () => ({ type: "p", text: { pt: "" } }),
  heading: () => ({ type: "heading", text: { pt: "" } }),
  list: () => ({ type: "list", items: [{ pt: "" }] }),
  callout: () => ({ type: "callout", tone: "info", text: { pt: "" } }),
};

const TONES = { info: "Informação", tip: "Dica", warning: "Atenção" } as const;

export function emptyTopic(section: GuideSection): GuideTopic {
  return { id: "", section, title: { pt: "" }, summary: { pt: "" }, blocks: [{ type: "p", text: { pt: "" } }], links: [], source: { pt: "" } };
}

// Edição de um tópico das cartilhas de acolhimento (UC09): textos em PT/EN/ES, blocos e links de apoio.
export default function GuideTopicEditor({ initial }: { initial: GuideTopic }) {
  const router = useRouter();
  const { setDirty } = useAdmin();
  const creating = !initial.id;
  const [topic, setTopic] = useState(initial);
  const [lang, setLang] = useState<Language>("pt");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sectionTitle = t.guides.sections[topic.section].title;
  const backHref = `/admin/acolhimento/${topic.section}`;

  // Toda edição trabalha numa cópia: o tópico salvo antes continua intacto para o histórico (snapshot).
  function edit(change: (draft: GuideTopic) => void) {
    setTopic((current) => {
      const draft = structuredClone(current);
      change(draft);
      return draft;
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = await saveGuideTopic(topic);
      setDirty(false);
      setFlash(`"${saved.title.pt}" foi ${creating ? "publicado" : "atualizado"} em ${sectionTitle}.`);
      router.push(backHref);
    } catch (err) {
      setError(err instanceof GuideValidationError ? err.message : "Não foi possível salvar o tópico. Tente novamente.");
      setLang("pt");
      setSaving(false);
    }
  }

  const tf = (value: Translated, set: (draft: GuideTopic, next: Translated) => void) => ({
    value,
    lang,
    onChange: (next: Translated) => edit((d) => set(d, next)),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:-mx-6 sm:rounded-b-xl sm:px-6">
        <div>
          <nav aria-label="Trilha" className="text-[11px] text-slate-500">
            <Link href="/admin" className="hover:underline">
              Início
            </Link>{" "}
            ›{" "}
            <Link href={backHref} className="hover:underline">
              Acolhimento · {sectionTitle}
            </Link>{" "}
            › <span className="font-semibold text-slate-800">{creating ? "Novo tópico" : "Editar tópico"}</span>
          </nav>
          <h1 className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl">{creating ? "Novo tópico" : topic.title.pt || "Editar tópico"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={backHref} onClick={() => setDirty(false)} className={`${secondaryButton} h-10`}>
            Cancelar
          </Link>
          <button type="button" onClick={save} disabled={saving} className={`${primaryButton} h-10`}>
            {saving ? "Salvando..." : creating ? "Publicar tópico" : "Salvar alterações"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Idioma em edição; EN/ES vazios caem no português na página pública (FE01 do UC09). */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div role="tablist" aria-label="Idioma em edição" className="flex gap-1 rounded-full bg-slate-200/70 p-1">
          {LANGS.map((l) => {
            const complete = isFullyTranslated(topic, l.code);
            return (
              <button
                key={l.code}
                type="button"
                role="tab"
                aria-selected={lang === l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${lang === l.code ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-white"}`}
              >
                {l.label}
                {l.code !== "pt" && (
                  <span aria-label={complete ? "tradução completa" : "tradução incompleta"} className={`size-1.5 rounded-full ${complete ? "bg-status-success" : "bg-amber-500"}`} />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-text-2nd">
          {lang === "pt" ? "Português é obrigatório e serve de base para as traduções." : "Campos em branco aparecem em português para o visitante."}
        </p>
      </div>

      <Card title="Identificação">
        <div className="grid gap-4">
          <TField label="Título" required {...tf(topic.title, (d, v) => (d.title = v))} />
          <TField label="Resumo" required multiline {...tf(topic.summary, (d, v) => (d.summary = v))} />
          {topic.section === "documentos" && (
            <div>
              <label htmlFor="gt-stage" className="block text-xs font-bold text-slate-800">
                Etapa da jornada
              </label>
              <select
                id="gt-stage"
                value={topic.stage ?? ""}
                onChange={(e) => edit((d) => (d.stage = (e.target.value || undefined) as GuideStage | undefined))}
                className={`${inputCls} mt-2`}
              >
                <option value="">Sem etapa</option>
                {(Object.keys(t.guides.stages) as GuideStage[]).map((s) => (
                  <option key={s} value={s}>
                    {t.guides.stages[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <TField label="Fonte" {...tf(topic.source, (d, v) => (d.source = v))} />
        </div>
      </Card>

      <Card title="Conteúdo" subtitle="Os blocos aparecem na página pública nesta ordem.">
        <ol className="space-y-3">
          {topic.blocks.map((block, i) => (
            <li key={i} className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-text-2nd">
                  {i + 1}. {BLOCK_LABELS[block.type]}
                </span>
                <div className="flex gap-1">
                  <IconButton label="Mover para cima" disabled={i === 0} onClick={() => edit((d) => d.blocks.splice(i - 1, 0, ...d.blocks.splice(i, 1)))}>
                    ↑
                  </IconButton>
                  <IconButton label="Mover para baixo" disabled={i === topic.blocks.length - 1} onClick={() => edit((d) => d.blocks.splice(i + 1, 0, ...d.blocks.splice(i, 1)))}>
                    ↓
                  </IconButton>
                  <IconButton label="Remover bloco" danger onClick={() => edit((d) => d.blocks.splice(i, 1))}>
                    ✕
                  </IconButton>
                </div>
              </div>
              <BlockFields block={block} lang={lang} edit={(change) => edit((d) => change(d.blocks[i]))} />
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Adicionar:</span>
          {(Object.keys(NEW_BLOCKS) as GuideBlock["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => edit((d) => d.blocks.push(NEW_BLOCKS[type]!()))}
              className="rounded-full border border-navy-900 px-3 py-1 text-xs font-semibold text-navy-900 hover:bg-navy-900/5"
            >
              + {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Links de apoio" subtitle="Exibidos no fim do tópico.">
        <ul className="space-y-3">
          {topic.links.map((link, i) => (
            <li key={i} className="grid gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TField label="Texto do link" {...tf(link.label, (d, v) => (d.links[i].label = v))} />
              <div>
                <label htmlFor={`gt-url-${i}`} className="block text-xs font-bold text-slate-800">
                  Endereço (URL)
                </label>
                <input
                  id={`gt-url-${i}`}
                  type="url"
                  value={link.url}
                  placeholder="https://"
                  onChange={(e) => edit((d) => (d.links[i].url = e.target.value))}
                  className={`${inputCls} mt-2`}
                />
              </div>
              <IconButton label="Remover link" danger onClick={() => edit((d) => d.links.splice(i, 1))}>
                ✕
              </IconButton>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => edit((d) => d.links.push({ label: { pt: "" }, url: "" }))}
          className="mt-3 rounded-full border border-navy-900 px-3 py-1 text-xs font-semibold text-navy-900 hover:bg-navy-900/5"
        >
          + Link
        </button>
      </Card>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow";

// Campos de cada tipo de bloco; vídeo e galeria só têm o título editável (o arquivo vem do Drive).
function BlockFields({ block, lang, edit }: { block: GuideBlock; lang: Language; edit: (change: (b: GuideBlock) => void) => void }) {
  // Os casts estreitam o bloco da cópia, que tem o mesmo tipo do bloco renderizado.
  const field = (label: string, value: Translated, set: (b: GuideBlock, v: Translated) => void, multiline = false) => (
    <TField label={label} value={value} lang={lang} multiline={multiline} onChange={(v) => edit((b) => set(b, v))} />
  );
  const listItems = (items: Translated[], itemsOf: (b: GuideBlock) => Translated[], label: string) => (
    <div className="space-y-2">
      {items.map((item, j) => (
        <div key={j} className="flex items-end gap-2">
          <div className="flex-1">{field(`${label} ${j + 1}`, item, (b, v) => (itemsOf(b)[j] = v))}</div>
          <IconButton label={`Remover ${label.toLowerCase()} ${j + 1}`} danger onClick={() => edit((b) => itemsOf(b).splice(j, 1))}>
            ✕
          </IconButton>
        </div>
      ))}
      <button type="button" onClick={() => edit((b) => itemsOf(b).push({ pt: "" }))} className="text-xs font-semibold text-navy-900 underline">
        + {label}
      </button>
    </div>
  );

  switch (block.type) {
    case "heading":
      return field("Texto", block.text, (b, v) => ((b as typeof block).text = v));
    case "p":
      return field("Texto", block.text, (b, v) => ((b as typeof block).text = v), true);
    case "list":
      return listItems(block.items, (b) => (b as typeof block).items, "Item");
    case "checklist":
      return (
        <div className="space-y-3">
          {field("Título", block.title, (b, v) => ((b as typeof block).title = v))}
          {listItems(block.items, (b) => (b as typeof block).items, "Documento")}
        </div>
      );
    case "callout":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-800">
              Tipo
              <select value={block.tone} onChange={(e) => edit((b) => ((b as typeof block).tone = e.target.value as typeof block.tone))} className={`${inputCls} mt-2 font-normal`}>
                {(Object.keys(TONES) as (keyof typeof TONES)[]).map((tone) => (
                  <option key={tone} value={tone}>
                    {TONES[tone]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {field("Título (opcional)", block.title ?? { pt: "" }, (b, v) => ((b as typeof block).title = v.pt || v.en || v.es ? v : undefined))}
          {field("Texto", block.text, (b, v) => ((b as typeof block).text = v), true)}
        </div>
      );
    case "steps":
      return (
        <div className="space-y-3">
          {block.items.map((step, j) => (
            <div key={j} className="space-y-2 border-l-2 border-brand-yellow pl-3">
              {field(`Passo ${j + 1}`, step.title, (b, v) => ((b as typeof block).items[j].title = v))}
              {field("Detalhes", step.text ?? { pt: "" }, (b, v) => ((b as typeof block).items[j].text = v), true)}
            </div>
          ))}
        </div>
      );
    case "facts":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {block.items.map((fact, j) => (
            <div key={j} className="space-y-2">
              {field("Rótulo", fact.label, (b, v) => ((b as typeof block).items[j].label = v))}
              {field("Valor", fact.value, (b, v) => ((b as typeof block).items[j].value = v))}
            </div>
          ))}
        </div>
      );
    case "video":
    case "gallery":
      return (
        <div className="space-y-2">
          {field("Título", block.title, (b, v) => ((b as typeof block).title = v))}
          <p className="text-[11px] text-text-2nd">Crédito: {block.credit}. O arquivo continua o mesmo do Google Drive.</p>
        </div>
      );
  }
}

// Campo de texto traduzido: edita o idioma ativo e mostra o português como referência.
function TField({
  label,
  value,
  lang,
  onChange,
  multiline,
  required,
}: {
  label: string;
  value: Translated;
  lang: Language;
  onChange: (next: Translated) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const current = value[lang] ?? "";
  const missing = lang !== "pt" && !current && Boolean(value.pt);
  function change(text: string) {
    const next = { ...value };
    if (lang === "pt") next.pt = text;
    else if (text) next[lang] = text;
    else delete next[lang];
    onChange(next);
  }
  const cls = `w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow ${
    missing ? "border-amber-300 bg-amber-50/40" : "border-stone-200"
  }`;
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
        {label} {required && lang === "pt" && <span className="text-red-600">*</span>}
        <span className="rounded bg-slate-100 px-1 text-[10px] font-semibold uppercase text-text-2nd">{lang}</span>
        {missing && <span className="text-[10px] font-semibold text-amber-700">sem tradução</span>}
      </span>
      {multiline ? (
        <textarea rows={3} value={current} placeholder={lang !== "pt" ? value.pt : undefined} onChange={(e) => change(e.target.value)} className={`${cls} mt-2 py-2`} />
      ) : (
        <input value={current} placeholder={lang !== "pt" ? value.pt : undefined} onChange={(e) => change(e.target.value)} className={`${cls} mt-2 h-11`} />
      )}
    </label>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="font-semibold text-navy-900">{title}</h2>
        {subtitle && <p className="text-xs text-text-2nd">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 shrink-0 place-items-center rounded-md border text-xs font-bold disabled:opacity-30 ${
        danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-slate-300 text-slate-700 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}
