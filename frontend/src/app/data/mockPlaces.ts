import type { Point } from "../lib/geo";

export const PLACE_CATEGORIES = [
  "departamento",
  "administrativo",
  "biblioteca",
  "alimentacao",
  "sala",
  "portaria",
  "saude",
  "auditorio",
  "esporte",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const ACCESSIBILITY_FEATURES = ["rampa", "elevador", "piso_tatil", "banheiro", "vaga"] as const;
export type AccessibilityFeature = (typeof ACCESSIBILITY_FEATURES)[number];

// publicado: visível no mapa e na busca; rascunho e inativo: só na área do administrador (RN-UC14.02).
export type PlaceStatus = "publicado" | "rascunho" | "inativo";

export type PlaceService = { name: string; hours: string; description: string };

export type Place = {
  id: string;
  name: string;
  shortName: string;
  category: PlaceCategory;
  status: PlaceStatus;
  // Posição no plano do mapa mock; null enquanto o local não for georreferenciado.
  position: Point | null;
  address: string;
  hours: string;
  accessibility: AccessibilityFeature[];
  description: string;
  center?: string;
  sigaCode?: string;
  foundedYear?: string;
  mecGrade?: string;
  researchGroups?: string;
  transport?: string;
  courseIds: string[];
  phone?: string;
  email?: string;
  officeHours?: string;
  head?: string;
  services: PlaceService[];
  photoDataUrl?: string;
};

// Dados fictícios até a integração com a API (Spring Boot). Não representam o catálogo oficial.
export const MOCK_PLACES: Place[] = [
  {
    id: "reitoria",
    name: "Prédio Central (Reitoria)",
    shortName: "Reitoria",
    category: "administrativo",
    status: "publicado",
    position: { x: 470, y: 300 },
    address: "Rua Dom Manoel de Medeiros, s/n — Dois Irmãos",
    hours: "07:00-18:00",
    accessibility: ["rampa", "elevador"],
    description:
      "Sede administrativa principal da UFRPE, abrigando o Gabinete do Reitor, Pró-Reitorias (PROAC, PROGEST, PROGEPE) e o Protocolo Geral.",
    center: "Administração Central",
    phone: "(81) 3320-6000",
    email: "protocolo@ufrpe.br",
    officeHours: "Segunda a sexta, 08h às 17h",
    courseIds: [],
    services: [
      { name: "Protocolo Geral", hours: "08:00-17:00", description: "Abertura e acompanhamento de processos." },
      { name: "PROAC", hours: "08:00-17:00", description: "Pró-Reitoria de Assuntos Comunitários." },
    ],
  },
  {
    id: "biblioteca",
    name: "Biblioteca Central Pe. Jaime Diniz",
    shortName: "Biblioteca",
    category: "biblioteca",
    status: "publicado",
    position: { x: 360, y: 200 },
    address: "Alameda da Biblioteca — próximo ao Prédio Central",
    hours: "08:00-20:00",
    accessibility: ["rampa", "piso_tatil", "banheiro"],
    description: "Acervo geral, salas de estudo em grupo e acesso a periódicos científicos.",
    phone: "(81) 3320-6100",
    email: "biblioteca@ufrpe.br",
    officeHours: "Segunda a sexta, 08h às 20h",
    courseIds: [],
    services: [
      { name: "Empréstimo de livros", hours: "08:00-20:00", description: "Mediante cadastro com matrícula." },
      { name: "Salas de estudo em grupo", hours: "08:00-20:00", description: "Reserva no balcão de atendimento." },
    ],
  },
  {
    id: "ceagri-1",
    name: "CEAGRI I",
    shortName: "CEAGRI I",
    category: "sala",
    status: "publicado",
    position: { x: 610, y: 230 },
    address: "Alameda central do campus",
    hours: "07:00-22:00",
    accessibility: ["rampa"],
    description: "Pavilhão de aulas teóricas compartilhado por diversos cursos de graduação.",
    courseIds: [],
    services: [],
  },
  {
    id: "dc",
    name: "Departamento de Computação",
    shortName: "DC",
    category: "departamento",
    status: "publicado",
    position: { x: 720, y: 400 },
    address: "Campus Dois Irmãos — bloco do DC",
    hours: "07:00-22:00",
    accessibility: ["rampa", "banheiro"],
    description:
      "Departamento responsável pelos cursos de Ciência da Computação e Sistemas de Informação, com laboratórios de ensino e pesquisa.",
    center: "Departamento de Computação",
    foundedYear: "1998",
    researchGroups: "12 grupos ativos",
    phone: "(81) 3320-6490",
    email: "secretaria.dc@ufrpe.br",
    officeHours: "Segunda a sexta, 08h às 12h e 13h às 21h",
    courseIds: ["bcc", "bsi"],
    services: [{ name: "Secretaria do DC", hours: "08:00-12:00, 13:00-21:00", description: "Atendimento a alunos." }],
  },
  {
    id: "agronomia",
    name: "Departamento de Agronomia",
    shortName: "DEPA",
    category: "departamento",
    status: "publicado",
    position: { x: 230, y: 420 },
    address: "Campus Dois Irmãos — área de Agronomia",
    hours: "07:00-18:00",
    accessibility: ["rampa"],
    description: "Ensino, pesquisa e extensão em ciências agrárias, com áreas experimentais de campo.",
    courseIds: ["agronomia"],
    services: [],
  },
  {
    id: "medvet",
    name: "Departamento de Medicina Veterinária",
    shortName: "DMV",
    category: "departamento",
    status: "publicado",
    position: { x: 830, y: 220 },
    address: "Campus Dois Irmãos — área de Veterinária",
    hours: "07:00-18:00",
    accessibility: ["rampa", "banheiro"],
    description: "Departamento do curso de Medicina Veterinária, vizinho ao Hospital Veterinário.",
    courseIds: ["medvet"],
    services: [],
  },
  {
    id: "ru",
    name: "Restaurante Universitário",
    shortName: "RU",
    category: "alimentacao",
    status: "publicado",
    position: { x: 330, y: 500 },
    address: "Próximo à quadra poliesportiva",
    hours: "11:00-14:00, 17:30-19:30",
    accessibility: ["rampa", "banheiro", "piso_tatil"],
    description: "Refeições subsidiadas para estudantes, servidores e visitantes. Cardápio publicado semanalmente.",
    courseIds: [],
    services: [{ name: "Almoço e jantar", hours: "11:00-14:00, 17:30-19:30", description: "Veja o cardápio da semana." }],
  },
  {
    id: "hovet",
    name: "Hospital Veterinário",
    shortName: "HOVET",
    category: "saude",
    status: "publicado",
    position: { x: 840, y: 540 },
    address: "Campus Dois Irmãos — área de Veterinária",
    hours: "08:00-17:00",
    accessibility: ["rampa", "vaga"],
    description: "Atendimento clínico e cirúrgico de animais, vinculado ao ensino de Medicina Veterinária.",
    courseIds: [],
    services: [],
  },
  {
    id: "dzo",
    name: "Departamento de Zootecnia",
    shortName: "DZO",
    category: "departamento",
    status: "publicado",
    position: { x: 560, y: 560 },
    address: "Campus Dois Irmãos",
    hours: "07:00-18:00",
    accessibility: [],
    description: "Departamento do curso de Zootecnia.",
    courseIds: ["zootecnia"],
    services: [],
  },
  {
    id: "portaria-principal",
    name: "Portaria Principal (Av. Dom Manoel de Medeiros)",
    shortName: "Portaria 1",
    category: "portaria",
    status: "publicado",
    position: { x: 90, y: 630 },
    address: "Rua Dom Manoel de Medeiros",
    hours: "00:00-23:59",
    accessibility: ["rampa", "piso_tatil"],
    description: "Entrada principal do campus, com parada de ônibus em frente.",
    courseIds: [],
    services: [],
  },
  {
    id: "portaria-dois-irmaos",
    name: "Portaria Dois Irmãos",
    shortName: "Portaria 2",
    category: "portaria",
    status: "publicado",
    position: { x: 940, y: 650 },
    address: "Lado do Parque Dois Irmãos",
    hours: "06:00-22:00",
    accessibility: ["rampa"],
    description: "Entrada secundária, próxima à área de Veterinária.",
    courseIds: [],
    services: [],
  },
  {
    id: "auditorio-novo",
    name: "Auditório Multiuso",
    shortName: "Auditório",
    category: "auditorio",
    status: "rascunho",
    position: null,
    address: "",
    hours: "08:00-22:00",
    accessibility: ["rampa"],
    description: "Cadastro em andamento.",
    courseIds: [],
    services: [],
  },
];

export const MOCK_RECENT_IDS = ["reitoria", "ceagri-1", "biblioteca", "dc"];

// Origem padrão para distância e tempo exibidos no cartão do local (RN-UC02.01).
export const DEFAULT_ORIGIN_ID = "portaria-principal";
