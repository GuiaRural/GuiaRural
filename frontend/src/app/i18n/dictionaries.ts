export const LANGUAGES = ["pt", "en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export type Dictionary = {
  header: { publicPlatform: string };
  sidebar: {
    campusNavigation: string;
    campusName: string;
    cityLabel: string;
    map: string;
    stops: string;
    eat: string;
    study: string;
    notices: string;
    courses: string;
    services: string;
    weeklyMenu: string;
    welcomeSection: string;
    culture: string;
    documents: string;
    freshmanGuide: string;
    recifeGuide: string;
    supportSection: string;
    contactTeam: string;
    accessibility: string;
    admin: string;
    openMenu: string;
    closeMenu: string;
  };
  search: {
    placeholder: string;
    label: string;
    myLocation: string;
    filters: string;
    recent: string;
    noResults: string;
  };
  map: { title: string; loading: string; zoomIn: string; zoomOut: string };
  language: { label: string };
};

export const dictionaries: Record<Language, Dictionary> = {
  pt: {
    header: { publicPlatform: "Plataforma Pública • Acesso Livre" },
    sidebar: {
      campusNavigation: "Navegação do campus",
      campusName: "Dois Irmãos · Sede",
      cityLabel: "Recife · PE",
      map: "Mapa interativo",
      stops: "Portarias e paradas",
      eat: "Onde comer",
      study: "Espaços de estudo",
      notices: "Avisos do campus",
      courses: "Cursos e departamentos",
      services: "Serviços",
      weeklyMenu: "Cardápio da semana",
      welcomeSection: "Acolhimento",
      culture: "Interação cultural",
      documents: "Documentos e editais",
      freshmanGuide: "Guia do calouro",
      recifeGuide: "Guia de Recife",
      supportSection: "Gestão e apoio",
      contactTeam: "Falar com a equipe",
      accessibility: "Acessibilidade",
      admin: "Área do administrador",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
    },
    search: {
      placeholder: "Pesquisar prédios, departamentos, salas, RU, paradas...",
      label: "Pesquisar no campus",
      myLocation: "Usar minha localização",
      filters: "Filtros",
      recent: "Últimos acessos:",
      noResults: "Nenhum local encontrado",
    },
    map: {
      title: "Mapa do campus",
      loading: "Carregando o mapa…",
      zoomIn: "Aumentar zoom",
      zoomOut: "Diminuir zoom",
    },
    language: { label: "Idioma" },
  },
  en: {
    header: { publicPlatform: "Public Platform • Free Access" },
    sidebar: {
      campusNavigation: "Campus navigation",
      campusName: "Dois Irmãos · Main Campus",
      cityLabel: "Recife · PE",
      map: "Interactive map",
      stops: "Gates and stops",
      eat: "Where to eat",
      study: "Study spaces",
      notices: "Campus notices",
      courses: "Courses and departments",
      services: "Services",
      weeklyMenu: "Weekly menu",
      welcomeSection: "Welcome",
      culture: "Cultural interaction",
      documents: "Documents and calls",
      freshmanGuide: "Freshman guide",
      recifeGuide: "Recife guide",
      supportSection: "Support",
      contactTeam: "Contact the team",
      accessibility: "Accessibility",
      admin: "Administrator area",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    search: {
      placeholder: "Search buildings, departments, rooms, canteen, stops...",
      label: "Search the campus",
      myLocation: "Use my location",
      filters: "Filters",
      recent: "Recently visited:",
      noResults: "No places found",
    },
    map: {
      title: "Campus map",
      loading: "Loading the map…",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
    },
    language: { label: "Language" },
  },
  es: {
    header: { publicPlatform: "Plataforma Pública • Acceso Libre" },
    sidebar: {
      campusNavigation: "Navegación del campus",
      campusName: "Dois Irmãos · Sede",
      cityLabel: "Recife · PE",
      map: "Mapa interactivo",
      stops: "Portones y paradas",
      eat: "Dónde comer",
      study: "Espacios de estudio",
      notices: "Avisos del campus",
      courses: "Cursos y departamentos",
      services: "Servicios",
      weeklyMenu: "Menú de la semana",
      welcomeSection: "Acogida",
      culture: "Interacción cultural",
      documents: "Documentos y convocatorias",
      freshmanGuide: "Guía del novato",
      recifeGuide: "Guía de Recife",
      supportSection: "Gestión y apoyo",
      contactTeam: "Hablar con el equipo",
      accessibility: "Accesibilidad",
      admin: "Área del administrador",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
    },
    search: {
      placeholder: "Buscar edificios, departamentos, salas, comedor, paradas...",
      label: "Buscar en el campus",
      myLocation: "Usar mi ubicación",
      filters: "Filtros",
      recent: "Últimos accesos:",
      noResults: "No se encontraron lugares",
    },
    map: {
      title: "Mapa del campus",
      loading: "Cargando el mapa…",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
    },
    language: { label: "Idioma" },
  },
};
