import type { LatLng } from "../lib/geo";

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
  "moradia",
  "apoio",
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
  // Coordenadas no mapa; null enquanto o local não for georreferenciado.
  position: LatLng | null;
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
    // OSM way 609985167 (edifício "Universidade Federal Rural de Pernambuco", colado no RU). Identificado como Prédio Central por proximidade com o RU e pelo porte; confirmar em campo.
    position: { lat: -8.014509, lng: -34.950554 },
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
    // OSM relation 8058581 (Biblioteca Central).
    position: { lat: -8.013578, lng: -34.948759 },
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
    // OSM way 258990181 (Prof. Rildo Sartori, CEAGRI I).
    position: { lat: -8.017816, lng: -34.944261 },
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
    // APROXIMADA, NÃO VERIFICADA: o OSM não nomeia o prédio do DC; ponto num prédio do complexo CEAGRI (OSM way 551272692). Corrigir pelo painel admin.
    position: { lat: -8.016980, lng: -34.944780 },
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
    // PROVÁVEL: prédio "Fitossanidade" (OSM way 551272669); o docx de prédios cita laboratórios de solos e fitossanidade na Agronomia. Confirmar.
    position: { lat: -8.016422, lng: -34.944698 },
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
    // APROXIMADA, NÃO VERIFICADA: prédio sem nome ao lado do Hospital Veterinário (OSM way 249468908). Corrigir pelo painel admin.
    position: { lat: -8.014978, lng: -34.948088 },
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
    // OSM way 681756785 (Restaurante Universitário).
    position: { lat: -8.014052, lng: -34.951108 },
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
    // OSM way 249468549 (Hospital Veterinário UFRPE).
    position: { lat: -8.014845, lng: -34.948780 },
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
    // OSM way 542744089 (nomeado "Departamento de Zootecnologia da UFRPE").
    position: { lat: -8.020248, lng: -34.953995 },
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
    // OSM node 9172032456 (portão "Z-3", junto ao ponto de ônibus UFRPE na Rua Manuel de Medeiros).
    position: { lat: -8.016542, lng: -34.950887 },
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
    // PROVÁVEL: portão "Z-4" (OSM node 8942620279), lado leste, junto ao Parque Dois Irmãos. Confirmar.
    position: { lat: -8.016355, lng: -34.945249 },
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
// É o slug do Prédio Central (Reitoria) no banco; a portaria não consta nos documentos de coordenadas.
export const DEFAULT_ORIGIN_ID = "reitoria";
