// Filtro do Guia de Recife (CT-040.02 a 040.04): as categorias vêm fixas do servidor (podem estar sem lugares),
// e cada lugar traz o slug da sua categoria (nulo = sem categoria, vira "Outros").

export type RecifeFilter = { kind: "all" } | { kind: "category"; slug: string } | { kind: "other" };

type SpotLike = { category: string | null };

export function matchesFilter(spot: SpotLike, filter: RecifeFilter): boolean {
  if (filter.kind === "all") return true;
  if (filter.kind === "other") return spot.category === null;
  return spot.category === filter.slug;
}

export function isSameFilter(a: RecifeFilter, b: RecifeFilter): boolean {
  if (a.kind !== b.kind) return false;
  return a.kind !== "category" || (b.kind === "category" && a.slug === b.slug);
}
