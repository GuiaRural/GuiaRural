// Gera public/campus-graph.json (grafo de caminhada do campus) a partir do OpenStreetMap.
// Ferramenta de desenvolvimento: roda na máquina de quem atualiza o grafo e não é chamada em produção.
//
//   npm run graph                                   baixa do Overpass e grava o grafo e o relatório
//   npm run graph -- --places <arquivo|url>         confere os locais (arquivo JSON ou GET /api/places)
//   npm run graph -- --input osm.json               usa um download já salvo (sem rede)
//   npm run graph -- --save-raw osm.json            guarda o que veio do OSM
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DEFAULT_OPTIONS, buildCampusGraph, graphBox, type BuildOptions, type OsmElement, type PlaceInput } from "./campus-graph/build";
import { renderReport } from "./campus-graph/report";

const root = fileURLToPath(new URL("..", import.meta.url));
const GRAPH_OUT = `${root}public/campus-graph.json`;
const REPORT_OUT = fileURLToPath(new URL("../../docs/rota-malha-relatorio.md", import.meta.url));
const CONFIG = fileURLToPath(new URL("./campus-graph.config.json", import.meta.url));

// Cabeçalho identifica a ferramenta (a política do Overpass pede); sem dados pessoais.
const USER_AGENT = "guiarural-campus-graph/1.0 (script de desenvolvimento)";
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

function arg(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

async function fetchOsm(options: BuildOptions): Promise<OsmElement[]> {
  const [south, west, north, east] = graphBox(options.padding);
  const query = `[out:json][timeout:50];(way["highway"](${south},${west},${north},${east}););out body;>;out skel qt;`;
  const errors: string[] = [];
  for (const url of OVERPASS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "User-Agent": USER_AGENT, Accept: "*/*", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(70_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return ((await response.json()) as { elements: OsmElement[] }).elements;
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`Não foi possível baixar o OSM.\n${errors.join("\n")}`);
}

type PlaceLike = { slug: string; status: string; latitude: number | null; longitude: number | null };

// Aceita o formato do banco ({ slug, status, latitude, longitude }) e o de GET /api/places (mesmos campos).
async function loadPlaces(source: string): Promise<PlaceInput[]> {
  const text = /^https?:\/\//.test(source) ? await (await fetch(source, { headers: { Accept: "application/json" } })).text() : await readFile(source, "utf-8");
  const list = JSON.parse(text) as PlaceLike[];
  return list.map((p) => ({ slug: p.slug, status: p.status, latitude: p.latitude, longitude: p.longitude }));
}

async function main() {
  const config = JSON.parse(await readFile(CONFIG, "utf-8")) as Partial<BuildOptions> & { notes?: string };
  const options: BuildOptions = {
    ...DEFAULT_OPTIONS,
    padding: config.padding ?? DEFAULT_OPTIONS.padding,
    includePrivateWays: config.includePrivateWays ?? [],
    excludeWays: config.excludeWays ?? [],
    keepIslands: config.keepIslands ?? false,
  };

  const input = arg("input");
  const elements = input ? (JSON.parse(await readFile(input, "utf-8")) as { elements: OsmElement[] }).elements : await fetchOsm(options);
  const raw = arg("save-raw");
  if (raw) await writeFile(raw, JSON.stringify({ elements }), "utf-8");

  const placesSource = arg("places");
  const places = placesSource ? await loadPlaces(placesSource) : null;

  const { graph, report } = buildCampusGraph(elements, places, options);
  await writeFile(GRAPH_OUT, `${JSON.stringify(graph)}\n`, "utf-8");
  await writeFile(REPORT_OUT, `${renderReport(report, "frontend/public/campus-graph.json")}\n`, "utf-8");

  console.log(`Grafo: ${report.graph.nodes} nós, ${report.graph.edges} arestas, ${report.graph.kilometers} km, ${(report.graph.jsonBytes / 1024).toFixed(0)} KB.`);
  console.log(`Componentes: ${report.components.total}; ilhas dentro do campus: ${report.islands.filter((i) => i.insideCampus).length}.`);
  console.log(`Vias access restrito a revisar: ${report.privateWays.length}.`);
  if (report.farPlaces) console.log(`Locais publicados a mais de 40 m de uma via: ${report.farPlaces.length}.`);
  console.log(`Relatório: ${REPORT_OUT}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
