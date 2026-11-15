import type { IconName } from "../components/common/Icon";
import type { Language } from "../i18n/dictionaries";
import { apiGet } from "../lib/api";

// Ponto único de acesso ao Guia de Recife & RMR (UC40). Os tipos espelham RecifeGuideDTO (/api/guide/recife),
// que já devolve o texto no idioma pedido.

export type GuideDetail = {
  label: string;
  text: string;
  icon?: IconName;
  iconTone?: "green" | "amber" | "red";
  emphasis?: boolean;
};

export type GuideSpot = {
  slug: string;
  title: string;
  address: string | null;
  description: string;
  tag: { label: string; tone: "red" | "navy" | "olive" } | null;
  badge: { label: string; tone: "free" | "highlight" } | null;
  distance: { label: string; icon: IconName } | null;
  image: { src: string; alt: string | null } | null;
  detailsLayout: "stack" | "columns";
  details: GuideDetail[];
};

export type GuideTip = {
  slug: string;
  title: string;
  icon: IconName | null;
  text: string;
  link: { label: string; href: string | null } | null;
};

// A frase é before + highlight (em negrito) + after; os espaços nas bordas fazem parte do texto.
export type GuideSupport = {
  before: string;
  highlight: string;
  after: string;
  cta: { label: string; href: string } | null;
};

export type RecifeGuide = {
  spots: GuideSpot[];
  tips: GuideTip[];
  support: GuideSupport | null;
};

// Deve rejeitar a promessa em caso de falha (FE-40.01). `language` é o argumento estável do useApi.
export function getRecifeGuide(language: Language): Promise<RecifeGuide> {
  return apiGet(`/guide/recife?lang=${language}`);
}
