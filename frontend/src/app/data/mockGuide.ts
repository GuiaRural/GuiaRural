import type { IconName } from "../components/common/Icon";

export type GuideDetail = {
  label: string;
  text: string;
  icon?: IconName;
  iconTone?: "green" | "amber" | "red";
  emphasis?: boolean;
};

export type GuideSpot = {
  id: string;
  title: string;
  address: string;
  description: string;
  tag: { label: string; tone: "red" | "navy" | "olive" };
  badge: { label: string; tone: "free" | "highlight" };
  distance: { label: string; icon: IconName };
  image?: { src: string; alt: string };
  details: GuideDetail[];
  detailsLayout: "stack" | "columns";
};

export type GuideTip = {
  id: string;
  title: string;
  icon: IconName;
  text: string;
  link: { label: string; href?: string };
};

export type RecifeGuide = {
  spots: GuideSpot[];
  tips: GuideTip[];
  support: { before: string; bold: string; after: string; cta: string };
};

export const MOCK_RECIFE_GUIDE: RecifeGuide = {
  spots: [
    {
      id: "horto-dois-irmaos",
      title: "Parque Estadual Dois Irmãos (Horto)",
      address: "Praça Farias Neves, s/n, Dois Irmãos",
      description:
        "Vizinho imediato da UFRPE, é um dos maiores remanescentes de Mata Atlântica de Pernambuco. Abriga o Parque Zoobotânico com centenas de espécies de animais, açude, trilhas ecológicas guias e um centro de conservação ambiental.",
      tag: { label: "Natureza & Conservação", tone: "olive" },
      badge: { label: "Ao Lado da UFRPE (~1 km)", tone: "highlight" },
      distance: { label: "Ter a Dom • 09h às 15h", icon: "clock" },
      detailsLayout: "columns",
      details: [
        {
          label: "Acesso discente",
          text: "Ingresso simbólico com meia-entrada para estudantes",
          icon: "ticket",
          iconTone: "green",
          emphasis: true,
        },
        {
          label: "Destaques do parque",
          text: "Mata nativa preserved, zoológico histórico e trilhas de educação ambiental.",
          icon: "star",
          iconTone: "amber",
        },
      ],
    },
    {
      id: "marco-zero",
      title: "Marco Zero & Bairro do Recife Antigo",
      address: "Praça Barão do Rio Branco, Bairro do Recife",
      description:
        "O coração histórico e cultural do Recife, cercado por imponentes casarios coloniais, esculturas de Francisco Brennand no molhe portuário e o emblemático mosaico da Rosa dos Ventos. Ponto de encontro tradicional de universitários nas feiras e shows de fim de semana.",
      tag: { label: "História & Cultura", tone: "red" },
      badge: { label: "Acesso Livre • 24h", tone: "free" },
      distance: { label: "Zona Central • 14 km", icon: "map" },
      detailsLayout: "stack",
      details: [
        {
          label: "Pontos conectados",
          text: "Cais do Sertão, Paço do Frevo, Sinagoga Kahal Zur Israel & Feira de Artesanato.",
          icon: "link",
          iconTone: "green",
        },
        {
          label: "Acesso & ingressos",
          text: "Praça Livre • Museus com Meia",
          icon: "ticket",
          iconTone: "green",
          emphasis: true,
        },
      ],
    },
    {
      id: "muhne",
      title: "Museu do Homem do Nordeste (MUHNE)",
      address: "Avenida 17 de Agosto, Casa Forte",
      description:
        "Vinculado à Fundação Joaquim Nabuco (Fundaj) e muito próximo da UFRPE, o MUHNE possui um acervo antropológico e social valiosíssimo. Explora as matrizes culturais indígena, africana e européia na formação da sociedade nordestina.",
      tag: { label: "Cultura & Sociedade", tone: "red" },
      badge: { label: "Próximo à UFRPE (~3.2 km)", tone: "highlight" },
      distance: { label: "Ter a Sex • 10h às 16h", icon: "clock" },
      detailsLayout: "columns",
      details: [
        {
          label: "Benefício UFRPE",
          text: "Entrada gratuita / Meia-entrada discente",
          icon: "graduation",
          iconTone: "green",
          emphasis: true,
        },
        {
          label: "Destaques do acervo",
          text: "Exposições sobre açúcar, religiosidade, arte popular e Cinema da Fundaj.",
          icon: "star",
          iconTone: "amber",
        },
      ],
    },
    {
      id: "irb",
      title: "Instituto Ricardo Brennand (IRB)",
      address: "Alameda Antônio Brennand, Várzea",
      description:
        "Eleito um dos museus mais destacados da América Latina, está situado bem próximo à UFRPE. Abriga a maior coleção mundial de telas de Frans Post sobre o Brasil Holandês, extraordinária armaria medieval e exuberante parque botânico de esculturas.",
      tag: { label: "Arte & Patrimônio", tone: "navy" },
      badge: { label: "Mais Próximo da UFRPE (~5.8 km)", tone: "highlight" },
      distance: { label: "Ter a Dom • 13h às 17h", icon: "clock" },
      detailsLayout: "columns",
      details: [
        {
          label: "Benefício UFRPE",
          text: "Meia-entrada discente integral",
          icon: "graduation",
          iconTone: "green",
          emphasis: true,
        },
        {
          label: "Acervo chave",
          text: "Castelo São João, Pinacoteca dos Mestres, tapeçarias flamengas e jardins de Burle Marx.",
          icon: "star",
          iconTone: "amber",
        },
      ],
    },
    {
      id: "jaqueira-tamarineira",
      title: "Parque da Jaqueira & Parque da Tamarineira",
      address: "Rua do Futuro / Av. Rosa e Silva, Zona Norte",
      description:
        "Duas das principais áreas verdes de convivência da Zona Norte. A Jaqueira conta com pista de cooper, ciclovia e feiras orgânicas; já o vizinho Parque da Tamarineira é um oásis arborizado recém-estruturado, ideal para passeios e leitura.",
      tag: { label: "Lazer & Natureza", tone: "olive" },
      badge: { label: "Acesso Livre • 05h às 22h", tone: "free" },
      distance: { label: "Zona Norte • ~5.5 km", icon: "map" },
      detailsLayout: "columns",
      details: [
        {
          label: "Atividades",
          text: "Pista de caminhada, estações de exercício, área verde para piqueniques e cafés ao redor.",
        },
        {
          label: "Transporte fácil",
          text: "Acesso direto por linhas de ônibus da Rosa e Silva",
          icon: "link",
          iconTone: "green",
          emphasis: true,
        },
      ],
    },
    {
      id: "parque-das-gracas",
      title: "Parque das Graças (Orla do Capibaribe)",
      address: "Rua das Graças / Beira do Rio Capibaribe",
      description:
        "Um dos novos cartões-postais sustentáveis do Recife. Um parque linear flutuante às margens do Rio Capibaribe, com mirantes panorâmicos, jardins de contemplação, playground e área dedicada a pets e mobilidade ativa.",
      tag: { label: "Lazer & Natureza", tone: "olive" },
      badge: { label: "Acesso Livre • 24h", tone: "free" },
      distance: { label: "Zona Norte / Graças • ~7 km", icon: "map" },
      detailsLayout: "columns",
      details: [
        {
          label: "Melhor horário",
          text: "Final de tarde (pôr do sol às margens do Capibaribe)",
          icon: "sunset",
          iconTone: "green",
          emphasis: true,
        },
        {
          label: "Atrações urbanas",
          text: "Conexão com a malha cicloviária e gastronomia do bairro das Graças e Espinheiro.",
        },
      ],
    },
    {
      id: "capela-dourada",
      title: "Capela Dourada & Convento de São Francisco",
      address: "Rua do Imperador Dom Pedro II, Santo Antônio",
      description:
        "Uma das maiores expressões do Barroco brasileiro no Nordeste. Famosa pela quantidade espetacular de talha em madeira coberta por folhas de ouro e painéis de azulejos portugueses do século XVIII.",
      tag: { label: "História & Barroco", tone: "red" },
      badge: { label: "Centro Histórico", tone: "free" },
      distance: { label: "Seg a Sex • 09h às 16h", icon: "clock" },
      detailsLayout: "columns",
      details: [
        {
          label: "Destaque arquitetônico",
          text: "Museu Franciscano de Arte Sacra, altar-mor folheado a ouro e pátio do convento.",
        },
        {
          label: "Acesso",
          text: "Ingresso simbólico com meia para estudantes",
          icon: "ticket",
          iconTone: "green",
          emphasis: true,
        },
      ],
    },
    {
      id: "riomar-recife",
      title: "Shopping RioMar Recife",
      address: "Avenida República do Líbano, Pina",
      description:
        "Um dos centros de compras e lazer mais modernos do país, situado às margens do Bacia do Pina. Conta com complexo de cinemas Cinemark, teatro moderno, alameda gourmet com restaurantes renomados e vista panorâmica para o manguezal e o mar.",
      tag: { label: "Serviços & Lazer", tone: "navy" },
      badge: { label: "Seg a Sáb 09h-22h • Dom 12h-21h", tone: "free" },
      distance: { label: "Pina / Zona Sul • ~12 km", icon: "map" },
      detailsLayout: "columns",
      details: [
        {
          label: "Entretenimento & cultura",
          text: "Teatro RioMar, salas de cinema VIP/XD, livrarias e praças de alimentação variadas.",
        },
        {
          label: "Mobilidade",
          text: "Conexão de ônibus via Via Mangue e Expresso RioMar",
          icon: "link",
          iconTone: "green",
        },
      ],
    },
    {
      id: "boa-viagem",
      title: "Praia de Boa Viagem & Parque Dona Lindu",
      address: "Avenida Boa Viagem, Zona Sul",
      description:
        "O principal cartão-postal costeiro de Recife com 8 km de calçadão panorâmico, ciclovias protegidas e quiosques tradicionais de água de coco fresca. Excelente para corridas ao fim de tarde, skate no Dona Lindu e finais de semana ensolarados.",
      tag: { label: "Lazer & Natureza", tone: "olive" },
      badge: { label: "Calçadão Ativo • Iluminado", tone: "free" },
      distance: { label: "Zona Sul • ~16 km", icon: "map" },
      detailsLayout: "columns",
      details: [
        {
          label: "Destaques",
          text: "Teatro Luiz Mendonça, Galeria Janete Costa e Feirinha Gastronômica de Boa Viagem.",
        },
        {
          label: "Dica de segurança",
          text: "Banho só na maré baixa em arrecifes",
          icon: "alert",
          iconTone: "red",
          emphasis: true,
        },
      ],
    },
    {
      id: "olinda",
      title: "Sítio Histórico de Olinda (Alto da Sé)",
      address: "Ladeiras Históricas & Mirante da Catedral da Sé",
      description:
        "Patrimônio Cultural Mundial, Olinda oferece o pôr do sol mais espetacular de Pernambuco no Alto da Sé, ladeiras ladeadas por casarões barrocos do século XVI, culinária autêntica com tapiocas recheadas e efervescência musical universitária de maracatu e frevo.",
      tag: { label: "Patrimônio Mundial UNESCO", tone: "red" },
      badge: { label: "Visitação Diária Livre", tone: "free" },
      distance: { label: "Olinda • ~17 km da UFRPE", icon: "map" },
      detailsLayout: "columns",
      details: [
        {
          label: "Patrimônio arquitetônico",
          text: "Mosteiro de São Bento, Convento de São Francisco, Museu dos Bonecos Gigantes.",
        },
        {
          label: "Melhor horário",
          text: "16h00 (Pôr do Sol no Mirante)",
          icon: "sunset",
          iconTone: "green",
          emphasis: true,
        },
      ],
    },
  ],
  tips: [
    {
      id: "vem",
      title: "Cartão VEM Estudantil",
      icon: "card",
      text: "Garanta 50% de desconto na tarifa do Grande Recife Consórcio ou passe integral (conforme critérios do Passe Livre). Solicite o atestado de matrícula no portal SIGA da UFRPE e valide nos postos de atendimento ou online pelo app oficial.",
      link: { label: "Passo a passo no SIGA" },
    },
    {
      id: "macaxeira",
      title: "Integração no TI Macaxeira",
      icon: "network",
      text: "O Terminal Integrado da Macaxeira é o nó central de transporte público próximo do campus Dois Irmãos. A partir dele, você tem baldeação sem custo adicional para a Zona Norte, Joana Bezerra (metrô), CDU, Tancredo Neves e Olinda (TI PE-15).",
      link: { label: "Ver linhas circulares da UFRPE" },
    },
    {
      id: "apps",
      title: "Apps Recomendados",
      icon: "phone",
      text: "Instale o Cittamobi Recife para previsão de horários em tempo real dos ônibus que passam na guarita da UFRPE. Cadastre-se no Bike PE (com tarifas subsidiadas para estudantes da rede pública) com estação na entrada principal.",
      link: { label: "Guia de aplicativos móveis" },
    },
  ],
  support: {
    before: "Precisa de auxílio de deslocamento ou apoio à moradia estudantil? Procure a ",
    bold: "PROGEST / DACE",
    after: " no Prédio Central.",
    cta: "Falar com Apoio ao Estudante",
  },
};