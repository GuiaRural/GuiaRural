// Mesmos campos do backend (/api/avisos: nome, descricao, data), com nomes em inglês como o resto do frontend.
export type Notice = {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO, definido pelo servidor ao criar
};

function daysAgo(d: number) {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

export const MOCK_NOTICES: Notice[] = [
  {
    id: "n1",
    title: "Matrícula do semestre 2026.2",
    description: "O período de ajuste de matrícula vai até sexta-feira. Dúvidas devem ser enviadas à coordenação do seu curso pelo SIGAA.",
    createdAt: daysAgo(1),
  },
  {
    id: "n2",
    title: "RU com horário reduzido no feriado",
    description: "Na próxima segunda-feira o Restaurante Universitário servirá apenas almoço, das 11h às 13h30.",
    createdAt: daysAgo(3),
  },
  {
    id: "n3",
    title: "Interdição parcial da alameda da Biblioteca",
    description: "Obras de drenagem bloqueiam o trecho entre a Biblioteca Central e o Prédio Central. Use o caminho pelo RU.",
    createdAt: daysAgo(6),
  },
];
