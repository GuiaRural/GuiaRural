import { MOCK_GUIDES, type GuideSection, type GuideTopic, type Translated } from "../data/mockGuides";
import type { Language } from "../i18n/dictionaries";
import { delay } from "../lib/storage";

export async function getGuideTopics(section: GuideSection): Promise<GuideTopic[]> {
  await delay(150);
  return MOCK_GUIDES.filter((g) => g.section === section);
}

// Sem tradução no idioma ativo, devolve o português e sinaliza o fallback (Objeto Nulo seguro, FE01 do UC09).
export function translate(text: Translated, language: Language): { text: string; fallback: boolean } {
  const value = text[language];
  return value ? { text: value, fallback: false } : { text: text.pt, fallback: language !== "pt" };
}

export function isFullyTranslated(topic: GuideTopic, language: Language): boolean {
  if (language === "pt") return true;
  const texts = [topic.title, topic.summary, ...topic.body, ...topic.links.map((l) => l.label)];
  return texts.every((t) => Boolean(t[language]));
}
