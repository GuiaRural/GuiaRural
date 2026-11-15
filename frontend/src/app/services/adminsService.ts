import { ApiError, apiGet, apiPatch, apiPost } from "../lib/api";

// Ponto único de acesso aos administradores do painel (UC13), via /api/admin/admins. O servidor decide o status
// inicial (RN-UC13.01), guarda só o hash da senha e grava o histórico (UC23). Listar exige login; cadastrar,
// aprovar e revogar exigem o perfil "geral".

export const SECTORS = [
  "Coordenação de TI",
  "Comunicação",
  "Biblioteca",
  "Nutrição / RU",
  "Departamento de Computação",
  "Pró-Reitoria de Assuntos Comunitários",
] as const;
export type Sector = (typeof SECTORS)[number];

// Setor cujos cadastros não precisam de aprovação (RN-UC13.01). A regra vale no servidor; aqui só orienta a tela.
export const IT_SECTOR: Sector = "Coordenação de TI";

export const PERMISSIONS = {
  geral: "Administrador geral",
  editor: "Editor do setor",
  leitura: "Somente leitura",
} as const;
export type Permission = keyof typeof PERMISSIONS;

export type AdminStatus = "ativo" | "aguardando" | "revogado";

// Espelha AdminResponseDTO. O setor é texto livre no banco (o primeiro administrador é inserido à mão).
export type Admin = {
  id: number;
  name: string;
  email: string;
  sector: string;
  permission: Permission;
  status: AdminStatus;
};

export type NewAdmin = {
  name: string;
  email: string;
  sector: Sector;
  permission: Permission;
  // Definida por quem cadastra (D3). Só viaja no cadastro; o servidor nunca a devolve.
  password: string;
};

type AdminField = keyof NewAdmin;

export const INSTITUTIONAL_DOMAIN = "@ufrpe.br";

export function isInstitutionalEmail(email: string) {
  return /^[^@\s]+@ufrpe\.br$/.test(email.trim().toLowerCase());
}

export class AdminValidationError extends Error {
  constructor(
    message: string,
    readonly field?: AdminField,
  ) {
    super(message);
  }
}

const FIELDS: AdminField[] = ["name", "email", "sector", "permission", "password"];

export async function listAdmins(): Promise<Admin[]> {
  return apiGet<Admin[]>("/admin/admins");
}

export async function createAdmin(input: NewAdmin): Promise<Admin> {
  const email = input.email.trim().toLowerCase();
  // FE-13.01: conferido antes de chamar a API (o servidor confere de novo).
  if (!isInstitutionalEmail(email)) {
    throw new AdminValidationError("O e-mail deve pertencer ao domínio institucional @ufrpe.br.", "email");
  }
  try {
    return await apiPost<Admin>("/admin/admins", { ...input, name: input.name.trim(), email });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new AdminValidationError(error.detail ?? "Já existe um administrador com este e-mail.", "email");
    }
    if (error instanceof ApiError && error.status === 400) {
      const field = FIELDS.find((f) => error.fields?.[f]);
      const message = (field && error.fields?.[field]) || error.detail || "Confira os dados do cadastro.";
      throw new AdminValidationError(message, field ?? (/e-mail/i.test(message) ? "email" : undefined));
    }
    throw error;
  }
}

// Aprovar e revogar. Erros (403 sem perfil geral, 400 na própria conta, 409 no último geral) chegam como ApiError,
// com a mensagem do servidor em `detail`.
export const approveAdmin = (id: number) => apiPatch<Admin>(`/admin/admins/${id}`, { status: "ativo" });
export const revokeAdmin = (id: number) => apiPatch<Admin>(`/admin/admins/${id}`, { status: "revogado" });
