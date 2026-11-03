// Mensagem de uma tela para a próxima (ex.: "local publicado" ao voltar para a listagem).
// Fica só na memória: some ao ser lida ou ao recarregar a página.
let pending: string | null = null;

export function setFlash(message: string) {
  pending = message;
}

export function takeFlash(): string | null {
  const message = pending;
  pending = null;
  return message;
}
