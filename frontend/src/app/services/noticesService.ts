import { MOCK_NOTICES, type Notice } from "../data/mockNotices";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

// Mock de /api/avisos (AvisoController): trocar por fetch mantendo as assinaturas.
let notices: Notice[] = [...MOCK_NOTICES];

export type NoticeInput = Pick<Notice, "title" | "description">;

export class NoticeValidationError extends Error {
  constructor(
    message: string,
    readonly fields: (keyof NoticeInput)[],
  ) {
    super(message);
  }
}

function validate(input: NoticeInput) {
  // Mesmas regras do AvisoRequestDTO: nome e descrição obrigatórios.
  const missing = (["title", "description"] as const).filter((f) => !input[f].trim());
  if (missing.length) throw new NoticeValidationError("Preencha o título e a descrição do aviso.", missing);
}

export async function listNotices(): Promise<Notice[]> {
  await delay();
  return [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createNotice(input: NoticeInput, author: string): Promise<Notice> {
  await delay(400);
  validate(input);
  const notice: Notice = { id: `n${Date.now()}`, title: input.title.trim(), description: input.description.trim(), createdAt: new Date().toISOString() };
  notices = [notice, ...notices];
  recordChange({ author, entity: "Aviso", entityId: notice.id, entityName: notice.title, action: "criado", before: null, after: snapshot(notice) });
  return notice;
}

export async function updateNotice(id: string, input: NoticeInput, author: string): Promise<Notice> {
  await delay(400);
  validate(input);
  const current = notices.find((n) => n.id === id);
  if (!current) throw new Error("Aviso não encontrado.");
  // A data de criação não muda na edição (updatable = false no backend).
  const updated: Notice = { ...current, title: input.title.trim(), description: input.description.trim() };
  notices = notices.map((n) => (n.id === id ? updated : n));
  recordChange({ author, entity: "Aviso", entityId: id, entityName: updated.title, action: "editado", before: snapshot(current), after: snapshot(updated) });
  return updated;
}

export async function deleteNotice(id: string, author: string): Promise<void> {
  await delay(300);
  const current = notices.find((n) => n.id === id);
  if (!current) return;
  notices = notices.filter((n) => n.id !== id);
  recordChange({ author, entity: "Aviso", entityId: id, entityName: current.title, action: "deletado", before: snapshot(current), after: null });
}

export function restoreNotice(id: string, previous: Record<string, unknown> | null) {
  if (!previous) {
    notices = notices.filter((n) => n.id !== id);
    return;
  }
  const restored = previous as Notice;
  notices = notices.some((n) => n.id === id) ? notices.map((n) => (n.id === id ? restored : n)) : [...notices, restored];
}
