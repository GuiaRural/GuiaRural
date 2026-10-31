import type { Servico } from "../services/servicosService";

// Serviços fictícios, inspirados nos protótipos de tela, só enquanto o backend não guarda todos os
// campos do formulário. Não representam informações oficiais da UFRPE.
export const MOCK_SERVICOS: Servico[] = [
  {
    id: 1,
    category: "Documentos estudantis",
    name: "Carteira de Estudante (DCE / UNE)",
    sector: "DCE",
    description: "Identificação estudantil nacional oficial.",
    steps: ["Separe os documentos necessários.", "Faça a solicitação no portal ou na sede do DCE.", "Retire a carteira quando ela ficar pronta."],
    requirements: "Declaração de vínculo atualizada, documento de identidade com foto e foto 3x4 digitalizada.",
    deadline: "Até 10 dias úteis após a solicitação",
    active: true,
  },
  {
    id: 2,
    category: "Transporte",
    name: "VEM Passe Livre Estudantil",
    sector: "Região Metropolitana do Recife",
    description: "Passe livre no transporte público para estudantes que cumprem os critérios do programa.",
    steps: ["Confira se você cumpre os critérios do programa.", "Faça o cadastro pelo canal oficial do programa."],
    requirements: "Comprovante de matrícula e carga horária presencial mínima no semestre.",
    active: true,
  },
];
