"use client";

import { useSearchParams } from "next/navigation";

const PARAM = "local";

// Troca o local selecionado na URL. Lê a URL no momento do clique, então pode ser usada fora do hook
// (ex.: SearchBar), sem exigir <Suspense> em volta de quem a chama.
export function selectPlace(id: string | null) {
  const params = new URLSearchParams(window.location.search);
  const hadSelection = params.has(PARAM);
  if (id) params.set(PARAM, id);
  else params.delete(PARAM);
  const query = params.toString();
  const url = query ? `?${query}` : window.location.pathname;

  // Abrir com o mapa vazio cria uma entrada no histórico ("voltar" fecha o card); trocar de local
  // ou fechar substitui a entrada, para o "voltar" não percorrer cada marcador clicado.
  if (id && !hadSelection) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

// O local selecionado vive na URL (?local=id): o card sobrevive ao recarregar, o link pode ser
// compartilhado e o "voltar" do navegador funciona. Quem usar este hook precisa estar dentro de <Suspense>.
export function useSelectedPlaceId() {
  const selectedId = useSearchParams().get(PARAM);
  return { selectedId, select: selectPlace };
}
