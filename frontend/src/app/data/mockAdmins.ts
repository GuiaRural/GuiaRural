export const SECTORS = [
  "Coordenação de TI",
  "Comunicação",
  "Biblioteca",
  "Nutrição / RU",
  "Departamento de Computação",
  "Pró-Reitoria de Assuntos Comunitários",
] as const;
export type Sector = (typeof SECTORS)[number];

// Setor cujos cadastros não precisam de aprovação (RN-UC13.01).
export const IT_SECTOR: Sector = "Coordenação de TI";

export const PERMISSIONS = {
  geral: "Administrador geral",
  editor: "Editor do setor",
  leitura: "Somente leitura",
} as const;
export type Permission = keyof typeof PERMISSIONS;

export type AdminStatus = "ativo" | "aguardando" | "revogado";

export type Admin = {
  id: string;
  name: string;
  email: string;
  sector: Sector;
  permission: Permission;
  status: AdminStatus;
};

// Contas fictícias, só enquanto não há backend de autenticação.
export const MOCK_ADMINS: Admin[] = [
  { id: "a1", name: "Coordenação de TI", email: "coord.ti@ufrpe.br", sector: "Coordenação de TI", permission: "geral", status: "ativo" },
  { id: "a2", name: "Equipe de Comunicação", email: "comunicacao@ufrpe.br", sector: "Comunicação", permission: "editor", status: "ativo" },
  { id: "a3", name: "Biblioteca Central", email: "biblioteca@ufrpe.br", sector: "Biblioteca", permission: "editor", status: "ativo" },
  { id: "a4", name: "Nutrição / RU", email: "ru@ufrpe.br", sector: "Nutrição / RU", permission: "editor", status: "ativo" },
  { id: "a6", name: "PROAC", email: "proac@ufrpe.br", sector: "Pró-Reitoria de Assuntos Comunitários", permission: "geral", status: "ativo" },
  { id: "a5", name: "Secretaria do DC", email: "secretaria.dc@ufrpe.br", sector: "Departamento de Computação", permission: "editor", status: "aguardando" },
];

// Somente para o ambiente de demonstração sem backend.
export const MOCK_PASSWORDS: Record<string, string> = {
  "coord.ti@ufrpe.br": "guiarural123",
  "comunicacao@ufrpe.br": "guiarural123",
  "biblioteca@ufrpe.br": "guiarural123",
  "ru@ufrpe.br": "guiarural123",
  "secretaria.dc@ufrpe.br": "guiarural123",
  "proac@ufrpe.br": "guiarural123",
};
