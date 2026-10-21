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

// Conteúdo fictício copiado do protótipo (UC40), só em português, até a integração com a API.
// Distâncias e horários não foram verificados; não representam dados oficiais da UFRPE.
export const MOCK_RECIFE_GUIDE: RecifeGuide = {
  spots: [
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
