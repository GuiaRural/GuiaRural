import { ApiError, apiDelete, apiGet, apiPost, apiPut, apiPutForm, isNotFound } from "../lib/api";
import type { LatLng } from "../lib/geo";
import { readJson, writeJson } from "../lib/storage";

// Ponto único de acesso aos locais (backend: /api/places e /api/admin/places). Os tipos espelham os DTOs.
// Leitura pública (mapa, busca, página do local): só locais publicados. Painel: todos, com criar, editar,
// excluir e foto (UC14 a UC16); o servidor valida de novo e grava o histórico de cada mudança.

// Mesma lista do check da tabela places (o banco recusa qualquer outra).
export const PLACE_CATEGORIES = [
  "departamento",
  "administrativo",
  "biblioteca",
  "alimentacao",
  "portaria",
  "auditorio",
  "esporte",
  "sala",
  "saude",
  "moradia",
  "apoio",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

// publicado: visível no mapa e na busca; rascunho e inativo: só na área do administrador (RN-UC14.02).
export type PlaceStatus = "publicado" | "rascunho" | "inativo";

// Responsável pelo local (D7): nome e e-mail institucional.
export type PlaceContact = { name: string; email?: string };

// Serviço do catálogo (/servicos) ou curso ligado ao local.
export type PlaceLink = { id: number; name: string };

export type Place = {
  // Slug do local: é o que aparece na URL (/locais/<id>) e o que o navegador guarda em "últimos acessos".
  id: string;
  name: string;
  shortName: string;
  category: PlaceCategory;
  status: PlaceStatus;
  // Coordenadas no mapa; null enquanto o local não for georreferenciado.
  position: LatLng | null;
  // De onde veio a coordenada (ex.: "Google Places"): mostra o que ainda precisa de conferência em campo.
  coordinatesSource?: string;
  address: string;
  hours: string;
  description: string;
  contacts: PlaceContact[];
  services: PlaceLink[];
  courses: PlaceLink[];
  // Endereço da foto no backend (com a versão na URL); sem foto, a tela mostra a sigla do local.
  photoUrl?: string;
};

// O que o formulário do painel envia. Sem `id`, é um local novo (o servidor gera o slug a partir do nome).
export type PlaceInput = Omit<Place, "id" | "services" | "courses" | "photoUrl" | "coordinatesSource"> & {
  id?: string;
  coordinatesSource?: string;
  serviceIds: number[];
  courseIds: number[];
};

// Primeira visita: "últimos acessos" começa com estes locais do campus (todos existem no banco).
const DEFAULT_RECENT_IDS = ["reitoria", "ceagri-1", "biblioteca", "dc"];

// Origem padrão para distância e tempo exibidos no cartão do local (RN-UC02.01).
// É o slug do Prédio Central (Reitoria) no banco.
export const DEFAULT_ORIGIN_ID = "reitoria";

// Espelha PlaceResponseDTO do backend.
type PlaceDto = {
  slug: string;
  name: string;
  shortName: string | null;
  category: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  coordinatesSource: string | null;
  address: string | null;
  hours: string | null;
  description: string | null;
  contacts: { name: string; email: string | null }[];
  services: PlaceLink[];
  courses: PlaceLink[];
  photoUrl: string | null;
};

function toPlace(dto: PlaceDto): Place {
  return {
    id: dto.slug,
    name: dto.name,
    shortName: dto.shortName ?? dto.name,
    category: dto.category as PlaceCategory,
    status: dto.status as PlaceStatus,
    position: dto.latitude !== null && dto.longitude !== null ? { lat: dto.latitude, lng: dto.longitude } : null,
    coordinatesSource: dto.coordinatesSource ?? undefined,
    address: dto.address ?? "",
    hours: dto.hours ?? "",
    description: dto.description ?? "",
    contacts: dto.contacts.map((c) => ({ name: c.name, email: c.email ?? undefined })),
    services: dto.services,
    courses: dto.courses,
    photoUrl: dto.photoUrl ?? undefined,
  };
}

// A lista pública é pequena e muda pouco: uma busca por sessão. Em caso de falha o cache é descartado
// para que "tentar novamente" refaça a requisição.
let publicCache: Promise<Place[]> | null = null;
let publicLoaded: Place[] | null = null;

// Depois de criar, editar, excluir ou trocar a foto, o mapa e a busca precisam ler a lista de novo.
function resetPublicCache() {
  publicCache = null;
  publicLoaded = null;
}

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
  const ids = readJson<string[]>(RECENT_KEY, DEFAULT_RECENT_IDS);
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Place => Boolean(p));
}

