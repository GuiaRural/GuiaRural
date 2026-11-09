import type { Language } from "../i18n/dictionaries";
import { apiGet } from "../lib/api";
import { readJson, writeJson } from "../lib/storage";

// Guia de acolhimento (RF05). A página pública lê /api/guide, que já devolve o texto no idioma pedido (com
// fallback para o português no servidor). O painel administrativo trabalha com os três idiomas lado a lado:
// veja guidesAdminService.

// Português é obrigatório; EN/ES podem faltar e caem no texto em português (FE01 do UC09).
export type Translated = { pt: string; en?: string; es?: string };

export const GUIDE_SECTIONS = ["cultura", "documentos", "calouro", "recife"] as const;
export type GuideSection = (typeof GUIDE_SECTIONS)[number];

// Etapa da jornada do estudante internacional, usada na linha do tempo de documentos.
export type GuideStage = "antes" | "chegada" | "primeiras-semanas" | "mobilidade";

// Os blocos têm a mesma forma nas duas visões: com texto simples (T = string, o que a página pública recebe
// da API) ou com os três idiomas (T = Translated, o que o painel edita).
export type GuideBlockOf<T> =
  | { type: "heading"; text: T }
  | { type: "p"; text: T }
  | { type: "list"; items: T[] }
  | { type: "steps"; items: { title: T; text?: T }[] }
  // Lista de documentos que o usuário pode marcar (progresso salvo no navegador).
  | { type: "checklist"; id: string; title: T; items: T[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; title?: T; text: T }
  | { type: "facts"; items: { label: T; value: T }[] }
  | { type: "video"; title: T; credit: string; driveId: string }
  // embed: a pasta precisa ser pública para aparecer dentro da página; senão, só o link é exibido.
  | { type: "gallery"; title: T; credit: string; folderId: string; url: string; embed: boolean };

export type GuideBlock = GuideBlockOf<Translated>;
export type ResolvedGuideBlock = GuideBlockOf<string>;

export type GuideLink = { label: Translated; url: string };
export type ResolvedGuideLink = { label: string; url: string };

// Tópico como o painel edita: textos nos três idiomas.
export type GuideTopic = {
  id: string;
  section: GuideSection;
  stage?: GuideStage;
  title: Translated;
  summary: Translated;
  blocks: GuideBlock[];
  links: GuideLink[];
  // Local do campus relacionado, aberto em /locais/[id].
  placeId?: string;
  source: Translated;
};

// Espelham os DTOs de /api/guide/topics (GuideTopicSummaryDTO e GuideTopicDetailDTO).
export type GuideTopicSummary = {
  slug: string;
  section: GuideSection;
  stage: GuideStage | null;
  title: string;
  summary: string;
  placeSlug: string | null;
  // false quando algum texto do tópico caiu no português por falta de tradução.
  fullyTranslated: boolean;
};

export type GuideTopicDetail = GuideTopicSummary & {
  // Idioma em que o título de fato veio (pt quando faltou a tradução), para o atributo lang.
  titleLang: Language;
  blocks: ResolvedGuideBlock[];
  links: ResolvedGuideLink[];
  source: string | null;
};

// Espelham GuideResourcesDTO (/api/guide/resources).
export type GuideContact = { label: string; value: string; href: string };
export type GuideDownload = { label: string; language: string; href: string };
export type GuideResources = { support: GuideContact[]; emergency: GuideContact[]; downloads: GuideDownload[] };

// useApi recebe um único argumento estável (string): cada chave junta os parâmetros da chamada.
export type TopicsKey = `${GuideSection}:${Language}`;
export type TopicKey = `${string}:${Language}`;

export function loadGuideTopics(key: TopicsKey): Promise<GuideTopicSummary[]> {
  const [section, language] = key.split(":");
  return apiGet(`/guide/topics?section=${section}&lang=${language}`);
}

export function loadGuideTopic(key: TopicKey): Promise<GuideTopicDetail> {
  const separator = key.lastIndexOf(":");
  const slug = key.slice(0, separator);
  const language = key.slice(separator + 1);
  return apiGet(`/guide/topics/${encodeURIComponent(slug)}?lang=${language}`);
}

// A chave é "<idioma>:<termo>"; o termo pode conter ":".
export function loadGuideSearch(key: string): Promise<GuideTopicSummary[]> {
  const separator = key.indexOf(":");
  const language = key.slice(0, separator);
  const query = key.slice(separator + 1).trim();
  // Abaixo de 2 caracteres o servidor devolve vazio: nem chamamos.
  if (query.length < MIN_SEARCH_LENGTH) return Promise.resolve([]);
  return apiGet(`/guide/search?q=${encodeURIComponent(query)}&lang=${language}`);
}

export const MIN_SEARCH_LENGTH = 2;

export function loadGuideResources(language: Language): Promise<GuideResources> {
  return apiGet(`/guide/resources?lang=${language}`);
}

// Sem tradução no idioma ativo, devolve o português e sinaliza o fallback (Objeto Nulo seguro, FE01 do UC09).
export function translate(text: Translated, language: Language): { text: string; fallback: boolean } {
  const value = text[language];
  return value ? { text: value, fallback: false } : { text: text.pt, fallback: language !== "pt" };
}

function blockTexts(block: GuideBlock): Translated[] {
  switch (block.type) {
    case "heading":
    case "p":
      return [block.text];
    case "list":
      return block.items;
    case "steps":
      return block.items.flatMap((s) => (s.text ? [s.title, s.text] : [s.title]));
    case "checklist":
      return [block.title, ...block.items];
    case "callout":
      return block.title ? [block.title, block.text] : [block.text];
    case "facts":
      return block.items.flatMap((f) => [f.label, f.value]);
    case "video":
    case "gallery":
      return [block.title];
  }
}

function topicTexts(topic: GuideTopic): Translated[] {
  return [topic.title, topic.summary, ...topic.blocks.flatMap(blockTexts), ...topic.links.map((l) => l.label)];
}

// Algum texto do tópico tem tradução neste idioma? (Se nenhum tem, o idioma nem recebe conteúdo próprio.)
export function hasTranslation(topic: GuideTopic, language: Language): boolean {
  return topicTexts(topic).some((t) => Boolean(t[language]));
}

export function isFullyTranslated(topic: GuideTopic, language: Language): boolean {
  if (language === "pt") return true;
  return topicTexts(topic).every((t) => Boolean(t[language]));
}

// Progresso das listas de documentos fica no navegador; não há conta de usuário na área pública.
const CHECKLIST_KEY = "guiarural:checklists";

export function getChecklist(id: string): number[] {
  return readJson<Record<string, number[]>>(CHECKLIST_KEY, {})[id] ?? [];
}

export function toggleChecklistItem(id: string, index: number): number[] {
  const all = readJson<Record<string, number[]>>(CHECKLIST_KEY, {});
  const current = new Set(all[id] ?? []);
  if (current.has(index)) current.delete(index);
  else current.add(index);
  const next = [...current].sort((a, b) => a - b);
  writeJson(CHECKLIST_KEY, { ...all, [id]: next });
  return next;
}
