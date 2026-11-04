// Português é obrigatório; EN/ES podem faltar e caem no texto em português (FE01 do UC09).
// Conteúdo baseado na Cartilha de Acolhimento (NINTER/PRPG), no Guia do Estudante Internacional
// (Mobilidade IN) e no Guia de Mobilidade OUT da UFRPE, até o cadastro real pelo painel administrativo.
export type Translated = { pt: string; en?: string; es?: string };

export const GUIDE_SECTIONS = ["cultura", "documentos", "calouro", "recife"] as const;
export type GuideSection = (typeof GUIDE_SECTIONS)[number];

// Etapa da jornada do estudante internacional, usada na linha do tempo de documentos.
export type GuideStage = "antes" | "chegada" | "primeiras-semanas" | "mobilidade";

export type GuideBlock =
  | { type: "heading"; text: Translated }
  | { type: "p"; text: Translated }
  | { type: "list"; items: Translated[] }
  | { type: "steps"; items: { title: Translated; text?: Translated }[] }
  // Lista de documentos que o usuário pode marcar (progresso salvo no navegador).
  | { type: "checklist"; id: string; title: Translated; items: Translated[] }
  | { type: "callout"; tone: "info" | "tip" | "warning"; title?: Translated; text: Translated }
  | { type: "facts"; items: { label: Translated; value: Translated }[] }
  | { type: "video"; title: Translated; credit: string; driveId: string }
  // embed: a pasta precisa ser pública para aparecer dentro da página; senão, só o link é exibido.
  | { type: "gallery"; title: Translated; credit: string; folderId: string; url: string; embed: boolean };

export type GuideLink = { label: Translated; url: string };

export type GuideTopic = {
  id: string;
  section: GuideSection;
  stage?: GuideStage;
  title: Translated;
  summary: Translated;
  blocks: GuideBlock[];
  links: GuideLink[];
  // Local do campus relacionado, aberto em /locais/[id].
  placeId?: string;
  source: Translated;
};

export type GuideDownload = { label: Translated; language: string; href: string };

export const GUIDE_DOWNLOADS: GuideDownload[] = [
  { label: { pt: "Cartilha de acolhimento", en: "Welcome booklet", es: "Cartilla de acogida" }, language: "PT", href: "/cartilhas/cartilha-acolhimento-pt.pdf" },
  { label: { pt: "Cartilha de acolhimento", en: "Welcome booklet", es: "Cartilla de acogida" }, language: "EN", href: "/cartilhas/cartilha-acolhimento-en.pdf" },
  { label: { pt: "Cartilha de acolhimento", en: "Welcome booklet", es: "Cartilla de acogida" }, language: "FR", href: "/cartilhas/cartilha-acolhimento-fr.pdf" },
  { label: { pt: "Guia de Mobilidade IN", en: "Incoming Mobility Guide", es: "Guía de Movilidad IN" }, language: "PT · EN", href: "https://international.ufrpe.br/mobilidadein" },
  { label: { pt: "Guia de Mobilidade OUT", en: "Outgoing Mobility Guide", es: "Guía de Movilidad OUT" }, language: "PT", href: "https://international.ufrpe.br/mobilidadeout" },
];

export type SupportContact = { label: Translated; value: string; href: string };

export const SUPPORT_CONTACTS: SupportContact[] = [
  { label: { pt: "Núcleo de Internacionalização (NINTER/IPÊ)", en: "Office of International Affairs (NINTER/IPÊ)", es: "Núcleo de Internacionalización (NINTER/IPÊ)" }, value: "international@ufrpe.br", href: "mailto:international@ufrpe.br" },
  { label: { pt: "Mobilidade acadêmica", en: "Academic mobility", es: "Movilidad académica" }, value: "mobilidade.ninter@ufrpe.br", href: "mailto:mobilidade.ninter@ufrpe.br" },
  { label: { pt: "Internacionalização da Pós (PRPG)", en: "Graduate internationalization (PRPG)", es: "Internacionalización del Posgrado (PRPG)" }, value: "cippg.prpg@ufrpe.br", href: "mailto:cippg.prpg@ufrpe.br" },
  { label: { pt: "Telefone", en: "Phone", es: "Teléfono" }, value: "+55 (81) 3320-6010", href: "tel:+558133206010" },
  { label: { pt: "Agendar atendimento", en: "Book an appointment", es: "Agendar atención" }, value: "calendar.app.google", href: "https://calendar.app.google/gSSi7oyk9ffYpZqc7" },
];

export const EMERGENCY_NUMBERS: { label: Translated; number: string }[] = [
  { label: { pt: "Polícia", en: "Police", es: "Policía" }, number: "190" },
  { label: { pt: "Ambulância (SAMU)", en: "Ambulance (SAMU)", es: "Ambulancia (SAMU)" }, number: "192" },
  { label: { pt: "Bombeiros", en: "Fire department", es: "Bomberos" }, number: "193" },
];

const CARTILHA: Translated = { pt: "Cartilha de Acolhimento · NINTER/PRPG UFRPE", en: "Welcome Booklet · NINTER/PRPG UFRPE", es: "Cartilla de Acogida · NINTER/PRPG UFRPE" };
const GUIA_IN: Translated = { pt: "Guia do Estudante Internacional · NINTER/IPÊ", en: "International Student's Guide · NINTER/IPÊ", es: "Guía del Estudiante Internacional · NINTER/IPÊ" };
const GUIA_OUT: Translated = { pt: "Guia de Mobilidade Acadêmica OUT · NINTER/IPÊ", en: "Outgoing Mobility Guide · NINTER/IPÊ", es: "Guía de Movilidad Académica OUT · NINTER/IPÊ" };
const PORTAL_INTERNACIONAL: GuideLink = { label: { pt: "Portal internacional da UFRPE", en: "UFRPE international portal", es: "Portal internacional de la UFRPE" }, url: "https://international.ufrpe.br" };

