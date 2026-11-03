import type { Aviso } from "../services/avisosService";

// Avisos fictícios (os do protótipo do UC18), só enquanto o backend de avisos não está disponível.
export const MOCK_AVISOS: Aviso[] = [
  {
    id: 1,
    nome: "Manutenção programada no sistema acadêmico",
    descricao: "Indisponibilidade prevista no sábado, das 8h às 11h, para manutenção programada.",
    data: "2026-09-24T09:00:00",
  },
  {
    id: 2,
    nome: "Atualização dos horários da biblioteca",
    descricao: "A biblioteca funcionará em horário reduzido durante essa semana.",
    data: "2026-09-18T09:00:00",
  },
  {
    id: 3,
    nome: "Inscrições abertas para atividades esportivas",
    descricao: "As inscrições para atividades esportivas estão abertas no portal até 30 de setembro.",
    data: "2026-09-10T09:00:00",
  },
];
