// localStorage/sessionStorage podem falhar (aba anônima, dados bloqueados): toda leitura e escrita é protegida.
type Area = "local" | "session";

function area(kind: Area): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T, kind: Area = "local"): T {
  try {
    const raw = area(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, kind: Area = "local") {
  try {
    area(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento disponível: a funcionalidade segue só em memória.
  }
}

export function removeKey(key: string, kind: Area = "local") {
  try {
    area(kind)?.removeItem(key);
  } catch {
    // ignorado
  }
}

// Latência simulada dos mocks, para que estados de carregamento apareçam como na integração real.
export function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
