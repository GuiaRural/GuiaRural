import { MOCK_GUIDES, type GuideBlock, type GuideSection, type GuideTopic, type Translated } from "../data/mockGuides";
import type { Language } from "../i18n/dictionaries";
import { delay, readJson, writeJson } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

// Tópicos editados pelo painel (área do administrador); a página pública lê a mesma lista.
let guides: GuideTopic[] = [...MOCK_GUIDES];

// Recife tem tela própria (UC40) e não é editado por aqui.
export const EDITABLE_SECTIONS = ["cultura", "documentos", "calouro"] as const satisfies readonly GuideSection[];

export async function getGuideTopics(section: GuideSection): Promise<GuideTopic[]> {
  await delay(150);
  return guides.filter((g) => g.section === section);
}

export async function getGuideTopic(id: string): Promise<GuideTopic | null> {
  await delay(150);
  return guides.find((g) => g.id === id) ?? null;
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
  await delay(400);
  validateTopic(topic);
  const current = guides.find((g) => g.id === topic.id);
  if (current) {
    guides = guides.map((g) => (g.id === topic.id ? topic : g));
  } else {
    let id = slugify(topic.title.pt) || `topico-${Date.now()}`;
    if (guides.some((g) => g.id === id)) id = `${id}-${Date.now()}`;
    topic = { ...topic, id };
    guides = [...guides, topic];
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
  await delay(300);
  const current = guides.find((g) => g.id === id);
  if (!current) return;
  guides = guides.filter((g) => g.id !== id);
  recordChange({ author, entity: "Acolhimento", entityId: id, entityName: current.title.pt, action: "deletado", before: snapshot(current), after: null });
}

export function restoreGuideTopic(id: string, previous: Record<string, unknown> | null) {
  if (!previous) {
    guides = guides.filter((g) => g.id !== id);
    return;
  }
  const restored = previous as GuideTopic;
  guides = guides.some((g) => g.id === id) ? guides.map((g) => (g.id === id ? restored : g)) : [...guides, restored];
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

export function isFullyTranslated(topic: GuideTopic, language: Language): boolean {
  if (language === "pt") return true;
  return topicTexts(topic).every((t) => Boolean(t[language]));
}

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Busca em todas as cartilhas, no idioma ativo e em português (para achar conteúdo ainda sem tradução).
export function searchGuides(query: string, language: Language): GuideTopic[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  return guides.filter((topic) =>
    topicTexts(topic).some((t) => normalize(t.pt).includes(q) || normalize(t[language] ?? "").includes(q)),
  );
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
