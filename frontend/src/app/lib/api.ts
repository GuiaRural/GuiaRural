export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

// O navegador chama /api/..., e o Next repassa ao backend (rewrite em next.config.ts).
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new ApiError(response.status);
  return (await response.json()) as T;
}

// O backend responde 400 para um id que não é número e 404 para um que não existe: para a tela, ambos são "não encontrado".
export function isNotFound(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 400);
}