// RN-UC02.02: a lista de últimos acessos é atualizada a cada local consultado.
export function addRecentPlace(id: string) {
  const ids = readJson<string[]>(RECENT_KEY, DEFAULT_RECENT_IDS).filter((x) => x !== id);
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

// ---- Área do administrador (exige login; o servidor confere o perfil) ----

export class PlaceValidationError extends Error {}

// 400 (regra do UC14 ou campo inválido) e 409 (identificador repetido) viram uma mensagem para o formulário.
function asValidationError(error: unknown): unknown {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) {
    const fieldMessage = Object.values(error.fields ?? {})[0];
    return new PlaceValidationError(error.detail ?? fieldMessage ?? "Dados do local inválidos.");
  }
  return error;
}

export async function listAllPlaces(): Promise<Place[]> {
  return (await apiGet<PlaceDto[]>("/admin/places")).map(toPlace);
}

export async function getPlaceForAdmin(id: string): Promise<Place | null> {
  try {
    return toPlace(await apiGet<PlaceDto>(`/admin/places/${encodeURIComponent(id)}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

function payloadOf(input: PlaceInput) {
  const optional = (value?: string) => value?.trim() || null;
  return {
    name: input.name.trim(),
    shortName: optional(input.shortName),
    category: input.category,
    status: input.status,
    latitude: input.position?.lat ?? null,
    longitude: input.position?.lng ?? null,
    coordinatesSource: optional(input.coordinatesSource),
    address: optional(input.address),
    hours: optional(input.hours),
    description: optional(input.description),
    serviceIds: input.serviceIds,
    courseIds: input.courseIds,
    contacts: input.contacts.map((c) => ({ name: c.name.trim(), email: optional(c.email) })),
  };
}

// RN-UC14.01 e as demais regras são conferidas no servidor; o erro volta como PlaceValidationError.
export async function savePlace(input: PlaceInput): Promise<Place> {
  try {
    const dto = input.id
      ? await apiPut<PlaceDto>(`/places/${encodeURIComponent(input.id)}`, payloadOf(input))
      : await apiPost<PlaceDto>("/places", payloadOf(input));
    resetPublicCache();
    return toPlace(dto);
  } catch (error) {
    throw asValidationError(error);
  }
}

// Volta o local ao formato do formulário, para reenviá-lo com uma mudança (ex.: só o status).
export function toInput(place: Place): PlaceInput {
  return {
    id: place.id,
    name: place.name,
    shortName: place.shortName,
    category: place.category,
    status: place.status,
    position: place.position,
    coordinatesSource: place.coordinatesSource,
    address: place.address,
    hours: place.hours,
    description: place.description,
    contacts: place.contacts,
    serviceIds: place.services.map((s) => s.id),
    courseIds: place.courses.map((c) => c.id),
  };
}

export async function setPlaceStatus(id: string, status: PlaceStatus): Promise<void> {
  const place = await getPlaceForAdmin(id);
  if (!place) return;
  await savePlace({ ...toInput(place), status });
}

// Já excluído em outra aba (404) é tratado como sucesso: o resultado desejado já existe.
export async function deletePlace(id: string): Promise<void> {
  try {
    await apiDelete(`/places/${encodeURIComponent(id)}`);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  } finally {
    resetPublicCache();
  }
}

// O servidor reduz a imagem e a grava em JPEG; aqui só vai o arquivo escolhido.
export async function uploadPlacePhoto(id: string, file: File): Promise<Place> {
  const form = new FormData();
  form.append("file", file);
  try {
    const dto = await apiPutForm<PlaceDto>(`/places/${encodeURIComponent(id)}/photo`, form);
    resetPublicCache();
    return toPlace(dto);
  } catch (error) {
    throw asValidationError(error);
  }
}

export async function deletePlacePhoto(id: string): Promise<void> {
  await apiDelete(`/places/${encodeURIComponent(id)}/photo`);
  resetPublicCache();
}

// RN-UC02.01: distância e tempo do cartão partem da origem padrão do campus (Prédio Central).
// Lê do cache da lista pública, que as telas já carregaram antes de mostrar um local; null se ainda não houver.
export function getDefaultOrigin(): Place | null {
  return publicLoaded?.find((p) => p.id === DEFAULT_ORIGIN_ID) ?? null;
}
