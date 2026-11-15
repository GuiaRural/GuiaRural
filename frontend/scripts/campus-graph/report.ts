import type { BuildReport } from "./build";

// Relatório de qualidade do grafo em Markdown (revisado no PR junto com public/campus-graph.json).
export function renderReport(report: BuildReport, graphFile: string): string {
  const out: string[] = [];
  const line = (text = "") => out.push(text);

  line("# Relatório do grafo de caminhada do campus");
  line();
  line(`Gerado em ${report.generatedAt} por \`npm run graph\` (frontend), a partir do OpenStreetMap (ODbL). Arquivo: \`${graphFile}\`.`);
  line("Não substitui a conferência em campo: é o que o OSM tem hoje.");
  line();
  line("## Resumo");
  line();
  line(`- Vias com \`highway\` lidas: **${report.waysTotal}**; caminháveis ${report.byStatus.ok}, com \`access\` restrito ${report.byStatus.private} (${report.privateWays.length} passam pelo campus e estão na tabela abaixo), descartadas ${report.byStatus.excluded}.`);
  line(`- Vias que passam pelo campus (com folga): ${report.selectedWays}. Nós ausentes na resposta do OSM: ${report.missingNodes}.`);
  line(`- **Grafo gravado:** ${report.graph.nodes} nós, ${report.graph.edges} arestas, ${report.graph.kilometers} km, ${(report.graph.jsonBytes / 1024).toFixed(0)} KB (sem comprimir).`);
  line(`- Componentes conexos: ${report.components.total}; o maior tem ${report.components.mainKilometers} km${report.components.droppedIslands ? " e é o único gravado (as ilhas ficam de fora)" : ""}.`);
  line(`- Tipos de via: ${Object.entries(report.byHighway).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  line();

  line("## Vias `access` restrito (revisar uma a uma, D19.3)");
  line();
  if (report.privateWays.length === 0) {
    line("Nenhuma.");
  } else {
    line("Decisão em `scripts/campus-graph.config.json` (`includePrivateWays`). \"Liga componentes\" indica quantos componentes a via toca: com 2 ou mais, liberar a via junta pedaços do grafo.");
    line();
    line("| Via (OSM) | Tipo | Nome | Metros | Liga componentes |");
    line("|---|---|---|---|---|");
    for (const way of report.privateWays) {
      line(`| [${way.id}](https://www.openstreetmap.org/way/${way.id}) | ${way.highway}${way.service ? ` (${way.service})` : ""} | ${way.name ?? "—"} | ${way.meters} | ${way.componentsTouched >= 2 ? `**${way.componentsTouched}**` : way.componentsTouched} |`);
    }
  }
  line();

  line("## Ilhas (partes desconectadas)");
  line();
  if (report.islands.length === 0) {
    line("Nenhuma.");
  } else {
    line("Uma ilha dentro do campus costuma ser uma ligação que falta no OSM. A folga é a menor distância até o componente principal.");
    line();
    line("| Metros | Vias | Centro (lat, lng) | Dentro do campus | Folga até o principal (m) |");
    line("|---|---|---|---|---|");
    for (const island of [...report.islands].sort((a, b) => Number(b.insideCampus) - Number(a.insideCampus) || b.meters - a.meters)) {
      line(`| ${island.meters} | ${island.ways} | ${island.center.lat.toFixed(5)}, ${island.center.lng.toFixed(5)} | ${island.insideCampus ? "**sim**" : "não"} | ${island.gapMetersToMain ?? "—"} |`);
    }
  }
  line();

  line("## Locais x via mais próxima");
  line();
  if (!report.places) {
    line("Não verificado: nenhum arquivo ou URL de locais foi informado (`--places`).");
  } else {
    const published = report.places.filter((p) => p.status === "publicado");
    const sorted = published.map((p) => p.snapMeters).sort((a, b) => a - b);
    const at = (fraction: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
    line(`Locais publicados com coordenada: **${published.length}**. Distância até a via do componente principal: mediana ${at(0.5)} m, p90 ${at(0.9)} m, máxima ${sorted[sorted.length - 1]} m.`);
    line();
    if (report.farPlaces && report.farPlaces.length > 0) {
      line("Acima de 40 m (o trecho final até o prédio vai tracejado; conferir a coordenada em campo):");
      line();
      for (const place of report.farPlaces) line(`- \`${place.slug}\`: ${place.snapMeters} m`);
    } else {
      line("Nenhum local publicado passa de 40 m.");
    }
    const islandNeighbours = published.filter((p) => p.nearestIsIsland).map((p) => p.slug);
    line();
    line(islandNeighbours.length ? `Locais cuja via mais próxima está numa ilha (a rota encaixa no componente principal, mais longe): ${islandNeighbours.map((s) => `\`${s}\``).join(", ")}.` : "Nenhum local tem a via mais próxima numa ilha.");
  }
  line();
  return out.join("\n");
}
