import { apiGet } from "../lib/api";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";
import {
  GUIDE_SECTIONS,
  type GuideBlock,
  type GuideLink,
  type GuideSection,
  type GuideStage,
  type GuideTopic,
  type ResolvedGuideBlock,
  type ResolvedGuideLink,
  type Translated,
} from "./guidesService";

// Área do administrador do guia de acolhimento. A leitura vem da API (/api/guide/translations, os três idiomas
// lado a lado); salvar, excluir e desfazer ainda só alteram a cópia em memória, porque o backend não tem login
// nem endpoints de escrita para o guia. Recarregar a página volta ao que está no banco.
let guides: GuideTopic[] | null = null;
let loading: Promise<GuideTopic[]> | null = null;

// Recife tem tela própria (UC40) e não é editado por aqui.
export const EDITABLE_SECTIONS = ["cultura", "documentos", "calouro"] as const satisfies readonly GuideSection[];

// Espelha GuideTopicTranslationsDTO.
type LocalizedText = { pt: string; en: string | null; es: string | null };
type LocalizedJson<T> = { pt: T; en: T | null; es: T | null };
type TopicTranslationsDto = {
  slug: string;
  section: GuideSection;
  stage: GuideStage | null;
  title: LocalizedText;
  summary: LocalizedText;
  blocks: LocalizedJson<ResolvedGuideBlock[]>;
  links: LocalizedJson<ResolvedGuideLink[]>;
  source: LocalizedText;
  placeSlug: string | null;
  // Idiomas em que todo o texto está traduzido. Nos outros, o que falta já vem preenchido com o português
  // dentro de blocks e links: um texto igual ao português conta como "sem tradução".
  fullyTranslatedLangs: ("en" | "es")[];
};

type Completeness = { en: boolean; es: boolean };

// Junta os três idiomas de um texto. Fora dos idiomas totalmente traduzidos, um texto igual ao português é o
// fallback do servidor, não uma tradução.
function merge(pt: string, en: string | null | undefined, es: string | null | undefined, full: Completeness): Translated {
  const keep = (value: string | null | undefined, complete: boolean) => Boolean(value) && (complete || value !== pt);
  return { pt, ...(keep(en, full.en) ? { en: en! } : {}), ...(keep(es, full.es) ? { es: es! } : {}) };
}

function ofType<K extends ResolvedGuideBlock["type"]>(block: ResolvedGuideBlock | undefined, type: K) {
  return block?.type === type ? (block as Extract<ResolvedGuideBlock, { type: K }>) : undefined;
}

function mergeBlock(pt: ResolvedGuideBlock, en: ResolvedGuideBlock | undefined, es: ResolvedGuideBlock | undefined, full: Completeness): GuideBlock {
  const t = (p: string, e?: string, s?: string) => merge(p, e, s, full);
  switch (pt.type) {
    case "heading":
    case "p":
      return { type: pt.type, text: t(pt.text, ofType(en, pt.type)?.text, ofType(es, pt.type)?.text) };
    case "list": {
      const e = ofType(en, "list");
      const s = ofType(es, "list");
      return { type: "list", items: pt.items.map((item, i) => t(item, e?.items[i], s?.items[i])) };
    }
    case "steps": {
      const e = ofType(en, "steps");
      const s = ofType(es, "steps");
      return {
        type: "steps",
        items: pt.items.map((step, i) => ({
          title: t(step.title, e?.items[i]?.title, s?.items[i]?.title),
          ...(step.text !== undefined ? { text: t(step.text, e?.items[i]?.text, s?.items[i]?.text) } : {}),
        })),
      };
    }
    case "checklist": {
      const e = ofType(en, "checklist");
      const s = ofType(es, "checklist");
      return { type: "checklist", id: pt.id, title: t(pt.title, e?.title, s?.title), items: pt.items.map((item, i) => t(item, e?.items[i], s?.items[i])) };
    }
    case "callout": {
      const e = ofType(en, "callout");
      const s = ofType(es, "callout");
      return {
        type: "callout",
        tone: pt.tone,
        ...(pt.title !== undefined ? { title: t(pt.title, e?.title, s?.title) } : {}),
        text: t(pt.text, e?.text, s?.text),
      };
    }
    case "facts": {
      const e = ofType(en, "facts");
      const s = ofType(es, "facts");
      return {
        type: "facts",
        items: pt.items.map((f, i) => ({ label: t(f.label, e?.items[i]?.label, s?.items[i]?.label), value: t(f.value, e?.items[i]?.value, s?.items[i]?.value) })),
      };
    }
    case "video":
      return { ...pt, title: t(pt.title, ofType(en, "video")?.title, ofType(es, "video")?.title) };
    case "gallery":
      return { ...pt, title: t(pt.title, ofType(en, "gallery")?.title, ofType(es, "gallery")?.title) };
  }
}

