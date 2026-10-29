const PARAM = "local";

// Reflete o local selecionado na URL (?local=<id>): o cartão sobrevive ao recarregar, o link pode ser
// compartilhado e o "voltar" do navegador fecha o cartão. Lê a URL no momento da chamada, então pode ser
// usada em qualquer manipulador de evento.
export function setSelectedPlaceInUrl(id: string | null) {
  const params = new URLSearchParams(window.location.search);
  const hadSelection = params.has(PARAM);
  if (id) params.set(PARAM, id);
  else params.delete(PARAM);
  const query = params.toString();
  const url = query ? `?${query}` : window.location.pathname;

  // Abrir com o mapa sem seleção cria uma entrada no histórico ("voltar" fecha o cartão); trocar de local
  // ou fechar substitui a entrada, para o "voltar" não percorrer cada marcador clicado.
  if (id && !hadSelection) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}
