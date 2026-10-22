export type AuditEntity = "Local" | "Serviço" | "Cardápio" | "Administrador";
export type AuditAction = "criado" | "editado" | "deletado" | "restaurado";

export type AuditLog = {
  id: string;
  at: string; // ISO
  author: string;
  entity: AuditEntity;
  entityId: string;
  entityName: string;
  action: AuditAction;
  // Snapshots (Memento) do registro antes e depois da mudança; null quando não existia/deixou de existir.
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
};

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "l1",
    at: hoursAgo(2),
    author: "Nutrição / RU",
    entity: "Cardápio",
    entityId: "m2",
    entityName: "Cardápio — jantar de hoje",
    action: "editado",
    before: { main: "Carne de sol acebolada", dessert: "Doce de leite" },
    after: { main: "Carne moída com legumes", dessert: "Doce de leite" },
  },
  {
    id: "l2",
    at: hoursAgo(26),
    author: "Coordenação de TI",
    entity: "Local",
    entityId: "biblioteca",
    entityName: "Biblioteca Central Pe. Jaime Diniz",
    action: "editado",
    before: { hours: "08:00-18:00" },
    after: { hours: "08:00-20:00" },
  },
  {
    id: "l3",
    at: hoursAgo(50),
    author: "Equipe de Comunicação",
    entity: "Serviço",
    entityId: "s-reprografia",
    entityName: "Reprografia do CEAGRI",
    action: "deletado",
    before: { name: "Reprografia do CEAGRI", hours: "08:00-17:00" },
    after: null,
  },
];
