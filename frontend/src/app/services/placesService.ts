import { DEFAULT_ORIGIN_ID, MOCK_PLACES, MOCK_RECENT_IDS, type Place, type PlaceCategory, type PlaceStatus } from "../data/mockPlaces";
import { apiGet } from "../lib/api";
import { delay, readJson, writeJson } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

// Ponto único de acesso aos locais. A leitura pública (mapa, busca, página do local) vem do backend
// (/api/places); a área do administrador abaixo ainda usa um mock em memória, então o que for editado
// lá não aparece no mapa até o CRUD de locais ir para a API (UC14 a UC16, que exigem autenticação).
let places: Place[] = structuredClone(MOCK_PLACES);

// Espelha PlaceResponseDTO do backend. Campos que o banco ainda não tem (acessibilidade, serviços,
// cursos vinculados, foto) saem vazios.
type PlaceDto = {
  slug: string;
  name: string;
  shortName: string | null;
  category: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  hours: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
};

function toPlace(dto: PlaceDto): Place {
  return {
    id: dto.slug,
    name: dto.name,
    shortName: dto.shortName ?? dto.name,
    category: dto.category as PlaceCategory,
    status: "publicado",
    position: dto.latitude !== null && dto.longitude !== null ? { lat: dto.latitude, lng: dto.longitude } : null,
    address: dto.address ?? "",
    hours: dto.hours ?? "",
    accessibility: [],
    description: dto.description ?? "",
    courseIds: [],
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    services: [],
  };
}

// A lista pública é pequena e muda pouco: uma busca por sessão. Em caso de falha o cache é descartado
// para que "tentar novamente" refaça a requisição.
let publicCache: Promise<Place[]> | null = null;
let publicLoaded: Place[] | null = null;

const RECENT_KEY = "guiarural.recentPlaces";
const SAVED_KEY = "guiarural.savedPlaces";
const MAX_RECENT = 4;

// RN-01.03: sugestões só a partir de 3 caracteres.
export const MIN_SEARCH_CHARS = 3;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Rascunhos, inativos e locais sem coordenadas não aparecem no mapa nem na busca (RN-UC14.02).
function isPublic(p: Place): p is Place & { position: NonNullable<Place["position"]> } {
  return p.status === "publicado" && p.position !== null;
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = normalize(query.trim());
  if (q.length < MIN_SEARCH_CHARS) return [];
  return (await getPublicPlaces())
    .filter((p) => normalize(p.name).includes(q) || normalize(p.shortName).includes(q))
    .slice(0, 5);
}

export function getPublicPlaces(): Promise<Place[]> {
  publicCache ??= apiGet<PlaceDto[]>("/places")
    .then((list) => {
      publicLoaded = list.map(toPlace).filter(isPublic);
      return publicLoaded;
    })
    .catch((error) => {
      publicCache = null;
      throw error;
    });
  return publicCache;
}

export async function getPlace(id: string): Promise<Place | null> {
  return (await getPublicPlaces()).find((p) => p.id === id) ?? null;
}

export async function getRecentPlaces(): Promise<Place[]> {
  const all = await getPublicPlaces();
  const ids = readJson<string[]>(RECENT_KEY, MOCK_RECENT_IDS);
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Place => Boolean(p));
}

// RN-UC02.02: a lista de últimos acessos é atualizada a cada local consultado.
export function addRecentPlace(id: string) {
  const ids = readJson<string[]>(RECENT_KEY, MOCK_RECENT_IDS).filter((x) => x !== id);
  writeJson(RECENT_KEY, [id, ...ids].slice(0, MAX_RECENT));
}

export function isPlaceSaved(id: string): boolean {
  return readJson<string[]>(SAVED_KEY, []).includes(id);
}

export function toggleSavedPlace(id: string): boolean {
  const saved = readJson<string[]>(SAVED_KEY, []);
  const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  writeJson(SAVED_KEY, next);
  return next.includes(id);
}

// ---- Área do administrador ----

export async function listAllPlaces(): Promise<Place[]> {
  await delay();
  return [...places];
}

export async function getPlaceForAdmin(id: string): Promise<Place | null> {
  await delay(150);
  return places.find((p) => p.id === id) ?? null;
}

function slugify(name: string) {
  return normalize(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "local";
}

export class PlaceValidationError extends Error {}

export async function savePlace(input: Omit<Place, "id"> & { id?: string }, author: string): Promise<Place> {
  await delay(400);
  // RN-UC14.01: publicar exige georreferenciamento.
  if (input.status === "publicado" && !input.position) {
    throw new PlaceValidationError("Um local só pode ser publicado com latitude e longitude preenchidas.");
  }
  const existing = input.id ? places.find((p) => p.id === input.id) : undefined;
  let id = input.id ?? slugify(input.shortName || input.name);
  if (!existing) {
    const base = id;
    for (let n = 2; places.some((p) => p.id === id); n++) id = `${base}-${n}`;
  }
  const place: Place = { ...input, id };
  places = existing ? places.map((p) => (p.id === id ? place : p)) : [...places, place];
  recordChange({
    author,
    entity: "Local",
    entityId: id,
    entityName: place.name,
    action: existing ? "editado" : "criado",
    before: snapshot(existing),
    after: snapshot(place),
  });
  return place;
}

export async function setPlaceStatus(id: string, status: PlaceStatus, author: string): Promise<void> {
  await delay();
  const existing = places.find((p) => p.id === id);
  if (!existing) return;
  if (status === "publicado" && !existing.position) {
    throw new PlaceValidationError("Georreferencie o local antes de publicá-lo.");
  }
  const updated = { ...existing, status };
  places = places.map((p) => (p.id === id ? updated : p));
  recordChange({
    author,
    entity: "Local",
    entityId: id,
    entityName: existing.name,
    action: "editado",
    before: snapshot(existing),
    after: snapshot(updated),
  });
}

export async function deletePlace(id: string, author: string): Promise<void> {
  await delay();
  const existing = places.find((p) => p.id === id);
  if (!existing) return;
  places = places.filter((p) => p.id !== id);
  recordChange({
    author,
    entity: "Local",
    entityId: id,
    entityName: existing.name,
    action: "deletado",
    before: snapshot(existing),
    after: null,
  });
}

// Usado pelo "Desfazer" do histórico: volta o registro ao snapshot anterior (ou remove, se não existia).
export function restorePlace(id: string, previous: Record<string, unknown> | null): Place | null {
  const current = places.find((p) => p.id === id) ?? null;
  if (!previous) {
    places = places.filter((p) => p.id !== id);
    return current;
  }
  const restored = { ...(current ?? {}), ...previous, photoDataUrl: current?.photoDataUrl } as Place;
  places = current ? places.map((p) => (p.id === id ? restored : p)) : [...places, restored];
  return current;
}

// RN-UC02.01: distância e tempo do cartão partem da origem padrão do campus (Prédio Central).
// Lê do cache da lista pública, que as telas já carregaram antes de mostrar um local; null se ainda não houver.
export function getDefaultOrigin(): Place | null {
  return publicLoaded?.find((p) => p.id === DEFAULT_ORIGIN_ID) ?? null;
}