function mergeLinks(pt: ResolvedGuideLink[], en: ResolvedGuideLink[] | null, es: ResolvedGuideLink[] | null, full: Completeness): GuideLink[] {
  return pt.map((link, i) => ({ url: link.url, label: merge(link.label, en?.[i]?.label, es?.[i]?.label, full) }));
}

export function toGuideTopic(dto: TopicTranslationsDto): GuideTopic {
  const full: Completeness = { en: dto.fullyTranslatedLangs.includes("en"), es: dto.fullyTranslatedLangs.includes("es") };
  const text = (value: LocalizedText) => merge(value.pt, value.en, value.es, full);
  return {
    id: dto.slug,
    section: dto.section,
    ...(dto.stage ? { stage: dto.stage } : {}),
    title: text(dto.title),
    summary: text(dto.summary),
    blocks: dto.blocks.pt.map((block, i) => mergeBlock(block, dto.blocks.en?.[i], dto.blocks.es?.[i], full)),
    links: mergeLinks(dto.links.pt, dto.links.en, dto.links.es, full),
    ...(dto.placeSlug ? { placeId: dto.placeSlug } : {}),
    source: text(dto.source),
  };
}

// Carrega todas as seções uma vez e guarda em memória; as edições do painel acontecem nessa cópia.
async function loadGuides(): Promise<GuideTopic[]> {
  if (guides) return guides;
  loading ??= Promise.all(GUIDE_SECTIONS.map((section) => apiGet<TopicTranslationsDto[]>(`/guide/translations/topics?section=${section}`)))
    .then((sections) => {
      guides = sections.flat().map(toGuideTopic);
      return guides;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export async function getGuideTopics(section: GuideSection): Promise<GuideTopic[]> {
  return (await loadGuides()).filter((g) => g.section === section);
}

export async function getGuideTopic(id: string): Promise<GuideTopic | null> {
  return (await loadGuides()).find((g) => g.id === id) ?? null;
}

export class GuideValidationError extends Error {}

function validateTopic(topic: GuideTopic) {
  // Português é obrigatório: é o texto exibido quando falta tradução (RN-03 do UC09).
  if (!topic.title.pt.trim() || !topic.summary.pt.trim()) {
    throw new GuideValidationError("Título e resumo em português são obrigatórios.");
  }
}

function slugify(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function saveGuideTopic(topic: GuideTopic, author: string): Promise<GuideTopic> {
  const all = await loadGuides();
  await delay(400);
  validateTopic(topic);
  const current = all.find((g) => g.id === topic.id);
  if (current) {
    guides = all.map((g) => (g.id === topic.id ? topic : g));
  } else {
    let id = slugify(topic.title.pt) || `topico-${Date.now()}`;
    if (all.some((g) => g.id === id)) id = `${id}-${Date.now()}`;
    topic = { ...topic, id };
    guides = [...all, topic];
  }
  recordChange({
    author,
    entity: "Acolhimento",
    entityId: topic.id,
    entityName: topic.title.pt,
    action: current ? "editado" : "criado",
    before: snapshot(current),
    after: snapshot(topic),
  });
  return topic;
}

export async function deleteGuideTopic(id: string, author: string): Promise<void> {
  const all = await loadGuides();
  await delay(300);
  const current = all.find((g) => g.id === id);
  if (!current) return;
  guides = all.filter((g) => g.id !== id);
  recordChange({ author, entity: "Acolhimento", entityId: id, entityName: current.title.pt, action: "deletado", before: snapshot(current), after: null });
}

export async function restoreGuideTopic(id: string, previous: Record<string, unknown> | null) {
  // O histórico pode ser aberto antes de qualquer tela do guia: garante que a lista base já foi carregada.
  const all = await loadGuides();
  if (!previous) {
    guides = all.filter((g) => g.id !== id);
    return;
  }
  const restored = previous as GuideTopic;
  guides = all.some((g) => g.id === id) ? all.map((g) => (g.id === id ? restored : g)) : [...all, restored];
}
