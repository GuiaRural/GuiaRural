import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "../lib/api";
import {
  GUIDE_SECTIONS,
  hasTranslation,
  isFullyTranslated,
  type GuideBlock,
  type GuideLink,
  type GuideSection,
  type GuideStage,
  type GuideTopic,
  type ResolvedGuideBlock,
  type ResolvedGuideLink,
  type Translated,
} from "./guidesService";

// Área do administrador do guia de acolhimento. Lê da API (/api/guide/translations, os três idiomas lado a lado)
// e grava por POST/PUT/DELETE em /api/guide/topics, que exigem login. O histórico e o desfazer ficam no servidor
// (/api/admin/audit-logs). A lista abaixo é só um cache da tela, atualizado com a resposta de cada escrita.
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

// Esquece o que está em memória: a próxima leitura busca de novo no servidor (ex.: depois de desfazer).
export function resetGuideCache() {
  guides = null;
  loading = null;
}

// ── Escrita ──────────────────────────────────────────────────────────────────────────────────────────────
// O editor trabalha com {pt, en, es} em cada texto; a API recebe um JSON por idioma. Onde falta tradução, o
// idioma leva o texto em português (o servidor guarda quais idiomas estão completos em fullyTranslatedLangs).

export type TopicWriteDto = Omit<TopicTranslationsDto, "slug"> & { slug?: string };

function resolveBlock(block: GuideBlock, pick: (t: Translated) => string): ResolvedGuideBlock {
  switch (block.type) {
    case "heading":
    case "p":
      return { type: block.type, text: pick(block.text) };
    case "list":
      return { type: "list", items: block.items.map(pick) };
    case "steps":
      return { type: "steps", items: block.items.map((s) => ({ title: pick(s.title), ...(s.text !== undefined ? { text: pick(s.text) } : {}) })) };
    case "checklist":
      return { type: "checklist", id: block.id, title: pick(block.title), items: block.items.map(pick) };
    case "callout":
      return { type: "callout", tone: block.tone, ...(block.title !== undefined ? { title: pick(block.title) } : {}), text: pick(block.text) };
    case "facts":
      return { type: "facts", items: block.items.map((f) => ({ label: pick(f.label), value: pick(f.value) })) };
    case "video":
    case "gallery":
      return { ...block, title: pick(block.title) };
  }
}

const localizedText = (t: Translated): LocalizedText => ({ pt: t.pt, en: t.en || null, es: t.es || null });

// Slug fica de fora: quem já existe usa o do endereço, e quem é novo recebe um gerado pelo servidor.
export function toWriteDto(topic: GuideTopic): TopicWriteDto {
  const inLanguage = (lang: "en" | "es") => (t: Translated) => t[lang] || t.pt;
  const perLanguage = <T,>(build: (pick: (t: Translated) => string) => T): LocalizedJson<T> => ({
    pt: build((t) => t.pt),
    en: hasTranslation(topic, "en") ? build(inLanguage("en")) : null,
    es: hasTranslation(topic, "es") ? build(inLanguage("es")) : null,
  });
  return {
    section: topic.section,
    stage: topic.stage ?? null,
    title: localizedText(topic.title),
    summary: localizedText(topic.summary),
    blocks: perLanguage((pick) => topic.blocks.map((b) => resolveBlock(b, pick))),
    links: perLanguage((pick) => topic.links.map((l) => ({ label: pick(l.label), url: l.url }))),
    source: localizedText(topic.source),
    placeSlug: topic.placeId ?? null,
    fullyTranslatedLangs: (["en", "es"] as const).filter((lang) => isFullyTranslated(topic, lang)),
  };
}

// Traduz a falha do servidor numa mensagem que o editor mostra; o que não é conhecido segue como erro genérico.
function explain(error: unknown): unknown {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 409) return new GuideValidationError(error.detail ?? "Dados inválidos.");
    if (error.status === 403) return new GuideValidationError("Seu perfil não tem permissão para alterar o conteúdo.");
    if (error.status === 401) return new GuideValidationError("Sua sessão expirou. Faça login novamente.");
  }
  return error;
}

export async function saveGuideTopic(topic: GuideTopic): Promise<GuideTopic> {
  const all = await loadGuides();
  validateTopic(topic);
  const exists = all.some((g) => g.id === topic.id);
  try {
    const dto = toWriteDto(topic);
    const response = exists
      ? await apiPut<TopicTranslationsDto>(`/guide/topics/${encodeURIComponent(topic.id)}`, dto)
      : await apiPost<TopicTranslationsDto>("/guide/topics", dto);
    const saved = toGuideTopic(response);
    guides = exists ? all.map((g) => (g.id === saved.id ? saved : g)) : [...all, saved];
    return saved;
  } catch (error) {
    throw explain(error);
  }
}

export async function deleteGuideTopic(id: string): Promise<void> {
  const all = await loadGuides();
  try {
    await apiDelete(`/guide/topics/${encodeURIComponent(id)}`);
  } catch (error) {
    // Já não existe no servidor: a tela só precisa refletir isso.
    if (!(error instanceof ApiError && error.status === 404)) throw explain(error);
  }
  guides = all.filter((g) => g.id !== id);
}
