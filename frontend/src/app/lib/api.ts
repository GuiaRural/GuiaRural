export class ApiError extends Error {
  constructor(
    readonly status: number,
    // Texto do ProblemDetail do backend (ex.: "Seção inválida: x"), quando houver.
    readonly detail?: string,
    // Motivo estruturado (login: domain | invalid | blocked | rate_limited).
    readonly reason?: string,
    // Erros de validação por campo (400): { campo: mensagem }.
    readonly fields?: Record<string, string>,
  ) {
    super(`HTTP ${status}`);
  }
}

// Disparado quando o servidor responde 401: a sessão do painel acabou (ou nunca existiu).
export const SESSION_EXPIRED_EVENT = "guiarural:session-expired";

// O backend manda o token CSRF num cookie legível (XSRF-TOKEN); toda escrita o devolve no cabeçalho X-XSRF-TOKEN.
function csrfToken(): string | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function problemOf(response: Response): Promise<{ detail?: string; reason?: string; fields?: Record<string, string> }> {
  try {
    const body = (await response.json()) as { detail?: unknown; reason?: unknown; fields?: unknown };
    const fields = body.fields && typeof body.fields === "object" ? (body.fields as Record<string, string>) : undefined;
    return {
      detail: typeof body.detail === "string" ? body.detail : undefined,
      reason: typeof body.reason === "string" ? body.reason : undefined,
      fields,
    };
  } catch {
    return {};
  }
}

// O navegador chama /api/..., e o Next repassa ao backend (rewrite em next.config.ts). O cookie de sessão
// HttpOnly vai junto sozinho (mesma origem): o JavaScript nunca o vê.
async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const token = csrfToken();
    if (token) headers["X-XSRF-TOKEN"] = token;
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: "same-origin",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    // 401 no login é senha errada, não sessão expirada.
    if (response.status === 401 && path !== "/auth/login" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const { detail, reason, fields } = await problemOf(response);
    throw new ApiError(response.status, detail, reason, fields);
  }
  // 204 (excluir, logout) não tem corpo.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body: unknown) => request<T>("POST", path, body);
export const apiPut = <T>(path: string, body: unknown) => request<T>("PUT", path, body);

// Sucesso no DELETE é 204, sem corpo para ler.
export const apiDelete = (path: string) => request<void>("DELETE", path);

// O backend responde 400 para um id que não é número e 404 para um que não existe: para a tela, ambos são "não encontrado".
export function isNotFound(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 400);
}
