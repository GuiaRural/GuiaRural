import { IT_SECTOR, MOCK_ADMINS, MOCK_PASSWORDS, type Admin, type Permission, type Sector } from "../data/mockAdmins";
import { delay } from "../lib/storage";
import { recordChange, snapshot } from "./auditService";

let admins: Admin[] = [...MOCK_ADMINS];
const passwords: Record<string, string> = { ...MOCK_PASSWORDS };

export const INSTITUTIONAL_DOMAIN = "@ufrpe.br";

export function isInstitutionalEmail(email: string) {
  return email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);
}

export async function listAdmins(): Promise<Admin[]> {
  await delay();
  return [...admins];
}

export function findAdminByEmail(email: string): Admin | undefined {
  return admins.find((a) => a.email === email.trim().toLowerCase());
}

// Verificação de senha só existe no mock; no backend real a comparação é feita no servidor.
export function checkPassword(email: string, password: string): boolean {
  return passwords[email.trim().toLowerCase()] === password;
}

export class AdminValidationError extends Error {
  constructor(
    message: string,
    readonly field?: "email",
  ) {
    super(message);
  }
}

export type NewAdmin = {
  name: string;
  email: string;
  sector: Sector;
  permission: Permission;
  password: string;
  sendCredentials: boolean;
};

// authorSector é o setor de quem está cadastrando: ele define o status inicial (RN-UC13.01).
export async function createAdmin(input: NewAdmin, author: string, authorSector: Sector): Promise<Admin> {
  await delay(400);
  const email = input.email.trim().toLowerCase();
  if (!isInstitutionalEmail(email)) {
    throw new AdminValidationError("O e-mail deve pertencer ao domínio institucional @ufrpe.br.", "email");
  }
  if (findAdminByEmail(email)) {
    throw new AdminValidationError("Já existe um administrador com este e-mail.", "email");
  }
  const admin: Admin = {
    id: `a${Date.now()}`,
    name: input.name.trim(),
    email,
    sector: input.sector,
    permission: input.permission,
    // RN-UC13.01: cadastros feitos por um setor diferente da Coordenação de TI aguardam aprovação de um administrador geral.
    status: authorSector === IT_SECTOR ? "ativo" : "aguardando",
  };
  admins = [...admins, admin];
  passwords[email] = input.password;
  recordChange({
    author,
    entity: "Administrador",
    entityId: admin.id,
    entityName: admin.name,
    action: "criado",
    before: null,
    after: snapshot(admin),
  });
  // input.sendCredentials: o envio do e-mail fica a cargo do backend.
  return admin;
}

async function updateStatus(id: string, status: Admin["status"], author: string) {
  await delay();
  const existing = admins.find((a) => a.id === id);
  if (!existing) return;
  const updated = { ...existing, status };
  admins = admins.map((a) => (a.id === id ? updated : a));
  recordChange({
    author,
    entity: "Administrador",
    entityId: id,
    entityName: existing.name,
    action: "editado",
    before: snapshot(existing),
    after: snapshot(updated),
  });
}

export const revokeAdmin = (id: string, author: string) => updateStatus(id, "revogado", author);
export const approveAdmin = (id: string, author: string) => updateStatus(id, "ativo", author);

export function restoreAdmin(id: string, previous: Record<string, unknown> | null) {
  const current = admins.find((a) => a.id === id);
  if (!previous) {
    admins = admins.filter((a) => a.id !== id);
    return;
  }
  const restored = { ...(current ?? {}), ...previous } as Admin;
  admins = current ? admins.map((a) => (a.id === id ? restored : a)) : [...admins, restored];
}
