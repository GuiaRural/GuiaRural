// Português é obrigatório; EN/ES podem faltar e caem no texto em português (FE01 do UC09).
export type Translated = { pt: string; en?: string; es?: string };

export const GUIDE_SECTIONS = ["cultura", "documentos", "calouro", "recife"] as const;
export type GuideSection = (typeof GUIDE_SECTIONS)[number];

export type GuideTopic = {
  id: string;
  section: GuideSection;
  title: Translated;
  summary: Translated;
  body: Translated[];
  links: { label: Translated; url: string }[];
};

// Conteúdo de exemplo até o cadastro real das cartilhas pelo painel administrativo.
export const MOCK_GUIDES: GuideTopic[] = [
  {
    id: "convivencia",
    section: "cultura",
    title: { pt: "Convivência cultural", en: "Cultural coexistence", es: "Convivencia cultural" },
    summary: {
      pt: "Costumes do dia a dia e como se relacionar no campus.",
      en: "Everyday customs and how people interact on campus.",
      es: "Costumbres del día a día y cómo relacionarse en el campus.",
    },
    body: [
      {
        pt: "No Brasil, cumprimentos costumam ser calorosos: aperto de mão, abraço ou beijo no rosto entre conhecidos. Em ambientes acadêmicos, o aperto de mão é o mais comum no primeiro contato.",
        en: "In Brazil, greetings tend to be warm: a handshake, a hug or a kiss on the cheek between acquaintances. In academic settings, a handshake is most common at first contact.",
        es: "En Brasil, los saludos suelen ser cálidos: apretón de manos, abrazo o beso en la mejilla entre conocidos. En el ámbito académico, el apretón de manos es lo más común en el primer contacto.",
      },
      {
        pt: "Professores e servidores geralmente são chamados pelo primeiro nome, precedido de “professor(a)”. Pedir ajuda a colegas é comum e bem recebido.",
        en: "Lecturers and staff are usually addressed by their first name, preceded by “professor”. Asking classmates for help is common and welcome.",
      },
    ],
    links: [{ label: { pt: "Portal da UFRPE", en: "UFRPE website", es: "Portal de la UFRPE" }, url: "https://www.ufrpe.br" }],
  },
  {
    id: "dinamica",
    section: "cultura",
    title: { pt: "Dinâmica universitária", en: "University life", es: "Dinámica universitaria" },
    summary: {
      pt: "Calendário, frequência e como funcionam as disciplinas.",
      en: "Calendar, attendance and how courses work.",
    },
    body: [
      {
        pt: "O ano letivo é dividido em dois semestres. A frequência mínima exigida costuma ser de 75% das aulas de cada disciplina.",
        en: "The academic year is split into two semesters. Minimum attendance is usually 75% of each course's classes.",
      },
      { pt: "Consulte o calendário acadêmico oficial para datas de matrícula, trancamento e provas finais." },
    ],
    links: [],
  },
  {
    id: "cpf",
    section: "documentos",
    title: { pt: "CPF", en: "CPF (Brazilian taxpayer ID)", es: "CPF" },
    summary: {
      pt: "Documento necessário para abrir conta, assinar contratos e usar serviços.",
      en: "Required to open a bank account, sign contracts and use services.",
      es: "Necesario para abrir una cuenta, firmar contratos y usar servicios.",
    },
    body: [
      {
        pt: "O CPF é emitido pela Receita Federal e pode ser solicitado por estrangeiros. Leve passaporte e comprovante de endereço ao atendimento.",
        en: "The CPF is issued by the Federal Revenue Service and foreigners may apply. Bring your passport and proof of address.",
        es: "El CPF lo emite la Receita Federal y los extranjeros pueden solicitarlo. Lleve pasaporte y comprobante de domicilio.",
      },
    ],
    links: [{ label: { pt: "Receita Federal — CPF", en: "Federal Revenue — CPF", es: "Receita Federal — CPF" }, url: "https://www.gov.br/receitafederal" }],
  },
  {
    id: "visto",
    section: "documentos",
    title: { pt: "Visto e registro migratório", en: "Visa and migration registration", es: "Visa y registro migratorio" },
    summary: {
      pt: "Prazos para registro na Polícia Federal após a chegada.",
      en: "Deadlines to register with the Federal Police after arrival.",
    },
    body: [
      {
        pt: "Estudantes com visto temporário devem fazer o registro migratório na Polícia Federal dentro do prazo indicado no visto. Confira a documentação exigida antes de agendar.",
        en: "Students on a temporary visa must complete migration registration with the Federal Police within the deadline stated on the visa. Check the required documents before booking.",
      },
    ],
    links: [{ label: { pt: "Polícia Federal — Imigração", en: "Federal Police — Immigration" }, url: "https://www.gov.br/pf" }],
  },
  {
    id: "editais",
    section: "documentos",
    title: { pt: "Editais de mobilidade", en: "Mobility calls", es: "Convocatorias de movilidad" },
    summary: { pt: "Onde acompanhar editais de intercâmbio e bolsas." },
    body: [{ pt: "Os editais de mobilidade acadêmica são publicados no portal da UFRPE. Fique atento aos prazos de inscrição." }],
    links: [{ label: { pt: "Portal da UFRPE" }, url: "https://www.ufrpe.br" }],
  },
  {
    id: "primeira-semana",
    section: "calouro",
    title: { pt: "Primeira semana", en: "First week", es: "Primera semana" },
    summary: {
      pt: "O que fazer assim que chegar ao campus.",
      en: "What to do as soon as you arrive on campus.",
      es: "Qué hacer en cuanto llegues al campus.",
    },
    body: [
      {
        pt: "Localize o seu departamento, a Biblioteca Central e o Restaurante Universitário pelo mapa. Confirme sua matrícula e horários na coordenação do curso.",
        en: "Find your department, the Central Library and the University Restaurant on the map. Confirm your enrollment and timetable with your program office.",
        es: "Ubica tu departamento, la Biblioteca Central y el Restaurante Universitario en el mapa. Confirma tu matrícula y horarios en la coordinación del curso.",
      },
    ],
    links: [],
  },
  {
    id: "assistencia",
    section: "calouro",
    title: { pt: "Assistência estudantil", en: "Student support" },
    summary: { pt: "Auxílios, RU e apoio psicossocial.", en: "Grants, canteen and psychosocial support." },
    body: [{ pt: "A Pró-Reitoria de Assuntos Comunitários (PROAC), no Prédio Central, orienta sobre auxílios e programas de apoio." }],
    links: [],
  },
  {
    id: "transporte",
    section: "recife",
    title: { pt: "Transporte público", en: "Public transport", es: "Transporte público" },
    summary: {
      pt: "Ônibus e integração para chegar ao campus.",
      en: "Buses and transfers to reach campus.",
      es: "Autobuses e integración para llegar al campus.",
    },
    body: [
      {
        pt: "Há paradas de ônibus em frente à Portaria Principal. O pagamento pode ser feito com cartão de transporte; estudantes podem solicitar meia-passagem.",
        en: "There are bus stops in front of the Main Gate. Fares can be paid with a transit card; students may apply for a half-fare card.",
        es: "Hay paradas de autobús frente a la Portería Principal. Se puede pagar con tarjeta de transporte; los estudiantes pueden solicitar medio pasaje.",
      },
    ],
    links: [],
  },
  {
    id: "seguranca",
    section: "recife",
    title: { pt: "Segurança e dicas da cidade", en: "Safety and city tips" },
    summary: { pt: "Cuidados básicos no dia a dia em Recife." },
    body: [{ pt: "Prefira circular por áreas movimentadas à noite e evite exibir objetos de valor no transporte público." }],
    links: [],
  },
];
