// Um intervalo de funcionamento. `days` usa 0 = domingo … 6 = sábado (como Date.getDay());
// horários em "HH:MM", no fuso de Recife. Vários intervalos permitem casos como almoço e jantar.
export type OpeningInterval = {
  days: number[];
  opens: string;
  closes: string;
};

export type Place = {
  id: string;
  name: string;
  category: "administrativo" | "departamento" | "alimentacao" | "biblioteca" | "saude";
  // Etiqueta curta exibida sobre a foto do card (ex.: "REITORIA • PRÉDIO CENTRAL").
  tag: string;
  address: string;
  // Ausente enquanto não houver coordenadas confirmadas: o local não aparece como marcador.
  coords?: { lat: number; lng: number };
  // Opcional até as fotos serem adicionadas ao projeto; sem foto, o card usa fundo azul-marinho.
  image?: { src: string; alt: string };
  description: string;
  // Lista vazia = sem horário cadastrado; o card não mostra "aberto/fechado".
  hours: OpeningInterval[];
  // Referência textual de como chegar (ex.: "ao lado da Biblioteca"), como `locationReference` no backend.
  reference?: string;
  services?: string[];
};

const WEEKDAYS = [1, 2, 3, 4, 5];
const CAMPUS_ADDRESS = "Campus Universitário Dois Irmãos, Sede";

// Dados fictícios até a integração com a API (Spring Boot). Não representam o catálogo oficial.
// Coords marcadas "OSM" vêm do centro do prédio no OpenStreetMap (2026-10-29; dados colaborativos, não
// oficiais). As marcadas "PROVISÓRIA" são pontos ilustrativos dentro de CAMPUS_BOUNDS só para os
// marcadores aparecerem. Não são a posição real dos prédios; substituir por coordenadas verificadas.
export const MOCK_PLACES: Place[] = [
  {
    id: "reitoria",
    name: "Prédio Central (Reitoria)",
    category: "administrativo",
    tag: "Reitoria • Prédio Central",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.0176, lng: -34.9496 }, // PROVISÓRIA
    description: "Sede da administração central da universidade, onde ficam a Reitoria e as pró-reitorias.",
    hours: [{ days: WEEKDAYS, opens: "07:00", closes: "18:00" }],
    reference: "Próximo à entrada principal do campus.",
    services: ["Protocolo geral", "Pró-reitorias"],
  },
  {
    id: "ceagri-1",
    name: "CEAGRI I",
    category: "departamento",
    tag: "Salas de aula • CEAGRI I",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01782, lng: -34.94426 }, // OSM: "Professor Rildo Sartori (CEAGRI I)"
    description: "Bloco de salas de aula usado por diversos cursos de graduação.",
    hours: [{ days: WEEKDAYS, opens: "07:00", closes: "22:00" }],
    services: ["Salas de aula", "Banheiros"],
  },
  {
    id: "biblioteca",
    name: "Biblioteca Central",
    category: "biblioteca",
    tag: "Biblioteca • Acervo central",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01358, lng: -34.94876 }, // OSM: "Biblioteca Central"
    description: "Acervo central da universidade, com espaços de estudo individual e em grupo.",
    hours: [{ days: WEEKDAYS, opens: "08:00", closes: "21:00" }],
    services: ["Empréstimo de livros", "Salas de estudo", "Wi-Fi"],
  },
  {
    id: "dc",
    name: "Departamento de Computação",
    category: "departamento",
    tag: "Departamento • Computação",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01782, lng: -34.94392 }, // PROVISÓRIA: colado ao CEAGRI I, segundo a equipe
    description: "Departamento responsável pelos cursos da área de computação.",
    hours: [{ days: WEEKDAYS, opens: "08:00", closes: "18:00" }],
    services: ["Secretaria", "Laboratórios"],
  },
  {
    id: "zootecnia",
    name: "Departamento de Zootecnia",
    category: "departamento",
    tag: "Departamento • Zootecnia",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.02025, lng: -34.95399 }, // OSM: "Departamento de Zootecnologia da UFRPE"
    description: "Departamento responsável pelo curso de Zootecnia.",
    hours: [{ days: WEEKDAYS, opens: "08:00", closes: "17:00" }],
    services: ["Secretaria"],
  },
  {
    id: "medvet",
    name: "Departamento de Medicina Veterinária",
    category: "departamento",
    tag: "Departamento • Medicina Veterinária",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01484, lng: -34.94844 }, // PROVISÓRIA: colado ao Hospital Veterinário, segundo a equipe
    description: "Departamento responsável pelo curso de Medicina Veterinária.",
    hours: [{ days: WEEKDAYS, opens: "08:00", closes: "17:00" }],
    services: ["Secretaria"],
  },
  {
    id: "ru",
    name: "Restaurante Universitário",
    category: "alimentacao",
    tag: "Alimentação • RU",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01405, lng: -34.95111 }, // OSM: "Restaurante Universitário"
    description: "Restaurante que serve refeições a preços subsidiados para a comunidade acadêmica.",
    hours: [
      { days: WEEKDAYS, opens: "11:00", closes: "14:00" },
      { days: WEEKDAYS, opens: "17:00", closes: "19:30" },
    ],
    services: ["Almoço", "Jantar"],
  },
  {
    id: "hovet",
    name: "Hospital Veterinário",
    category: "saude",
    tag: "Saúde • Hospital-escola",
    address: CAMPUS_ADDRESS,
    coords: { lat: -8.01484, lng: -34.94878 }, // OSM: "Hospital Veterinário UFRPE"
    description: "Hospital-escola que atende animais e apoia as aulas práticas de Medicina Veterinária.",
    hours: [{ days: WEEKDAYS, opens: "08:00", closes: "17:00" }],
    services: ["Atendimento clínico", "Cirurgia"],
  },
];

export const MOCK_RECENT_IDS = ["reitoria", "ceagri-1", "biblioteca", "dc"];
