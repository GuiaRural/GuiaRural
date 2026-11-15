// Formato do arquivo public/campus-graph.json (gerado por `npm run graph`, ver docs/plano-rota-malha-viaria.md).
// É o contrato entre o gerador (frontend/scripts) e o roteador (lib/routing): quem muda um, muda o outro.

// Coordenadas inteiras em 1e-5 grau (~1,1 m): é a precisão do OSM que importa para o encaixe.
export const GRAPH_SCALE = 100_000;

// edges: [de, para, metros, flags, pontos intermediários [lat, lng, lat, lng, ...]]. flags: 1 = escada.
export type GraphEdge = [number, number, number, number, number[]];
export const FLAG_STEPS = 1;

export type CampusGraph = {
  version: 1;
  generatedAt: string;
  source: string;
  // [sul, oeste, norte, leste] da área consultada.
  bbox: [number, number, number, number];
  scale: number;
  // [lat, lng, lat, lng, ...] dos cruzamentos e pontas.
  nodes: number[];
  edges: GraphEdge[];
};

export class InvalidGraphError extends Error {}

const isInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value);
const isNumberList = (value: unknown, evenLength: boolean): value is number[] =>
  Array.isArray(value) && value.every((n) => typeof n === "number" && Number.isFinite(n)) && (!evenLength || value.length % 2 === 0);

// Confere o que o roteador vai assumir (versão, pares de coordenadas, índices dentro da lista de nós).
// Um arquivo corrompido ou de outra versão vira erro explícito, e a Facade cai para a linha reta.
export function parseGraph(raw: unknown): CampusGraph {
  const graph = raw as Partial<CampusGraph> | null;
  if (!graph || typeof graph !== "object") throw new InvalidGraphError("O grafo não é um objeto.");
  if (graph.version !== 1) throw new InvalidGraphError(`Versão de grafo não suportada: ${String(graph.version)}.`);
  if (graph.scale !== GRAPH_SCALE) throw new InvalidGraphError(`Escala de coordenadas inesperada: ${String(graph.scale)}.`);
  if (!isNumberList(graph.nodes, true)) throw new InvalidGraphError("Lista de nós inválida.");
  if (!Array.isArray(graph.edges)) throw new InvalidGraphError("Lista de arestas inválida.");
  const nodeCount = graph.nodes.length / 2;
  graph.edges.forEach((edge, i) => {
    const [a, b, meters, flags, middle] = edge ?? [];
    if (!isInteger(a) || !isInteger(b) || a < 0 || b < 0 || a >= nodeCount || b >= nodeCount) {
      throw new InvalidGraphError(`Aresta ${i} aponta para um nó que não existe.`);
    }
    if (typeof meters !== "number" || !Number.isFinite(meters) || meters <= 0) throw new InvalidGraphError(`Aresta ${i} sem comprimento válido.`);
    if (!isInteger(flags)) throw new InvalidGraphError(`Aresta ${i} com flags inválidas.`);
    if (!isNumberList(middle, true)) throw new InvalidGraphError(`Aresta ${i} com geometria inválida.`);
  });
  return graph as CampusGraph;
}