export const MOCK_GUIDES: GuideTopic[] = [
  // ───────────── Interação cultural ─────────────
  {
    id: "boas-vindas",
    section: "cultura",
    title: { pt: "Bem-vindo(a) à Ruralinda", en: "Welcome to Ruralinda", es: "Bienvenido(a) a la Ruralinda" },
    summary: {
      pt: "Por que esta cartilha existe e o que esperar dos primeiros meses no Brasil.",
      en: "Why this booklet exists and what to expect in your first months in Brazil.",
      es: "Por qué existe esta cartilla y qué esperar de los primeros meses en Brasil.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "Seja muito bem-vindo(a) ao Brasil e à Universidade Federal Rural de Pernambuco (UFRPE), nossa Ruralinda! Esta cartilha foi elaborada para orientá-lo(a) durante seus primeiros meses de estadia no país.",
          en: "Welcome to Brazil and to the Federal Rural University of Pernambuco (UFRPE), our Ruralinda! This booklet was prepared to guide you during your first months in the country.",
          es: "¡Bienvenido(a) a Brasil y a la Universidad Federal Rural de Pernambuco (UFRPE), nuestra Ruralinda! Esta cartilla fue elaborada para orientarte durante tus primeros meses en el país.",
        },
      },
      {
        type: "p",
        text: {
          pt: "O Brasil é um país vasto, diverso e vibrante, mas, como em qualquer lugar do mundo, possui leis e costumes próprios que podem ser diferentes dos do seu país. Nosso objetivo é garantir que sua estadia seja segura, produtiva e repleta de boas trocas culturais.",
          en: "Brazil is a vast, diverse and vibrant country but, like anywhere in the world, it has its own laws and customs that may differ from those of your country. Our goal is to make sure your stay is safe, productive and full of good cultural exchanges.",
          es: "Brasil es un país vasto, diverso y vibrante, pero, como en cualquier lugar del mundo, tiene leyes y costumbres propias que pueden ser diferentes de las de tu país. Nuestro objetivo es que tu estadía sea segura, productiva y llena de buenos intercambios culturales.",
        },
      },
      {
        type: "callout",
        tone: "tip",
        title: { pt: "O choque cultural é normal", en: "Culture shock is normal", es: "El choque cultural es normal" },
        text: {
          pt: "A integração é um processo recompensador. Explore, pergunte, participe dos eventos e permita-se vivenciar o melhor que o Brasil e a universidade têm a oferecer.",
          en: "Integration is a rewarding process. Explore, ask questions, take part in events and allow yourself to experience the best Brazil and the university have to offer.",
          es: "La integración es un proceso gratificante. Explora, pregunta, participa en los eventos y permítete vivir lo mejor que Brasil y la universidad ofrecen.",
        },
      },
    ],
    links: [PORTAL_INTERNACIONAL],
    source: CARTILHA,
  },
  {
    id: "convivencia",
    section: "cultura",
    title: { pt: "Princípios de convivência", en: "Principles of coexistence", es: "Principios de convivencia" },
    summary: {
      pt: "Respeito à diversidade e por que discriminação é crime no Brasil.",
      en: "Respect for diversity and why discrimination is a crime in Brazil.",
      es: "Respeto a la diversidad y por qué la discriminación es delito en Brasil.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "O Brasil é um dos países mais diversos do mundo. Nossa força está na mistura de raças, religiões, culturas e identidades. A base da nossa convivência é a empatia: independentemente de origem, crença ou orientação, todos têm o direito de se sentir seguros e respeitados.",
          en: "Brazil is one of the most diverse countries in the world. Our strength lies in the mix of races, religions, cultures and identities. Empathy is the basis of our coexistence: regardless of origin, belief or orientation, everyone has the right to feel safe and respected.",
        },
      },
      { type: "heading", text: { pt: "É fundamental", en: "It is essential to", es: "Es fundamental" } },
      {
        type: "list",
        items: [
          { pt: "respeitar as diferenças culturais, religiosas e linguísticas;", en: "respect cultural, religious and linguistic differences;" },
          { pt: "evitar comentários preconceituosos ou discriminatórios;", en: "avoid prejudiced or discriminatory remarks;" },
          { pt: "valorizar o diálogo e a convivência pacífica;", en: "value dialogue and peaceful coexistence;" },
          { pt: "tratar todas as pessoas com cordialidade e igualdade.", en: "treat everyone with courtesy and equality." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: { pt: "Discriminação é crime!", en: "Discrimination is a crime!", es: "¡La discriminación es delito!" },
        text: {
          pt: "Racismo e qualquer forma de discriminação baseada em procedência nacional, cor da pele, orientação sexual, etnia ou religião são proibidos por lei e podem gerar consequências acadêmicas e legais. Brincadeiras sobre cor da pele, sotaque ou religião de alguém não são aceitas.",
          en: "Racism and any form of discrimination based on national origin, skin colour, sexual orientation, ethnicity or religion are prohibited by law and may lead to academic and legal consequences. Jokes about someone's skin colour, accent or religion are not accepted.",
        },
      },
    ],
    links: [],
    source: CARTILHA,
  },
  {
    id: "comunicacao",
    section: "cultura",
    title: { pt: "Comunicação e cultura brasileira", en: "Communication and Brazilian culture", es: "Comunicación y cultura brasileña" },
    summary: {
      pt: "Cumprimentos, “jeitinho brasileiro”, convites e pontualidade.",
      en: "Greetings, the “Brazilian way”, invitations and punctuality.",
      es: "Saludos, el “jeitinho brasileño”, invitaciones y puntualidad.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "Os brasileiros valorizam muito o “bom dia”, o “por favor” e o “obrigado”. Esses pequenos gestos abrem portas: cumprimente ao chegar e sair, use “com licença”, respeite filas e espaços compartilhados.",
          en: "Brazilians greatly value “bom dia” (good morning), “por favor” (please) and “obrigado” (thank you). These small gestures open doors: greet people when arriving and leaving, say “com licença” (excuse me), respect queues and shared spaces.",
        },
      },
      {
        type: "facts",
        items: [
          {
            label: { pt: "Cumprimentos", en: "Greetings", es: "Saludos" },
            value: {
              pt: "Aperto de mão, abraço ou beijo no rosto (um ou dois, conforme a região). Se não se sentir confortável, um sorriso e um aceno são sempre bem aceitos.",
              en: "Handshake, hug or kiss on the cheek (one or two, depending on the region). If you're not comfortable, a smile and a wave are always fine.",
            },
          },
          {
            label: { pt: "“Jeitinho brasileiro”", en: "The “Brazilian way”", es: "“Jeitinho brasileño”" },
            value: {
              pt: "No social, é visto como flexibilidade. Em provas, prazos e documentos ele não se aplica: as regras da UFRPE devem ser rigorosamente respeitadas.",
              en: "Socially, it is seen as flexibility. For exams, deadlines and documents it doesn't apply: UFRPE rules must be strictly followed.",
            },
          },
          {
            label: { pt: "Pontualidade", en: "Punctuality", es: "Puntualidad" },
            value: {
              pt: "No meio acadêmico, seja pontual: atrasos em aulas e provas podem não ser tolerados. Em festas, chegar um pouco depois do horário é o padrão.",
              en: "In academic settings, be on time: being late for classes and exams may not be tolerated. At parties, arriving a little late is the norm.",
            },
          },
          {
            label: { pt: "“Vamos marcar!”", en: "“Let's meet up!”", es: "“¡Vamos a quedar!”" },
            value: {
              pt: "Nem sempre é um compromisso agendado — muitas vezes é só um gesto de simpatia.",
              en: "It isn't always a scheduled commitment — often it's just a friendly gesture.",
            },
          },
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: {
          pt: "O idioma oficial do Brasil é o português. Aprender expressões básicas facilita muito sua adaptação — a UFRPE oferece cursos de Português como Língua Estrangeira todo semestre.",
          en: "Brazil's official language is Portuguese. Learning basic expressions makes adapting much easier — UFRPE offers Portuguese as a Foreign Language courses every semester.",
        },
      },
    ],
    links: [],
    source: CARTILHA,
  },
  {
    id: "consentimento",
    section: "cultura",
    title: { pt: "Assédio, consentimento e substâncias", en: "Harassment, consent and substances", es: "Acoso, consentimiento y sustancias" },
    summary: {
      pt: "Limites pessoais, álcool e drogas segundo a lei brasileira.",
      en: "Personal boundaries, alcohol and drugs under Brazilian law.",
      es: "Límites personales, alcohol y drogas según la ley brasileña.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "No Brasil, as interações sociais costumam ser cordiais. É preciso diferenciar um gesto de educação e acolhimento daquilo que representa intimidade ou abertura para ultrapassar limites. Evite comentários, gestos ou abordagens invasivos.",
          en: "In Brazil, social interactions tend to be warm. It's important to tell a gesture of politeness and welcome apart from something that signals intimacy or openness to cross boundaries. Avoid invasive comments, gestures or approaches.",
        },
      },
      {
        type: "callout",
        tone: "warning",
        title: { pt: "“Não” significa “não”", en: "“No” means “no”", es: "“No” significa “no”" },
        text: {
          pt: "Vale para interações físicas e verbais. O assédio sexual ou moral pode levar à expulsão da universidade e a processos criminais.",
          en: "This applies to physical and verbal interactions. Sexual or moral harassment may lead to expulsion from the university and criminal charges.",
        },
      },
      {
        type: "facts",
        items: [
          {
            label: { pt: "Álcool", en: "Alcohol", es: "Alcohol" },
            value: {
              pt: "Permitido apenas para maiores de 18 anos. É proibido dirigir após consumir qualquer quantidade.",
              en: "Allowed only for people aged 18 or over. Driving after drinking any amount is forbidden.",
            },
          },
          {
            label: { pt: "Drogas", en: "Drugs", es: "Drogas" },
            value: {
              pt: "Porte e comercialização de drogas ilícitas são crimes, com consequências acadêmicas, administrativas e legais.",
              en: "Possession and trafficking of illegal drugs are crimes, with academic, administrative and legal consequences.",
            },
          },
        ],
      },
    ],
    links: [],
    source: CARTILHA,
  },
  {
    id: "vida-academica",
    section: "cultura",
    title: { pt: "Convivência acadêmica e moradia", en: "Academic life and shared housing", es: "Convivencia académica y vivienda" },
    summary: {
      pt: "Relação com professores, servidores, colegas e espaços compartilhados.",
      en: "Relationships with professors, staff, classmates and shared spaces.",
      es: "Relación con profesores, servidores, compañeros y espacios compartidos.",
    },
    blocks: [
      { type: "heading", text: { pt: "Na universidade, espera-se", en: "At the university, you are expected to", es: "En la universidad se espera" } },
      {
        type: "list",
        items: [
          { pt: "pontualidade em aulas, reuniões e atividades;", en: "be punctual for classes, meetings and activities;" },
          { pt: "honestidade intelectual, evitando plágio e fraude acadêmica;", en: "be intellectually honest, avoiding plagiarism and academic fraud;" },
          { pt: "uso adequado dos espaços institucionais;", en: "use institutional spaces properly;" },
          { pt: "respeito a professores, colegas, servidores técnico-administrativos e terceirizados.", en: "respect professors, classmates, administrative and outsourced staff." },
        ],
      },
      {
        type: "p",
        text: {
          pt: "A relação com professores costuma ser menos rígida do que em outros países, mas isso não exclui o respeito. Eles geralmente são chamados pelo primeiro nome, precedido de “professor(a)”.",
          en: "Relationships with professors tend to be less formal than in other countries, but respect is still expected. They are usually addressed by first name, preceded by “professor”.",
        },
      },
      { type: "heading", text: { pt: "Em moradias e espaços compartilhados", en: "In shared housing and common spaces", es: "En viviendas y espacios compartidos" } },
      {
        type: "list",
        items: [
          { pt: "respeite horários de silêncio e evite barulhos excessivos;", en: "respect quiet hours and avoid excessive noise;" },
          { pt: "mantenha limpeza e organização e cuide dos bens compartilhados;", en: "keep spaces clean and organised and take care of shared belongings;" },
          { pt: "economize água e energia e faça o descarte adequado do lixo.", en: "save water and energy and dispose of waste properly." },
        ],
      },
    ],
    links: [],
    source: CARTILHA,
  },
  {
    id: "conflitos",
    section: "cultura",
    title: { pt: "Conflitos e onde buscar ajuda", en: "Conflicts and where to get help", es: "Conflictos y dónde buscar ayuda" },
    summary: {
      pt: "Como lidar com situações sensíveis e quais as consequências de condutas inadequadas.",
      en: "How to handle sensitive situations and the consequences of inappropriate conduct.",
      es: "Cómo manejar situaciones sensibles y las consecuencias de conductas inadecuadas.",
    },
    blocks: [
      {
        type: "steps",
        items: [
          {
            title: { pt: "Mantenha a calma", en: "Stay calm", es: "Mantén la calma" },
            text: {
              pt: "O tom de voz alto no Brasil nem sempre significa agressividade; às vezes é apenas entusiasmo. Tente resolver mal-entendidos com uma conversa calma e direta.",
              en: "A raised voice in Brazil doesn't always mean aggression; sometimes it's just enthusiasm. Try to clear up misunderstandings through calm, direct conversation.",
            },
          },
          {
            title: { pt: "Evite discussões ofensivas", en: "Avoid offensive arguments", es: "Evita discusiones ofensivas" },
            text: {
              pt: "Política, religião e futebol podem gerar debates acalorados. É perfeitamente aceitável retirar-se de uma conversa desrespeitosa.",
              en: "Politics, religion and football can lead to heated debates. It's perfectly acceptable to step away from a disrespectful conversation.",
            },
          },
          {
            title: { pt: "Procure mediação", en: "Seek mediation", es: "Busca mediación" },
            text: {
              pt: "Se não conseguir resolver sozinho(a), procure o NINTER, a Coordenação de Internacionalização ou a coordenação do seu curso. Não tente resolver situações graves por conta própria.",
              en: "If you can't solve it on your own, contact NINTER, the Internationalization Coordination or your program coordinator. Don't handle serious situations alone.",
            },
          },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: { pt: "Consequências reais", en: "Real consequences", es: "Consecuencias reales" },
        text: {
          pt: "Plágio, assédio ou vandalismo podem resultar em advertência, suspensão ou expulsão — o que pode invalidar o visto de estudante. Crimes do Código Penal podem levar a multa, prisão e deportação.",
          en: "Plagiarism, harassment or vandalism may lead to warnings, suspension or expulsion — which may invalidate your student visa. Crimes under the Penal Code may lead to fines, imprisonment and deportation.",
        },
      },
      {
        type: "p",
        text: {
          pt: "Você não está sozinho(a)! Em caso de dúvida sobre normas acadêmicas, migratórias ou da vida cotidiana, procure os setores de internacionalização da UFRPE antes de tomar qualquer decisão. Os contatos estão no quadro “Precisa de ajuda?”.",
          en: "You are not alone! If you have questions about academic or immigration rules or everyday life, contact UFRPE's internationalization offices before making any decision. Contacts are in the “Need help?” box.",
        },
      },
    ],
    links: [PORTAL_INTERNACIONAL],
    placeId: "reitoria",
    source: CARTILHA,
  },

  // ───────────── Documentos e editais (FA02) ─────────────
  {
    id: "visto",
    section: "documentos",
    stage: "antes",
    title: { pt: "Visto de estudante (VITEM IV)", en: "Student visa (VITEM IV)", es: "Visa de estudiante (VITEM IV)" },
    summary: {
      pt: "Documentos para pedir o visto no Consulado brasileiro antes de viajar.",
      en: "Documents to apply for the visa at the Brazilian Consulate before travelling.",
      es: "Documentos para solicitar la visa en el Consulado brasileño antes de viajar.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "O VITEM IV é o visto temporário para estrangeiros que vão estudar em instituições reconhecidas pelo MEC. O pedido é feito presencialmente na Repartição Consular brasileira do seu país.",
          en: "VITEM IV is the temporary visa for foreigners who will study at institutions recognised by Brazil's Ministry of Education. You apply in person at the Brazilian Consulate in your country.",
        },
      },
      {
        type: "checklist",
        id: "visto",
        title: { pt: "Leve ao Consulado", en: "Bring to the Consulate", es: "Lleva al Consulado" },
        items: [
          { pt: "Formulário de pedido de visto impresso e assinado", en: "Visa application form, printed and signed" },
          { pt: "Carta de aceitação original da UFRPE", en: "Original UFRPE acceptance letter" },
          { pt: "Passaporte válido por 6 meses ou mais (e comprovante de filiação, se não constar)", en: "Passport valid for 6+ months (plus proof of parentage if not shown)" },
          { pt: "Foto 3x4 recente, de frente, fundo branco", en: "Recent 3x4 photo, front-facing, white background" },
          { pt: "Comprovante de pagamento da taxa consular", en: "Proof of consular fee payment" },
          { pt: "Comprovação de meios de subsistência (bolsa, termo de responsabilidade ou extrato)", en: "Proof of means of support (scholarship, sponsorship letter or bank statement)" },
          { pt: "Certidão de antecedentes criminais emitida há menos de 3 meses", en: "Criminal record certificate issued less than 3 months ago" },
          { pt: "Comprovante de vínculo com a instituição de origem", en: "Proof of enrolment at your home institution" },
          { pt: "Autorização dos pais com firma reconhecida (se menor de idade)", en: "Notarised parental authorisation (if under 18)" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: {
          pt: "A lista pode variar conforme o Consulado do seu país. Confirme diretamente com ele antes de agendar.",
          en: "The list may vary by Consulate. Confirm directly with yours before booking.",
        },
      },
    ],
    links: [{ label: { pt: "Formulário de candidatura do estudante estrangeiro", en: "Exchange student application form" }, url: "https://docs.google.com/forms/d/1CJAgP-p6goCS-R23pYx1e7EBrDXN2D6b4bTJ6P7Tpq8/viewform" }],
    source: GUIA_IN,
  },
  {
    id: "seguro-saude",
    section: "documentos",
    stage: "antes",
    title: { pt: "Seguro saúde", en: "Health insurance", es: "Seguro de salud" },
    summary: {
      pt: "Obrigatório durante toda a permanência no Brasil.",
      en: "Mandatory for your entire stay in Brazil.",
      es: "Obligatorio durante toda la estadía en Brasil.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "O estudante internacional deve ter um seguro saúde válido durante toda a permanência no Brasil. Ele garante atendimento em hospitais particulares, o cumprimento das leis de imigração e evita despesas médicas inesperadas. A lei exige seguro com repatriação funerária para vistos de trânsito, turista e temporário.",
          en: "International students must have valid health insurance for their entire stay in Brazil. It covers private hospitals, ensures compliance with immigration law and avoids unexpected medical costs. The law requires insurance with funeral repatriation for transit, tourist and temporary visas.",
        },
      },
      {
        type: "callout",
        tone: "tip",
        text: {
          pt: "Chegou sem seguro? Será preciso contratar um em uma agência local logo nos primeiros dias.",
          en: "Arrived without insurance? You'll need to buy one from a local agency in your first days.",
        },
      },
    ],
    links: [],
    source: GUIA_IN,
  },
  {
    id: "cpf",
    section: "documentos",
    stage: "antes",
    title: { pt: "CPF", en: "CPF (Brazilian taxpayer ID)", es: "CPF" },
    summary: {
      pt: "Necessário para conta bancária, chip de celular, Wi-Fi e biblioteca. Pode ser tirado ainda no seu país.",
      en: "Needed for a bank account, SIM card, Wi-Fi and the library. You can get it in your home country.",
      es: "Necesario para cuenta bancaria, chip de celular, Wi-Fi y biblioteca. Se puede tramitar en tu país.",
    },
    blocks: [
      {
        type: "facts",
        items: [
          { label: { pt: "Onde", en: "Where", es: "Dónde" }, value: { pt: "Site da Receita Federal + Consulado brasileiro", en: "Federal Revenue website + Brazilian Consulate" } },
          { label: { pt: "Prazo de emissão", en: "Issuing time", es: "Plazo" }, value: { pt: "Até 1 dia útil após a entrega no Consulado", en: "Up to 1 business day after submitting at the Consulate" } },
          { label: { pt: "Custo", en: "Cost", es: "Costo" }, value: { pt: "Gratuito", en: "Free", es: "Gratuito" } },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: { pt: "Preencha o formulário online", en: "Fill in the online form", es: "Completa el formulario en línea" },
            text: {
              pt: "No site da Receita Federal, escolha o país de domicílio, marque “inscrição”, preencha e envie. Imprima o comprovante ou anote o número de protocolo.",
              en: "On the Federal Revenue website, choose your country of residence, select “inscrição” (registration), fill in and submit. Print the receipt or write down the protocol number.",
            },
          },
          {
            title: { pt: "Vá ao Consulado brasileiro", en: "Go to the Brazilian Consulate", es: "Ve al Consulado brasileño" },
            text: {
              pt: "Apresente o protocolo com cópia de um documento que comprove identidade, nacionalidade, naturalidade e data de nascimento. Entre 18 e 70 anos, leve também o documento da Justiça Eleitoral sobre alistamento eleitoral.",
              en: "Present the protocol with a copy of an ID proving identity, nationality, place and date of birth. If aged 18–70, also bring the electoral document regarding voter registration.",
            },
          },
          {
            title: { pt: "Receba o número do CPF", en: "Receive your CPF number", es: "Recibe tu número de CPF" },
            text: {
              pt: "O Consulado processa o pedido e emite o CPF em até um dia útil.",
              en: "The Consulate processes the request and issues the CPF within one business day.",
            },
          },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: { pt: "Dados errados?", en: "Wrong details?", es: "¿Datos incorrectos?" },
        text: {
          pt: "A correção é gratuita no Consulado em até 90 dias. Depois disso, só a Receita Federal no Brasil pode alterar.",
          en: "Corrections are free at the Consulate within 90 days. After that, only the Federal Revenue in Brazil can change them.",
        },
      },
    ],
    links: [{ label: { pt: "Receita Federal — inscrição de CPF para estrangeiros", en: "Federal Revenue — CPF registration for foreigners" }, url: "https://servicos.receita.fazenda.gov.br/Servicos/CPF/InscricaoCpfEstrangeiro/default.asp" }],
    source: GUIA_IN,
  },
  {
    id: "crnm",
    section: "documentos",
    stage: "chegada",
    title: { pt: "Registro migratório (CRNM)", en: "Migration registration (CRNM)", es: "Registro migratorio (CRNM)" },
    summary: {
      pt: "Registro na Polícia Federal em até 30 dias após a chegada.",
      en: "Register with the Federal Police within 30 days of arrival.",
      es: "Registro en la Policía Federal hasta 30 días después de la llegada.",
    },
    blocks: [
      {
        type: "facts",
        items: [
          { label: { pt: "Prazo", en: "Deadline", es: "Plazo" }, value: { pt: "Até 30 dias após a chegada — multa por dia de atraso", en: "Within 30 days of arrival — daily fine if late" } },
          { label: { pt: "Onde", en: "Where", es: "Dónde" }, value: { pt: "Polícia Federal no Aeroporto do Recife, das 9h às 15h", en: "Federal Police at Recife Airport, 9am–3pm" } },
          { label: { pt: "Contato", en: "Contact", es: "Contacto" }, value: { pt: "(81) 3322-4950 / 4951 / 4948 · estrangeiros@dpf.gov.br" } },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: { pt: "Guarde o documento de entrada", en: "Keep your entry document", es: "Guarda el documento de entrada" },
            text: {
              pt: "No voo você recebe um formulário de entrada, que é apresentado à Polícia Federal no desembarque. Ele registra sua chegada e é usado depois para legalizar a permanência.",
              en: "On the flight you'll get an entry form to present to the Federal Police on arrival. It records your arrival and is later used to legalise your stay.",
            },
          },
          {
            title: { pt: "Agende e compareça à Polícia Federal", en: "Book and attend the Federal Police", es: "Agenda y acude a la Policía Federal" },
            text: {
              pt: "O registro e a emissão da Carteira de Registro Nacional Migratório (CRNM) são presenciais. Leve passaporte com visto e a carta de aceitação da UFRPE.",
              en: "Registration and issuing of the National Migration Registry Card (CRNM) are done in person. Bring your passport with visa and the UFRPE acceptance letter.",
            },
          },
          {
            title: { pt: "Acompanhe a validade", en: "Track the expiry date", es: "Controla la validez" },
            text: {
              pt: "A PF define o prazo de estada. Para ficar mais tempo, peça a prorrogação até 30 dias antes do vencimento da CRNM.",
              en: "The Federal Police sets your length of stay. To stay longer, request an extension up to 30 days before your CRNM expires.",
            },
          },
        ],
      },
    ],
    links: [{ label: { pt: "Polícia Federal — Imigração", en: "Federal Police — Immigration" }, url: "https://www.gov.br/pf/pt-br/assuntos/imigracao" }],
    source: GUIA_IN,
  },
  {
    id: "carteira-vem",
    section: "documentos",
    stage: "primeiras-semanas",
    title: { pt: "Carteira de estudante e cartão VEM", en: "Student ID card and VEM transit card", es: "Carné de estudiante y tarjeta VEM" },
    summary: {
      pt: "Meia-entrada e passagem de ônibus com desconto em Recife.",
      en: "Half-price tickets and discounted bus fares in Recife.",
      es: "Media entrada y pasaje de autobús con descuento en Recife.",
    },
    blocks: [
      { type: "heading", text: { pt: "Carteira de estudante", en: "Student ID card", es: "Carné de estudiante" } },
      {
        type: "p",
        text: {
          pt: "Garante meia-entrada em cinemas, teatros e shows e é obrigatória para o VEM estudante. No início de cada semestre, entidades emitem a carteira nos centros acadêmicos da UFRPE. Taxa entre R$ 22 e R$ 40.",
          en: "Gives half-price entry to cinemas, theatres and concerts and is required for the student VEM card. At the start of each semester, organisations issue it at UFRPE's student centres. Fee between R$22 and R$40.",
        },
      },
      {
        type: "checklist",
        id: "carteira",
        title: { pt: "Para a carteira de estudante", en: "For the student ID card", es: "Para el carné de estudiante" },
        items: [
          { pt: "Foto 3x4", en: "3x4 photo" },
          { pt: "Comprovante de matrícula", en: "Proof of enrolment" },
          { pt: "Passaporte (cópia da identificação e do visto) ou CPF", en: "Passport (copy of ID page and visa) or CPF" },
        ],
      },
      { type: "heading", text: { pt: "Cartão VEM estudante", en: "Student VEM card", es: "Tarjeta VEM estudiante" } },
      {
        type: "steps",
        items: [
          { title: { pt: "Peça pelo VEM Posto Virtual (site ou app)", en: "Apply via VEM Posto Virtual (website or app)" }, text: { pt: "Informe e-mail e CPF.", en: "Provide your email and CPF." } },
          { title: { pt: "Valide o e-mail e agende a retirada", en: "Validate your email and book a pickup" } },
          { title: { pt: "Retire o cartão com os documentos", en: "Pick up the card with your documents" }, text: { pt: "Passaporte, CPF, comprovante de endereço e comprovante de matrícula.", en: "Passport, CPF, proof of address and proof of enrolment." } },
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: {
          pt: "Recarregue pela internet, em aplicativos, estações de BRT, terminais integrados ou na Central VEM (Rua das Ninfas, 278 – Boa Vista, 7h–17h em dias úteis).",
          en: "Top up online, via apps, at BRT stations, integrated terminals or at Central VEM (Rua das Ninfas, 278 – Boa Vista, 7am–5pm on weekdays).",
        },
      },
    ],
    links: [
      { label: { pt: "Documento do Estudante (UNE)", en: "Student ID (UNE)" }, url: "https://www.documentodoestudante.com.br" },
      { label: { pt: "Meia-entrada (UEP)", en: "Half-price card (UEP)" }, url: "https://www.meiaentradaestudantil.com.br/uep" },
      { label: { pt: "VEM Posto Virtual", en: "VEM Posto Virtual" }, url: "https://vempostovirtual.vemgranderecife.com.br/institucional" },
    ],
    source: GUIA_IN,
  },
  {
    id: "banco-celular-moradia",
    section: "documentos",
    stage: "primeiras-semanas",
    title: { pt: "Conta bancária, celular e aluguel", en: "Bank account, phone and renting", es: "Cuenta bancaria, celular y alquiler" },
    summary: {
      pt: "O que levar para abrir conta, ativar um chip e alugar um imóvel.",
      en: "What to bring to open an account, activate a SIM card and rent a home.",
      es: "Qué llevar para abrir una cuenta, activar un chip y alquilar una vivienda.",
    },
    blocks: [
      {
        type: "checklist",
        id: "banco",
        title: { pt: "Abrir conta bancária", en: "Open a bank account", es: "Abrir una cuenta bancaria" },
        items: [
          { pt: "CPF", en: "CPF" },
          { pt: "Comprovante de residência", en: "Proof of address" },
          { pt: "Comprovante de renda (bolsa, por exemplo)", en: "Proof of income (e.g. scholarship)" },
          { pt: "Visto temporário ou permanente", en: "Temporary or permanent visa" },
          { pt: "Passaporte ou CRNM (ou protocolo do pedido)", en: "Passport or CRNM (or application receipt)" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: { pt: "Chip de celular", en: "SIM card", es: "Chip de celular" },
        text: {
          pt: "A linha só é ativada com CPF. As operadoras principais são Vivo, Claro e Tim, com lojas nos shoppings. Para falar com o exterior, prefira aplicativos de mensagem. Código do Brasil: +55; Pernambuco: 81.",
          en: "A line can only be activated with a CPF. The main carriers are Vivo, Claro and Tim, with shops in malls. To call abroad, use messaging apps. Brazil code: +55; Pernambuco: 81.",
        },
      },
      {
        type: "checklist",
        id: "aluguel",
        title: { pt: "Alugar um imóvel", en: "Rent a home", es: "Alquilar una vivienda" },
        items: [
          { pt: "Passaporte válido", en: "Valid passport" },
          { pt: "CRNM", en: "CRNM" },
          { pt: "Visto de residência ou de trabalho", en: "Residence or work visa" },
          { pt: "Comprovante de renda (alguns proprietários pedem)", en: "Proof of income (some landlords ask)" },
        ],
      },
      {
        type: "p",
        text: {
          pt: "Bairros residenciais próximos à UFRPE: Dois Irmãos, Várzea, Caxangá, Iputinga e Apipucos.",
          en: "Residential neighbourhoods near UFRPE: Dois Irmãos, Várzea, Caxangá, Iputinga and Apipucos.",
        },
      },
    ],
    links: [],
    source: GUIA_IN,
  },
  {
    id: "mobilidade-in",
    section: "documentos",
    stage: "mobilidade",
    title: { pt: "Mobilidade IN: estudar na UFRPE", en: "Incoming mobility: study at UFRPE", es: "Movilidad IN: estudiar en la UFRPE" },
    summary: {
      pt: "Requisitos e documentos para estudantes estrangeiros se candidatarem.",
      en: "Requirements and documents for foreign students to apply.",
      es: "Requisitos y documentos para que estudiantes extranjeros postulen.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "Entre em contato antecipadamente com o NINTER/IPÊ e envie sua candidatura digital. Na graduação, é possível cursar até 6 disciplinas de cursos diferentes; na pós-graduação, contate primeiro o Programa (PPG) de interesse.",
          en: "Contact NINTER/IPÊ in advance and send your application digitally. Undergraduates may take up to 6 courses from different programs; graduate students should first contact the program (PPG) of interest.",
        },
      },
      {
        type: "checklist",
        id: "mobilidade-in",
        title: { pt: "Documentos da candidatura", en: "Application documents", es: "Documentos de la postulación" },
        items: [
          { pt: "Comprovante de vínculo com a instituição de origem", en: "Proof of enrolment at your home institution" },
          { pt: "Histórico escolar da universidade de origem", en: "Transcript from your home university" },
          { pt: "Passaporte com visto obtido no Consulado brasileiro", en: "Passport with visa from the Brazilian Consulate" },
          { pt: "Plano de estudos com equivalência das disciplinas", en: "Study plan with course equivalences" },
          { pt: "Seguro saúde", en: "Health insurance" },
          { pt: "Certificado ou declaração de proficiência em português", en: "Portuguese proficiency certificate or statement" },
          { pt: "Formulário de candidatura do NINTER/IPÊ", en: "NINTER/IPÊ application form" },
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: {
          pt: "Estudantes de instituições parceiras precisam, no mínimo, de um Memorando de Entendimento (MOU) assinado entre as universidades. Estágios supervisionados de 3 a 6 meses são vinculados a um orientador da UFRPE.",
          en: "Students from partner institutions need at least a signed Memorandum of Understanding (MOU) between the universities. Supervised internships of 3 to 6 months are linked to a UFRPE supervisor.",
        },
      },
    ],
    links: [
      { label: { pt: "Guia de Mobilidade IN", en: "Incoming Mobility Guide" }, url: "https://international.ufrpe.br/mobilidadein" },
      { label: { pt: "Formulário de candidatura", en: "Application form" }, url: "https://docs.google.com/forms/d/1CJAgP-p6goCS-R23pYx1e7EBrDXN2D6b4bTJ6P7Tpq8/viewform" },
      { label: { pt: "GCUB — bolsas para estrangeiros", en: "GCUB — scholarships for foreigners" }, url: "https://www.gcub.org.br" },
    ],
    source: GUIA_IN,
  },
  {
    id: "mobilidade-out",
    section: "documentos",
    stage: "mobilidade",
    title: { pt: "Mobilidade OUT e editais", en: "Outgoing mobility and calls", es: "Movilidad OUT y convocatorias" },
    summary: {
      pt: "Quem pode participar, programas parceiros e passo a passo para estudar fora.",
      en: "Who can apply, partner programs and step by step to study abroad.",
      es: "Quién puede participar, programas socios y paso a paso para estudiar afuera.",
    },
    blocks: [
      {
        type: "facts",
        items: [
          { label: { pt: "Graduação", en: "Undergraduate", es: "Grado" }, value: { pt: "Matrícula ativa, 40% a 80% do curso concluído, CR ≥ 7,0 e proficiência no idioma do destino", en: "Active enrolment, 40–80% of the program completed, GPA ≥ 7.0 and proficiency in the destination language" } },
          { label: { pt: "Pós-graduação", en: "Graduate", es: "Posgrado" }, value: { pt: "Matrícula ativa, exigências do PPG e proficiência no idioma", en: "Active enrolment, program requirements and language proficiency" } },
          { label: { pt: "Editais", en: "Calls", es: "Convocatorias" }, value: { pt: "Publicados ao longo do ano no site da UFRPE", en: "Published throughout the year on the UFRPE website" } },
        ],
      },
      { type: "heading", text: { pt: "Programas em parceria", en: "Partner programs", es: "Programas en alianza" } },
      {
        type: "list",
        items: [
          { pt: "GCUB — BRACOL (Colômbia) e BRAMEX (México), com auxílio para alimentação e alojamento", en: "GCUB — BRACOL (Colombia) and BRAMEX (Mexico), with food and housing allowance" },
          { pt: "Santander — Bolsas Ibero-Americanas (Portugal, Espanha e América Hispânica)", en: "Santander — Ibero-American Scholarships (Portugal, Spain and Hispanic America)" },
          { pt: "CAPES — BRAFAGRI (França) para Veterinária, Agronomia, Eng. Agrícola e Ambiental e Zootecnia", en: "CAPES — BRAFAGRI (France) for Veterinary, Agronomy, Agricultural & Environmental Eng. and Animal Science" },
          { pt: "Erasmus+ — um ano acadêmico na Europa com bolsa", en: "Erasmus+ — one academic year in Europe with a scholarship" },
          { pt: "ELAP — auxílio para universidades canadenses", en: "ELAP — funding for Canadian universities" },
        ],
      },
      { type: "heading", text: { pt: "Passo a passo (graduação)", en: "Step by step (undergraduate)", es: "Paso a paso (grado)" } },
      {
        type: "steps",
        items: [
          { title: { pt: "Comunique o NINTER e seu coordenador de curso", en: "Inform NINTER and your program coordinator" } },
          {
            title: { pt: "Reúna a documentação", en: "Gather the documents" },
            text: {
              pt: "Ofício ao NINTER, plano de trabalho, histórico, carta de aceite, termo de bolsa e carta de intenção (se houver) e comprovante de proficiência.",
              en: "Letter to NINTER, study plan, transcript, acceptance letter, scholarship agreement and letter of intent (if any) and proficiency certificate.",
            },
          },
          {
            title: { pt: "Abra o processo no SIPAC", en: "Open the SIPAC process" },
            text: {
              pt: "Envie para processo@ufrpe.br o ofício em PDF e todos os documentos num único PDF, pedindo ao DRCA a matrícula em mobilidade a cada semestre.",
              en: "Email processo@ufrpe.br the letter as a PDF and all documents in a single PDF, asking DRCA for mobility enrolment each semester.",
            },
          },
          { title: { pt: "Envie tudo ao NINTER para registro", en: "Send everything to NINTER for the record" }, text: { pt: "mobilidade.ninter@ufrpe.br" } },
          {
            title: { pt: "Comunique o retorno em até 15 dias", en: "Report your return within 15 days" },
            text: {
              pt: "Avise o coordenador e o NINTER e responda ao formulário de experiência. As disciplinas cursadas podem ser aproveitadas no histórico.",
              en: "Notify your coordinator and NINTER and fill in the experience form. Courses taken abroad may be credited to your transcript.",
            },
          },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: {
          pt: "Só compre passagens depois de receber a carta de aceite e o visto. O passaporte deve valer por todo o período e o seguro saúde é obrigatório no país de destino.",
          en: "Only buy tickets after receiving the acceptance letter and visa. Your passport must be valid for the whole period and health insurance is mandatory in the destination country.",
        },
      },
    ],
    links: [
      { label: { pt: "Guia de Mobilidade OUT", en: "Outgoing Mobility Guide" }, url: "https://international.ufrpe.br/mobilidadeout" },
      { label: { pt: "Editais no portal da UFRPE", en: "Calls on the UFRPE website" }, url: "https://www.ufrpe.br" },
      { label: { pt: "Formulário de experiência em mobilidade", en: "Mobility experience form" }, url: "https://docs.google.com/forms/d/1lYMpfyFHrSufYu5ayeCq0vrQh6NCFZ42MKhWfMHAUvk/viewform" },
    ],
    source: GUIA_OUT,
  },

  // ───────────── Guia do calouro ─────────────
  {
    id: "primeira-semana",
    section: "calouro",
    title: { pt: "Primeira semana no campus", en: "First week on campus", es: "Primera semana en el campus" },
    summary: {
      pt: "O que fazer assim que chegar à UFRPE.",
      en: "What to do as soon as you arrive at UFRPE.",
      es: "Qué hacer en cuanto llegues a la UFRPE.",
    },
    blocks: [
      {
        type: "steps",
        items: [
          { title: { pt: "Chegue alguns dias antes das aulas", en: "Arrive a few days before classes", es: "Llega unos días antes de las clases" }, text: { pt: "Assim dá tempo de resolver documentação, matrícula e moradia e participar da recepção de estudantes estrangeiros.", en: "This gives you time to sort out documents, enrolment and housing and attend the welcome session for international students." } },
          { title: { pt: "Confirme sua matrícula", en: "Confirm your enrolment", es: "Confirma tu matrícula" }, text: { pt: "Graduação: com o NINTER/IPÊ. Pós-graduação: na secretaria do seu Programa, em horário de atendimento presencial.", en: "Undergraduate: with NINTER/IPÊ. Graduate: at your program office during in-person hours." } },
          { title: { pt: "Ative Wi-Fi e SIGAA", en: "Activate Wi-Fi and SIGAA", es: "Activa el Wi-Fi y el SIGAA" }, text: { pt: "Com CPF e matrícula, cadastre login e senha seguindo a Central de Ajuda da UFRPE.", en: "With your CPF and enrolment, set up your login following UFRPE's Help Center." } },
          { title: { pt: "Localize os lugares essenciais no mapa", en: "Find the key places on the map", es: "Ubica los lugares clave en el mapa" }, text: { pt: "Seu departamento, a Biblioteca Central, o Restaurante Universitário e o Prédio Central.", en: "Your department, the Central Library, the University Restaurant and the Central Building." } },
        ],
      },
    ],
    links: [
      { label: { pt: "Wi-Fi UFRPE — Central de Ajuda", en: "UFRPE Wi-Fi — Help Center" }, url: "https://ajuda.ufrpe.br/sections/wifi-ufrpe" },
      { label: { pt: "SIGAA", en: "SIGAA" }, url: "https://sigs.ufrpe.br/sigaa/verTelaLogin.do" },
    ],
    placeId: "reitoria",
    source: GUIA_IN,
  },
  {
    id: "vida-academica-regras",
    section: "calouro",
    title: { pt: "Calendário, créditos e notas", en: "Calendar, credits and grades", es: "Calendario, créditos y notas" },
    summary: {
      pt: "Como funcionam semestres, frequência e aprovação.",
      en: "How semesters, attendance and passing work.",
      es: "Cómo funcionan semestres, asistencia y aprobación.",
    },
    blocks: [
      {
        type: "facts",
        items: [
          { label: { pt: "Ano letivo", en: "Academic year", es: "Año lectivo" }, value: { pt: "Fevereiro a dezembro, em dois semestres, com 3 a 5 semanas de férias entre eles", en: "February to December, in two semesters, with 3–5 weeks of break in between" } },
          { label: { pt: "Créditos", en: "Credits", es: "Créditos" }, value: { pt: "1 crédito = 15 horas-aula; a maioria das disciplinas tem 4 créditos (60 h)", en: "1 credit = 15 class hours; most courses have 4 credits (60 h)" } },
          { label: { pt: "Frequência", en: "Attendance", es: "Asistencia" }, value: { pt: "Mínimo de 75% das aulas", en: "At least 75% of classes" } },
          { label: { pt: "Graduação", en: "Undergraduate", es: "Grado" }, value: { pt: "Média ≥ 7,0 aprova direto; entre 3,0 e 7,0 faz exame final e precisa de média final ≥ 5,0", en: "Average ≥ 7.0 passes; between 3.0 and 7.0 takes a final exam and needs a final average ≥ 5.0" } },
          { label: { pt: "Pós-graduação", en: "Graduate", es: "Posgrado" }, value: { pt: "Nota ≥ 6,0 aprova; é possível repetir a disciplina uma única vez", en: "Grade ≥ 6.0 passes; a course may be repeated only once" } },
        ],
      },
    ],
    links: [{ label: { pt: "Calendário acadêmico (DRCA)", en: "Academic calendar (DRCA)" }, url: "http://drca.ufrpe.br/" }],
    source: GUIA_IN,
  },
  {
    id: "beneficios",
    section: "calouro",
    title: { pt: "RU, biblioteca e outros benefícios", en: "Canteen, library and other benefits", es: "Comedor, biblioteca y otros beneficios" },
    summary: {
      pt: "Restaurante Universitário, bibliotecas, saúde, esportes e residência.",
      en: "University Restaurant, libraries, health, sports and student housing.",
      es: "Restaurante Universitario, bibliotecas, salud, deportes y residencia.",
    },
    blocks: [
      {
        type: "facts",
        items: [
          { label: { pt: "Restaurante Universitário", en: "University Restaurant", es: "Restaurante Universitario" }, value: { pt: "Seg. a sex. · almoço 10h30–14h (R$ 3,50) · jantar 16h30–19h (R$ 3,00). Acesso com comprovante de matrícula.", en: "Mon–Fri · lunch 10:30am–2pm (R$3.50) · dinner 4:30pm–7pm (R$3.00). Access with proof of enrolment." } },
          { label: { pt: "Biblioteca", en: "Library", es: "Biblioteca" }, value: { pt: "Cadastro com CPF, CRNM, comprovante de residência e de matrícula", en: "Register with CPF, CRNM, proof of address and enrolment" } },
          { label: { pt: "Saúde (DQV)", en: "Health (DQV)", es: "Salud (DQV)" }, value: { pt: "Passaporte, 2 fotos 3x4 e comprovante de matrícula · (81) 3320-6152", en: "Passport, two 3x4 photos and proof of enrolment · (81) 3320-6152" } },
          { label: { pt: "Esportes", en: "Sports", es: "Deportes" }, value: { pt: "Atletismo, vôlei, basquete, handebol, musculação, natação, futsal, ioga e dança · (81) 3320-5445", en: "Athletics, volleyball, basketball, handball, gym, swimming, futsal, yoga and dance · (81) 3320-5445" } },
          { label: { pt: "Residência", en: "Student housing", es: "Residencia" }, value: { pt: "Vagas para estrangeiros todo semestre, mediante pedido prévio ao NINTER", en: "Places for international students every semester, by prior request to NINTER" } },
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: { pt: "Português como Língua Estrangeira", en: "Portuguese as a Foreign Language", es: "Portugués como Lengua Extranjera" },
        text: {
          pt: "Cursos gratuitos todo semestre pela Rede Andifes-IsF e pelo Núcleo de Idiomas (NID). Fale com nid@ufrpe.br.",
          en: "Free courses every semester through the Andifes-IsF Network and the Language Center (NID). Contact nid@ufrpe.br.",
        },
      },
    ],
    links: [
      { label: { pt: "Cardápio do RU", en: "Canteen menu" }, url: "/cardapio" },
      { label: { pt: "Bibliotecas — guia do usuário", en: "Libraries — user guide" }, url: "http://www.sib.ufrpe.br/guia-do-usuario#cadastro" },
    ],
    placeId: "ru",
    source: GUIA_IN,
  },

  // ───────────── Guia de Recife ─────────────
  {
    id: "conheca-recife",
    section: "recife",
    title: { pt: "Conheça Recife", en: "Discover Recife", es: "Conoce Recife" },
    summary: {
      pt: "Vídeos e fotos oficiais da cidade que vai ser sua casa.",
      en: "Official videos and photos of the city that will be your home.",
      es: "Videos y fotos oficiales de la ciudad que será tu casa.",
    },
    blocks: [
      {
        type: "p",
        text: {
          pt: "Recife é a capital de Pernambuco, conhecida pelos rios e pontes, pelo frevo e maracatu, pelo Carnaval e por praias como Boa Viagem. O campus Sede da UFRPE fica no bairro de Dois Irmãos, na zona norte.",
          en: "Recife is the capital of Pernambuco, known for its rivers and bridges, frevo and maracatu, Carnival and beaches such as Boa Viagem. UFRPE's main campus is in the Dois Irmãos neighbourhood, in the north of the city.",
          es: "Recife es la capital de Pernambuco, conocida por sus ríos y puentes, el frevo y el maracatu, el Carnaval y playas como Boa Viagem. El campus Sede de la UFRPE está en el barrio de Dois Irmãos, en la zona norte.",
        },
      },
      { type: "video", title: { pt: "Recife é pra ficar", en: "Recife is a place to stay", es: "Recife es para quedarse" }, credit: "Prefeitura do Recife", driveId: "1yC72NgqCKSAK3zH2uVvw5pK1LroF4PJG" },
      { type: "video", title: { pt: "Vídeo institucional de Recife", en: "Recife institutional video", es: "Video institucional de Recife" }, credit: "Recife Convention & Visitors Bureau", driveId: "17Lac3rPYxyFdJ2a-XsFuI5RQmBuK3mHD" },
      {
        type: "gallery",
        title: { pt: "Fotos oficiais de Recife", en: "Official photos of Recife", es: "Fotos oficiales de Recife" },
        credit: "Sol Pulquério / Prefeitura do Recife",
        folderId: "1gND0uVw9b-f2jdQSu03jMvCSl8d5tdoO",
        url: "https://drive.google.com/drive/folders/1gND0uVw9b-f2jdQSu03jMvCSl8d5tdoO",
        embed: true,
      },
      {
        type: "gallery",
        title: { pt: "Mais fotos de Recife", en: "More photos of Recife", es: "Más fotos de Recife" },
        credit: "Dondinh",
        folderId: "1-v2QP-AOc_uL1g6re50fjRhLKYF26G-s",
        url: "https://drive.google.com/drive/folders/1-v2QP-AOc_uL1g6re50fjRhLKYF26G-s",
        embed: false,
      },
    ],
    links: [],
    source: { pt: "Prefeitura do Recife e Recife Convention & Visitors Bureau", en: "Recife City Hall and Recife Convention & Visitors Bureau", es: "Alcaldía de Recife y Recife Convention & Visitors Bureau" },
  },
  {
    id: "chegada-transporte",
    section: "recife",
    title: { pt: "Chegada e transporte", en: "Arrival and transport", es: "Llegada y transporte" },
    summary: {
      pt: "Do aeroporto ao campus e como usar ônibus e BRT.",
      en: "From the airport to campus and how to use buses and BRT.",
      es: "Del aeropuerto al campus y cómo usar autobuses y BRT.",
    },
    blocks: [
      {
        type: "steps",
        items: [
          { title: { pt: "Reserve hospedagem antes de chegar", en: "Book accommodation before arriving", es: "Reserva alojamiento antes de llegar" }, text: { pt: "Mesmo que provisória.", en: "Even if temporary." } },
          { title: { pt: "Saia do aeroporto de táxi registrado ou aplicativo", en: "Leave the airport by registered taxi or app", es: "Sal del aeropuerto en taxi registrado o aplicación" }, text: { pt: "Dá para pagar o traslado antes, na área de bagagens, em dinheiro ou cartão. O Uber também é muito usado.", en: "You can prepay the ride in the baggage area, in cash or by card. Uber is also widely used." } },
          { title: { pt: "Use o VEM no transporte público", en: "Use the VEM card on public transport", es: "Usa la VEM en el transporte público" }, text: { pt: "Há paradas em frente à Portaria Principal. Com o VEM estudante a passagem é mais barata.", en: "There are stops in front of the Main Gate. With the student VEM card fares are cheaper." } },
        ],
      },
    ],
    links: [{ label: { pt: "Grande Recife Consórcio de Transporte", en: "Grande Recife Transport Consortium" }, url: "https://www.granderecife.pe.gov.br" }],
    placeId: "portaria-principal",
    source: GUIA_IN,
  },
  {
    id: "seguranca",
    section: "recife",
    title: { pt: "Segurança e leis", en: "Safety and laws", es: "Seguridad y leyes" },
    summary: {
      pt: "Cuidados no dia a dia e números de emergência gratuitos.",
      en: "Everyday precautions and free emergency numbers.",
      es: "Cuidados diarios y números de emergencia gratuitos.",
    },
    blocks: [
      {
        type: "list",
        items: [
          { pt: "evite exibir objetos de valor em locais públicos;", en: "avoid displaying valuables in public places;" },
          { pt: "fique atento(a) em áreas movimentadas;", en: "stay aware in crowded areas;" },
          { pt: "use transportes oficiais e aplicativos confiáveis;", en: "use official transport and trusted apps;" },
          { pt: "guarde documentos importantes em local seguro.", en: "keep important documents in a safe place." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: {
          pt: "Todos os estrangeiros devem cumprir as leis brasileiras, inclusive normas migratórias e de trânsito. O desconhecimento da lei não isenta de responsabilidade. Polícia (190), SAMU (192) e Bombeiros (193) são gratuitos.",
          en: "All foreigners must comply with Brazilian law, including immigration and traffic rules. Ignorance of the law is no excuse. Police (190), SAMU (192) and Fire Department (193) are free of charge.",
        },
      },
    ],
    links: [],
    source: CARTILHA,
  },
];
