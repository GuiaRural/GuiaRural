import { metersBetween, type LatLng } from "../geo";
import { FLAG_STEPS } from "./format";
import { pointsBetween, snapToNetwork, type Network } from "./network";

// Rota a pé pela malha viária do campus: encaixa origem e destino na via mais próxima e acha o menor caminho
// com A*. Funções puras (sem rede nem DOM); quem carrega o grafo e cai para a linha reta é a Facade (routeService).

export type RouteOptions = {
  // Origem ou destino a mais que isso da via mais próxima: sem rota pela malha (null).
  maxSnapMeters?: number;
  // Desligar a heurística vira Dijkstra puro; existe para os testes conferirem que o A* acha o mesmo caminho.
  useHeuristic?: boolean;
};

export const DEFAULT_MAX_SNAP_METERS = 150;

export type NetworkRoute = {
  // Origem, trecho de acesso, vias, trecho de acesso e destino, prontos para desenhar.
  points: LatLng[];
  // Total a pé: acessos mais vias.
  meters: number;
  networkMeters: number;
  // Distância em linha reta entre a origem/destino e a via onde foram encaixados (não é via mapeada).
  accessMeters: { start: number; end: number };
  // Pontos só das vias, de onde a origem foi encaixada até onde o destino foi.
  network: LatLng[];
  // Quanto do trajeto é escada (o OSM marca; serve para avisar, não para evitar).
  stepsMeters: number;
};

// Fila de prioridade mínima (heap binário) com remoção preguiçosa: o mesmo nó pode entrar mais de uma vez.
class MinHeap {
  private priorities: number[] = [];
  private items: number[] = [];

  get size() {
    return this.items.length;
  }

  push(priority: number, item: number) {
    let i = this.items.length;
    this.priorities.push(priority);
    this.items.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.priorities[parent] <= this.priorities[i]) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number {
    const top = this.items[0];
    const lastPriority = this.priorities.pop()!;
    const lastItem = this.items.pop()!;
    if (this.items.length > 0) {
      this.priorities[0] = lastPriority;
      this.items[0] = lastItem;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let smallest = i;
        if (left < this.items.length && this.priorities[left] < this.priorities[smallest]) smallest = left;
        if (right < this.items.length && this.priorities[right] < this.priorities[smallest]) smallest = right;
        if (smallest === i) break;
        this.swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }

  private swap(i: number, j: number) {
    [this.priorities[i], this.priorities[j]] = [this.priorities[j], this.priorities[i]];
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }
}

export function findRoute(network: Network, origin: LatLng, destination: LatLng, options: RouteOptions = {}): NetworkRoute | null {
  const maxSnap = options.maxSnapMeters ?? DEFAULT_MAX_SNAP_METERS;
  const start = snapToNetwork(network, origin, maxSnap);
  const goal = snapToNetwork(network, destination, maxSnap);
  if (!start || !goal) return null;

  // Nós virtuais: S (onde a origem tocou a via) e D (onde o destino tocou). Ficam no meio de uma aresta, então a busca
  // os trata como dois nós a mais ligados às pontas da aresta em que caíram.
  const n = network.nodes.length;
  const S = n;
  const D = n + 1;
  const startEdge = network.edges[start.edge];
  const goalEdge = network.edges[goal.edge];
  const pointOf = (u: number): LatLng => (u < n ? network.nodes[u] : u === S ? start.point : goal.point);

  type Visit = (to: number, cost: number, edge: number, from: number, toPos: number) => void;
  const expand = (u: number, visit: Visit) => {
    if (u === S) {
      visit(startEdge.a, start.pos, start.edge, start.pos, 0);
      visit(startEdge.b, startEdge.meters - start.pos, start.edge, start.pos, startEdge.meters);
      if (start.edge === goal.edge) visit(D, Math.abs(start.pos - goal.pos), start.edge, start.pos, goal.pos);
      return;
    }
    for (const { edge, to } of network.adjacency[u]) {
      const e = network.edges[edge];
      const forward = e.a === u;
      visit(to, e.meters, edge, forward ? 0 : e.meters, forward ? e.meters : 0);
    }
    if (u === goalEdge.a) visit(D, goal.pos, goal.edge, 0, goal.pos);
    if (u === goalEdge.b) visit(D, goalEdge.meters - goal.pos, goal.edge, goalEdge.meters, goal.pos);
  };

  const heuristic = options.useHeuristic === false ? () => 0 : (u: number) => metersBetween(pointOf(u), goal.point);
  const total = n + 2;
  const cost = new Float64Array(total).fill(Infinity);
  const cameFrom = new Int32Array(total).fill(-1);
  const viaEdge = new Int32Array(total).fill(-1);
  const viaFrom = new Float64Array(total);
  const viaTo = new Float64Array(total);

  cost[S] = 0;
  const open = new MinHeap();
  open.push(heuristic(S), S);
  while (open.size > 0) {
    const u = open.pop();
    if (u === D) break;
    expand(u, (to, step, edge, from, toPos) => {
      const candidate = cost[u] + step;
      if (candidate < cost[to]) {
        cost[to] = candidate;
        cameFrom[to] = u;
        viaEdge[to] = edge;
        viaFrom[to] = from;
        viaTo[to] = toPos;
        open.push(candidate + heuristic(to), to);
      }
    });
  }
  if (!Number.isFinite(cost[D])) return null;

  // Reconstrói do destino para a origem e desenha na ordem certa.
  const legs: { edge: number; from: number; to: number }[] = [];
  for (let u = D; u !== S; u = cameFrom[u]) legs.push({ edge: viaEdge[u], from: viaFrom[u], to: viaTo[u] });
  legs.reverse();

  const network_: LatLng[] = [];
  let stepsMeters = 0;
  for (const leg of legs) {
    const edge = network.edges[leg.edge];
    if (edge.flags & FLAG_STEPS) stepsMeters += Math.abs(leg.to - leg.from);
    for (const point of pointsBetween(edge, leg.from, leg.to)) {
      const last = network_[network_.length - 1];
      if (!last || last.lat !== point.lat || last.lng !== point.lng) network_.push(point);
    }
  }

  const networkMeters = cost[D];
  return {
    points: [origin, ...network_, destination],
    meters: networkMeters + start.meters + goal.meters,
    networkMeters,
    accessMeters: { start: start.meters, end: goal.meters },
    network: network_,
    stepsMeters,
  };
}
