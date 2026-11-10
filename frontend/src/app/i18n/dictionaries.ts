import type { GuideSection, GuideStage } from "../services/guidesService";
import type { PlaceCategory } from "../services/placesService";
import type { CourseType } from "../services/coursesService";

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
    minChars: string;
    shortcut: string;
    locating: string;
    locateDenied: string;
    locateOutside: string;
    department: string;
    course: string;
  };
  map: {
    title: string;
    loading: string;
    label: string;
    zoomIn: string;
    zoomOut: string;
    recenter: string;
  };
  language: { label: string; open: string };
  common: { close: string; cancel: string; loading: string; minutes: string; meters: string };
  categories: Record<PlaceCategory, string>;
  serviceCard: {
    howToApply: string;
    whereToFind: string;
    requirements: string;
    deadline: string;
    openLink: string;
    newTab: string;
    newBadge: string;
  };
  placeCard: {
    openNow: string;
    closed: string;
    walk: string;
    fromOrigin: string;
    hours: string;
    viewFull: string;
    save: string;
    saved: string;
    hoursTo: string;
  };
  placePage: {
    backToMap: string;
    notFound: string;
    notFoundText: string;
    recommendedRoute: string;
    fromGate: string;
    traceRoute: string;
    viewOnMap: string;
    hours: string;
    contact: string;
    about: string;
    services: string;
    noServices: string;
    courses: string;
    share: string;
    linkCopied: string;
    address: string;
    externalOnly: string;
  };
  route: {
    to: string;
    from: string;
    yourLocation: string;
    distance: string;
    time: string;
    end: string;
    locating: string;
    chooseOrigin: string;
    gpsDenied: string;
    outside: string;
    gates: string;
    buildings: string;
    confirm: string;
  };
  guide: {
    breadcrumbLabel: string;
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    defaultOrigin: string;
    quickTips: string;
    heroTitle: string;
    heroSubtitle: string;
    tipsTitle: string;
    tipsSubtitle: string;
    partnerships: string;
    footerBrand: string;
    footerTagline: string;
    footerInstitution: string;
    scale: string;
    errorTitle: string;
    errorText: string;
    retry: string;
    saveSpot: string;
    unsaveSpot: string;
  };
  guides: {
    sections: Record<GuideSection, { title: string; intro: string }>;
    chooseTopic: string;
    fallbackNotice: string;
    unavailable: string;
    supportLinks: string;
    backToTopics: string;
    translateHint: string;
    sectionsLabel: string;
    emptyReader: string;
    readingTime: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchResults: string;
    noResults: string;
    source: string;
    viewOnMap: string;
    progressOf: string;
    downloadsTitle: string;
    helpTitle: string;
    emergencyTitle: string;
    timelineTitle: string;
    timelineIntro: string;
    openFolder: string;
    photoCredit: string;
    copyLink: string;
    linkCopied: string;
    topicsCount: string;
    stages: Record<GuideStage, string>;
  };
  notices: {
    title: string;
    subtitle: string;
    empty: string;
    error: string;
    retry: string;
    portugueseOnly: string;
  };
  services: {
    title: string;
    subtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryFilter: string;
    allCategories: string;
    resultsCount: string;
    empty: string;
    noResults: string;
    clearFilters: string;
    error: string;
    retry: string;
    portugueseOnly: string;
  };
  weeklyMenu: {
    title: string;
    subtitle: string;
    lunch: string;
    dinner: string;
    main: string;
    vegetarian: string;
    sides: string;
    salad: string;
    dessert: string;
    drink: string;
    empty: string;
    today: string;
    error: string;
    retry: string;
  };
  courses: {
    title: string;
    subtitle: string;
    departmentsEmpty: string;
    loadErrorTitle: string;
    loadErrorText: string;
    retry: string;
    notFoundTitle: string;
    notFoundText: string;
    backToList: string;
    backToDepartment: string;
    viewDepartment: string;
    about: string;
    foundedIn: string;
    hours: string;
    contact: string;
    academicCenter: string;
    linkedCourses: string;
    programsOffered: string;
    undergraduate: string;
    postgraduate: string;
    types: Record<CourseType, string>;
    viewCurriculum: string;
    coordinations: string;
    extension: string;
    duration: string;
    semesters: string;
    active: string;
    courseCode: string;
    coordination: string;
    coordinator: string;
    viceCoordinator: string;
    office: string;
    officeHours: string;
    attendanceMode: string;
    channels: string;
    phone: string;
    email: string;
    curriculum: string;
    totalWorkload: string;
    period: string;
    electives: string;
    subjectCode: string;
    subject: string;
    workload: string;
    credits: string;
    nature: string;
    prerequisites: string;
    none: string;
    obligatory: string;
    optional: string;
    noSubjects: string;
  };
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
      noResults: "Nenhum resultado encontrado.",
      minChars: "Digite ao menos 3 caracteres para ver sugestões.",
      shortcut: "Atalho para pesquisar",
      locating: "Obtendo sua localização...",
      locateDenied: "Não foi possível acessar o GPS do dispositivo.",
      locateOutside: "Você está fora dos limites do campus Sede.",
      department: "Departamento",
      course: "Curso",
    },
    map: {
      title: "Mapa do campus",
      loading: "Carregando o mapa…",
      label: "Mapa interativo do campus",
      zoomIn: "Aproximar",
      zoomOut: "Afastar",
      recenter: "Centralizar mapa",
    },
    language: { label: "Idioma", open: "Trocar idioma" },
    common: { close: "Fechar", cancel: "Cancelar", loading: "Carregando...", minutes: "min", meters: "m" },
    categories: {
      departamento: "Departamento acadêmico",
      administrativo: "Prédio administrativo",
      biblioteca: "Biblioteca & estudo",
      alimentacao: "Alimentação & RU",
      sala: "Sala de aula",
      portaria: "Portaria / parada",
      moradia: "Moradia estudantil",
      apoio: "Apoio e serviços",
      saude: "Saúde",
      auditorio: "Auditório / teatro",
      esporte: "Parque esportivo",
    },
    serviceCard: {
      howToApply: "Como solicitar",
      whereToFind: "Onde encontrar",
      requirements: "Requisitos e documentos",
      deadline: "Prazo",
      openLink: "Consultar edital ou guia",
      newTab: "abre em nova aba",
      newBadge: "Novo",
    },
    placeCard: {
      openNow: "Aberto agora",
      closed: "Fechado agora",
      walk: "a pé",
      fromOrigin: "a partir do Prédio Central",
      hours: "Horário",
      viewFull: "Ver página completa do local",
      save: "Salvar local",
      saved: "Local salvo",
      hoursTo: "às",
    },
    placePage: {
      backToMap: "Voltar ao mapa interativo",
      notFound: "Local não encontrado",
      notFoundText: "Este local não existe ou não está publicado.",
      recommendedRoute: "Trajeto recomendado pelo GPS",
      fromGate: "do Prédio Central",
      traceRoute: "Traçar rota no mapa",
      viewOnMap: "Ver no mapa",
      hours: "Horário de funcionamento",
      contact: "Contato",
      about: "Sobre o local",
      services: "Serviços no local",
      noServices: "Nenhum serviço cadastrado neste local.",
      courses: "Cursos neste local",
      share: "Compartilhar",
      linkCopied: "Link copiado",
      address: "Endereço",
      externalOnly: "A rota leva até a entrada externa do edifício.",
    },
    route: {
      to: "Rota até",
      from: "Saindo de",
      yourLocation: "Sua localização",
      distance: "Distância",
      time: "Tempo a pé",
      end: "Encerrar rota",
      locating: "Obtendo sua localização...",
      chooseOrigin: "Escolha o ponto de partida",
      gpsDenied: "Não foi possível acessar o GPS do dispositivo. Escolha manualmente um prédio ou portaria de partida.",
      outside: "Você está fora dos limites do campus Sede. Escolha um ponto de partida dentro do campus.",
      gates: "Portarias",
      buildings: "Prédios",
      confirm: "Traçar rota",
    },
    guide: {
      breadcrumbLabel: "Trilha de navegação",
      breadcrumbHome: "Início",
      breadcrumbCurrent: "Guia de Recife & RMR",
      defaultOrigin: "Origem Padrão: Campus Dois Irmãos (UFRPE)",
      quickTips: "Dicas Rápidas de Mobilidade",
      heroTitle: "Guia de Recife • Conheça a Cidade Além do Campus",
      heroSubtitle:
        "Selecionamos os pontos culturais, históricos e litorâneos mais emblemáticos da capital pernambucana e arredores.",
      tipsTitle: "Dicas Essenciais para Estudantes na RMR",
      tipsSubtitle: "Facilitando sua circulação autônoma por Recife, Olinda e Região Metropolitana.",
      partnerships: "Convênios & parcerias UFRPE ativas",
      footerBrand: "GuiaRural • UFRPE",
      footerTagline: "— Plataforma Aberta de Mobilidade & Cidadania Universitária",
      footerInstitution: "Universidade Federal Rural de Pernambuco • Pró-Reitoria de Assuntos Estudantis",
      scale: "Escala 1:2500 • Recife-PE",
      errorTitle: "Não foi possível carregar o guia",
      errorText: "Verifique sua conexão e tente novamente.",
      retry: "Tentar novamente",
      saveSpot: "Salvar local",
      unsaveSpot: "Remover local salvo",
    },
    guides: {
      sections: {
        cultura: { title: "Interação cultural", intro: "Diretrizes de convivência e aspectos da cultura brasileira no campus." },
        documentos: { title: "Documentos e editais", intro: "Orientações sobre CPF, visto e editais de mobilidade." },
        calouro: { title: "Guia do calouro", intro: "O essencial para os primeiros dias na UFRPE." },
        recife: { title: "Guia de Recife", intro: "Dicas para viver e se deslocar na cidade." },
      },
      chooseTopic: "Escolha um tópico para ler",
      fallbackNotice: "Parte deste conteúdo ainda não foi traduzida para o idioma escolhido e está sendo exibida em português.",
      unavailable: "Documento temporariamente indisponível. Tente novamente mais tarde.",
      supportLinks: "Links de apoio",
      backToTopics: "Voltar aos tópicos",
      translateHint: "Use o seletor PT / EN / ES para trocar o idioma.",
      sectionsLabel: "Cartilhas de acolhimento",
      emptyReader: "Selecione uma cartilha ao lado para ler o conteúdo completo e os links de apoio.",
      readingTime: "min de leitura",
      searchLabel: "Buscar nas cartilhas",
      searchPlaceholder: "Ex.: CPF, visto, RU, consentimento...",
      searchResults: "resultados em todas as cartilhas",
      noResults: "Nenhuma cartilha encontrada para essa busca.",
      source: "Fonte",
      viewOnMap: "Ver local no mapa",
      progressOf: "de",
      downloadsTitle: "Cartilhas oficiais",
      helpTitle: "Precisa de ajuda?",
      emergencyTitle: "Emergência (ligação gratuita)",
      timelineTitle: "Sua jornada de documentos",
      timelineIntro: "Siga as etapas na ordem. Marque os documentos que já separou — o progresso fica salvo neste navegador.",
      openFolder: "Abrir pasta no Google Drive",
      photoCredit: "Fotos",
      copyLink: "Copiar link",
      linkCopied: "Link copiado!",
      topicsCount: "tópicos",
      stages: { antes: "Antes de viajar", chegada: "Na chegada (até 30 dias)", "primeiras-semanas": "Primeiras semanas", mobilidade: "Editais e mobilidade" },
    },
    notices: {
      title: "Avisos do campus",
      subtitle: "Comunicados da UFRPE sobre o campus Dois Irmãos (Sede).",
      empty: "Nenhum aviso publicado no momento.",
      error: "Não foi possível carregar os avisos.",
      retry: "Tentar novamente",
      portugueseOnly: "",
    },
    services: {
      title: "Serviços",
      subtitle: "Serviços estudantis da UFRPE: como solicitar, requisitos, prazos e links oficiais.",
      searchLabel: "Buscar serviço",
      searchPlaceholder: "Buscar por nome, setor ou assunto",
      categoryFilter: "Filtrar por categoria",
      allCategories: "Todas",
      resultsCount: "serviço(s)",
      empty: "Nenhum serviço publicado no momento.",
      noResults: "Nenhum serviço encontrado com esses filtros.",
      clearFilters: "Limpar filtros",
      error: "Não foi possível carregar os serviços.",
      retry: "Tentar novamente",
      portugueseOnly: "",
    },
    weeklyMenu: {
      title: "Cardápio da semana",
      subtitle: "Restaurante Universitário · almoço 11h–14h · jantar 17h30–19h30",
      lunch: "Almoço",
      dinner: "Jantar",
      main: "Prato principal",
      vegetarian: "Opção vegetariana",
      sides: "Acompanhamentos",
      salad: "Salada",
      dessert: "Sobremesa",
      drink: "Suco",
      empty: "Nenhum cardápio publicado para esta semana.",
      today: "Hoje",
      error: "Não foi possível carregar o cardápio.",
      retry: "Tentar novamente",
    },
    courses: {
      title: "Cursos e departamentos",
      subtitle: "Escolha um departamento para ver seus cursos de graduação e pós-graduação.",
      departmentsEmpty: "Nenhum departamento cadastrado ainda.",
      loadErrorTitle: "Não foi possível carregar os dados",
      loadErrorText: "Verifique sua conexão e tente novamente.",
      retry: "Tentar novamente",
      notFoundTitle: "Não encontramos esta página",
      notFoundText: "O departamento ou curso não existe ou não está mais disponível.",
      backToList: "Cursos e departamentos",
      backToDepartment: "Voltar ao departamento",
      viewDepartment: "Ver departamento",
      about: "Sobre o departamento",
      foundedIn: "Fundado em",
      hours: "Horário de funcionamento",
      contact: "Secretaria e telefone",
      academicCenter: "Centro acadêmico",
      linkedCourses: "Cursos vinculados",
      programsOffered: "programas oferecidos",
      undergraduate: "Graduação",
      postgraduate: "Pós-graduação",
      types: { BACHARELADO: "Bacharelado", LICENCIATURA: "Licenciatura", STRICTO_SENSU: "Stricto sensu" },
      viewCurriculum: "Ver grade",
      coordinations: "Coordenações de curso",
      extension: "Ramal",
      duration: "Duração",
      semesters: "semestres",
      active: "Ativo",
      courseCode: "Código",
      coordination: "Coordenação do curso",
      coordinator: "Coordenação",
      viceCoordinator: "Vice-coordenação",
      office: "Gabinete e expediente",
      officeHours: "Horário de atendimento",
      attendanceMode: "Modalidade de atendimento",
      channels: "Canais oficiais",
      phone: "Telefone",
      email: "E-mail",
      curriculum: "Matriz curricular e cadeiras",
      totalWorkload: "de carga horária total",
      period: "Período",
      electives: "Optativas / Eletivas",
      subjectCode: "Código",
      subject: "Disciplina",
      workload: "Carga horária",
      credits: "créditos",
      nature: "Natureza",
      prerequisites: "Pré-requisitos",
      none: "Nenhum",
      obligatory: "Obrigatória",
      optional: "Optativa",
      noSubjects: "Nenhuma disciplina cadastrada neste período.",
    },
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
      noResults: "No results found.",
      minChars: "Type at least 3 characters to see suggestions.",
      shortcut: "Search shortcut",
      locating: "Getting your location...",
      locateDenied: "Could not access the device GPS.",
      locateOutside: "You are outside the main campus.",
      department: "Department",
      course: "Course",
    },
    map: {
      title: "Campus map",
      loading: "Loading the map…",
      label: "Interactive campus map",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      recenter: "Recenter map",
    },
    language: { label: "Language", open: "Change language" },
    common: { close: "Close", cancel: "Cancel", loading: "Loading...", minutes: "min", meters: "m" },
    categories: {
      departamento: "Academic department",
      administrativo: "Administrative building",
      biblioteca: "Library & study",
      alimentacao: "Food & canteen",
      sala: "Classrooms",
      portaria: "Gate / stop",
      moradia: "Student housing",
      apoio: "Support and services",
      saude: "Health",
      auditorio: "Auditorium",
      esporte: "Sports area",
    },
    serviceCard: {
      howToApply: "How to apply",
      whereToFind: "Where to find it",
      requirements: "Requirements and documents",
      deadline: "Deadline",
      openLink: "View notice or guide",
      newTab: "opens in a new tab",
      newBadge: "New",
    },
    placeCard: {
      openNow: "Open now",
      closed: "Closed now",
      walk: "walk",
      fromOrigin: "from the Central Building",
      hours: "Hours",
      viewFull: "View full place page",
      save: "Save place",
      saved: "Place saved",
      hoursTo: "to",
    },
    placePage: {
      backToMap: "Back to interactive map",
      notFound: "Place not found",
      notFoundText: "This place does not exist or is not published.",
      recommendedRoute: "GPS recommended route",
      fromGate: "from the Central Building",
      traceRoute: "Show route on map",
      viewOnMap: "View on map",
      hours: "Opening hours",
      contact: "Contact",
      about: "About this place",
      services: "Services here",
      noServices: "No services registered at this place.",
      courses: "Courses held here",
      share: "Share",
      linkCopied: "Link copied",
      address: "Address",
      externalOnly: "The route leads to the building's external entrance.",
    },
    route: {
      to: "Route to",
      from: "Starting at",
      yourLocation: "Your location",
      distance: "Distance",
      time: "Walking time",
      end: "End route",
      locating: "Getting your location...",
      chooseOrigin: "Choose a starting point",
      gpsDenied: "Could not access the device GPS. Choose a building or gate to start from.",
      outside: "You are outside the main campus. Choose a starting point on campus.",
      gates: "Gates",
      buildings: "Buildings",
      confirm: "Show route",
    },
    guide: {
      breadcrumbLabel: "Breadcrumb",
      breadcrumbHome: "Home",
      breadcrumbCurrent: "Recife & RMR Guide",
      defaultOrigin: "Default origin: Dois Irmãos Campus (UFRPE)",
      quickTips: "Quick Mobility Tips",
      heroTitle: "Recife Guide • Discover the City Beyond the Campus",
      heroSubtitle:
        "We selected the most emblematic cultural, historic and coastal spots of the capital of Pernambuco and its surroundings.",
      tipsTitle: "Essential Tips for Students in the RMR",
      tipsSubtitle: "Making it easier to get around Recife, Olinda and the Metropolitan Region on your own.",
      partnerships: "Active UFRPE agreements & partnerships",
      footerBrand: "GuiaRural • UFRPE",
      footerTagline: "— Open Platform for Mobility & University Citizenship",
      footerInstitution: "Federal Rural University of Pernambuco • Student Affairs Office",
      scale: "Scale 1:2500 • Recife-PE",
      errorTitle: "Could not load the guide",
      errorText: "Check your connection and try again.",
      retry: "Try again",
      saveSpot: "Save place",
      unsaveSpot: "Remove saved place",
    },
    guides: {
      sections: {
        cultura: { title: "Cultural interaction", intro: "Guidelines for living together and aspects of Brazilian culture on campus." },
        documentos: { title: "Documents and calls", intro: "Guidance on CPF, visas and mobility calls." },
        calouro: { title: "Freshman guide", intro: "The essentials for your first days at UFRPE." },
        recife: { title: "Recife guide", intro: "Tips for living in and getting around the city." },
      },
      chooseTopic: "Choose a topic to read",
      fallbackNotice: "Part of this content has not been translated into the selected language yet and is shown in Portuguese.",
      unavailable: "Document temporarily unavailable. Please try again later.",
      supportLinks: "Support links",
      backToTopics: "Back to topics",
      translateHint: "Use the PT / EN / ES switch to change the language.",
      sectionsLabel: "Welcome guides",
      emptyReader: "Select a guide on the left to read the full content and support links.",
      readingTime: "min read",
      searchLabel: "Search the guides",
      searchPlaceholder: "E.g. CPF, visa, canteen, consent...",
      searchResults: "results across all guides",
      noResults: "No guide matches this search.",
      source: "Source",
      viewOnMap: "View place on map",
      progressOf: "of",
      downloadsTitle: "Official booklets",
      helpTitle: "Need help?",
      emergencyTitle: "Emergency (free calls)",
      timelineTitle: "Your document journey",
      timelineIntro: "Follow the steps in order. Tick the documents you already have — progress is saved in this browser.",
      openFolder: "Open folder in Google Drive",
      photoCredit: "Photos",
      copyLink: "Copy link",
      linkCopied: "Link copied!",
      topicsCount: "topics",
      stages: { antes: "Before travelling", chegada: "On arrival (within 30 days)", "primeiras-semanas": "First weeks", mobilidade: "Calls and mobility" },
    },
    notices: {
      title: "Campus notices",
      subtitle: "UFRPE announcements about the Dois Irmãos (main) campus.",
      empty: "No notices at the moment.",
      error: "Could not load the notices.",
      retry: "Try again",
      portugueseOnly: "Notices are published in Portuguese.",
    },
    services: {
      title: "Services",
      subtitle: "UFRPE student services: how to apply, requirements, deadlines and official links.",
      searchLabel: "Search services",
      searchPlaceholder: "Search by name, office or subject",
      categoryFilter: "Filter by category",
      allCategories: "All",
      resultsCount: "service(s)",
      empty: "No services published at the moment.",
      noResults: "No services match these filters.",
      clearFilters: "Clear filters",
      error: "Could not load the services.",
      retry: "Try again",
      portugueseOnly: "Services are published in Portuguese.",
    },
    weeklyMenu: {
      title: "Weekly menu",
      subtitle: "University Restaurant · lunch 11am–2pm · dinner 5:30pm–7:30pm",
      lunch: "Lunch",
      dinner: "Dinner",
      main: "Main dish",
      vegetarian: "Vegetarian option",
      sides: "Sides",
      salad: "Salad",
      dessert: "Dessert",
      drink: "Juice",
      empty: "No menu published for this week.",
      today: "Today",
      error: "Could not load the menu.",
      retry: "Try again",
    },
    courses: {
      title: "Courses and departments",
      subtitle: "Choose a department to see its undergraduate and graduate courses.",
      departmentsEmpty: "No departments registered yet.",
      loadErrorTitle: "Could not load the data",
      loadErrorText: "Check your connection and try again.",
      retry: "Try again",
      notFoundTitle: "We could not find this page",
      notFoundText: "The department or course does not exist or is no longer available.",
      backToList: "Courses and departments",
      backToDepartment: "Back to the department",
      viewDepartment: "View department",
      about: "About the department",
      foundedIn: "Founded in",
      hours: "Opening hours",
      contact: "Office and phone",
      academicCenter: "Academic center",
      linkedCourses: "Linked courses",
      programsOffered: "programs offered",
      undergraduate: "Undergraduate",
      postgraduate: "Graduate",
      types: { BACHARELADO: "Bachelor's", LICENCIATURA: "Teaching degree", STRICTO_SENSU: "Stricto sensu" },
      viewCurriculum: "View curriculum",
      coordinations: "Course coordination",
      extension: "Ext.",
      duration: "Duration",
      semesters: "semesters",
      active: "Active",
      courseCode: "Code",
      coordination: "Course coordination",
      coordinator: "Coordinator",
      viceCoordinator: "Vice-coordinator",
      office: "Office and hours",
      officeHours: "Service hours",
      attendanceMode: "Service mode",
      channels: "Official channels",
      phone: "Phone",
      email: "E-mail",
      curriculum: "Curriculum and subjects",
      totalWorkload: "total workload",
      period: "Term",
      electives: "Electives",
      subjectCode: "Code",
      subject: "Subject",
      workload: "Workload",
      credits: "credits",
      nature: "Type",
      prerequisites: "Prerequisites",
      none: "None",
      obligatory: "Required",
      optional: "Elective",
      noSubjects: "No subjects registered for this term.",
    },
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
      noResults: "No se encontraron resultados.",
      minChars: "Escribe al menos 3 caracteres para ver sugerencias.",
      shortcut: "Atajo para buscar",
      locating: "Obteniendo tu ubicación...",
      locateDenied: "No fue posible acceder al GPS del dispositivo.",
      locateOutside: "Estás fuera de los límites del campus Sede.",
      department: "Departamento",
      course: "Curso",
    },
    map: {
      title: "Mapa del campus",
      loading: "Cargando el mapa…",
      label: "Mapa interactivo del campus",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      recenter: "Centrar mapa",
    },
    language: { label: "Idioma", open: "Cambiar idioma" },
    common: { close: "Cerrar", cancel: "Cancelar", loading: "Cargando...", minutes: "min", meters: "m" },
    categories: {
      departamento: "Departamento académico",
      administrativo: "Edificio administrativo",
      biblioteca: "Biblioteca y estudio",
      alimentacao: "Alimentación y comedor",
      sala: "Aulas",
      portaria: "Portería / parada",
      moradia: "Vivienda estudiantil",
      apoio: "Apoyo y servicios",
      saude: "Salud",
      auditorio: "Auditorio",
      esporte: "Área deportiva",
    },
    serviceCard: {
      howToApply: "Cómo solicitar",
      whereToFind: "Dónde encontrarlo",
      requirements: "Requisitos y documentos",
      deadline: "Plazo",
      openLink: "Consultar convocatoria o guía",
      newTab: "se abre en una pestaña nueva",
      newBadge: "Nuevo",
    },
    placeCard: {
      openNow: "Abierto ahora",
      closed: "Cerrado ahora",
      walk: "a pie",
      fromOrigin: "desde el Edificio Central",
      hours: "Horario",
      viewFull: "Ver página completa del lugar",
      save: "Guardar lugar",
      saved: "Lugar guardado",
      hoursTo: "a",
    },
    placePage: {
      backToMap: "Volver al mapa interactivo",
      notFound: "Lugar no encontrado",
      notFoundText: "Este lugar no existe o no está publicado.",
      recommendedRoute: "Trayecto recomendado por GPS",
      fromGate: "desde el Edificio Central",
      traceRoute: "Trazar ruta en el mapa",
      viewOnMap: "Ver en el mapa",
      hours: "Horario de atención",
      contact: "Contacto",
      about: "Sobre el lugar",
      services: "Servicios en el lugar",
      noServices: "No hay servicios registrados en este lugar.",
      courses: "Cursos en este lugar",
      share: "Compartir",
      linkCopied: "Enlace copiado",
      address: "Dirección",
      externalOnly: "La ruta lleva hasta la entrada externa del edificio.",
    },
    route: {
      to: "Ruta hasta",
      from: "Saliendo de",
      yourLocation: "Tu ubicación",
      distance: "Distancia",
      time: "Tiempo a pie",
      end: "Terminar ruta",
      locating: "Obteniendo tu ubicación...",
      chooseOrigin: "Elige el punto de partida",
      gpsDenied: "No fue posible acceder al GPS del dispositivo. Elige manualmente un edificio o portería de partida.",
      outside: "Estás fuera de los límites del campus Sede. Elige un punto de partida dentro del campus.",
      gates: "Porterías",
      buildings: "Edificios",
      confirm: "Trazar ruta",
    },
    guide: {
      breadcrumbLabel: "Ruta de navegación",
      breadcrumbHome: "Inicio",
      breadcrumbCurrent: "Guía de Recife & RMR",
      defaultOrigin: "Origen predeterminado: Campus Dois Irmãos (UFRPE)",
      quickTips: "Consejos Rápidos de Movilidad",
      heroTitle: "Guía de Recife • Conoce la Ciudad Más Allá del Campus",
      heroSubtitle:
        "Seleccionamos los puntos culturales, históricos y costeros más emblemáticos de la capital de Pernambuco y alrededores.",
      tipsTitle: "Consejos Esenciales para Estudiantes en la RMR",
      tipsSubtitle: "Facilitando tu circulación autónoma por Recife, Olinda y la Región Metropolitana.",
      partnerships: "Convenios y alianzas UFRPE activos",
      footerBrand: "GuiaRural • UFRPE",
      footerTagline: "— Plataforma Abierta de Movilidad y Ciudadanía Universitaria",
      footerInstitution: "Universidad Federal Rural de Pernambuco • Pro-Rectoría de Asuntos Estudiantiles",
      scale: "Escala 1:2500 • Recife-PE",
      errorTitle: "No se pudo cargar la guía",
      errorText: "Revisa tu conexión e inténtalo de nuevo.",
      retry: "Intentar de nuevo",
      saveSpot: "Guardar lugar",
      unsaveSpot: "Quitar lugar guardado",
    },
    guides: {
      sections: {
        cultura: { title: "Interacción cultural", intro: "Pautas de convivencia y aspectos de la cultura brasileña en el campus." },
        documentos: { title: "Documentos y convocatorias", intro: "Orientaciones sobre CPF, visa y convocatorias de movilidad." },
        calouro: { title: "Guía del novato", intro: "Lo esencial para los primeros días en la UFRPE." },
        recife: { title: "Guía de Recife", intro: "Consejos para vivir y moverse por la ciudad." },
      },
      chooseTopic: "Elige un tema para leer",
      fallbackNotice: "Parte de este contenido aún no se ha traducido al idioma elegido y se muestra en portugués.",
      unavailable: "Documento temporalmente no disponible. Inténtalo más tarde.",
      supportLinks: "Enlaces de apoyo",
      backToTopics: "Volver a los temas",
      translateHint: "Usa el selector PT / EN / ES para cambiar el idioma.",
      sectionsLabel: "Guías de acogida",
      emptyReader: "Selecciona una guía al lado para leer el contenido completo y los enlaces de apoyo.",
      readingTime: "min de lectura",
      searchLabel: "Buscar en las guías",
      searchPlaceholder: "Ej.: CPF, visa, comedor, consentimiento...",
      searchResults: "resultados en todas las guías",
      noResults: "Ninguna guía coincide con esta búsqueda.",
      source: "Fuente",
      viewOnMap: "Ver lugar en el mapa",
      progressOf: "de",
      downloadsTitle: "Cartillas oficiales",
      helpTitle: "¿Necesitas ayuda?",
      emergencyTitle: "Emergencia (llamada gratuita)",
      timelineTitle: "Tu recorrido de documentos",
      timelineIntro: "Sigue las etapas en orden. Marca los documentos que ya tienes — el progreso se guarda en este navegador.",
      openFolder: "Abrir carpeta en Google Drive",
      photoCredit: "Fotos",
      copyLink: "Copiar enlace",
      linkCopied: "¡Enlace copiado!",
      topicsCount: "temas",
      stages: { antes: "Antes de viajar", chegada: "Al llegar (hasta 30 días)", "primeiras-semanas": "Primeras semanas", mobilidade: "Convocatorias y movilidad" },
    },
    notices: {
      title: "Avisos del campus",
      subtitle: "Comunicados de la UFRPE sobre el campus Dois Irmãos (Sede).",
      empty: "No hay avisos publicados por el momento.",
      error: "No fue posible cargar los avisos.",
      retry: "Intentar de nuevo",
      portugueseOnly: "Los avisos se publican en portugués.",
    },
    services: {
      title: "Servicios",
      subtitle: "Servicios estudiantiles de la UFRPE: cómo solicitarlos, requisitos, plazos y enlaces oficiales.",
      searchLabel: "Buscar servicio",
      searchPlaceholder: "Buscar por nombre, sector o tema",
      categoryFilter: "Filtrar por categoría",
      allCategories: "Todas",
      resultsCount: "servicio(s)",
      empty: "No hay servicios publicados por el momento.",
      noResults: "Ningún servicio coincide con estos filtros.",
      clearFilters: "Limpiar filtros",
      error: "No fue posible cargar los servicios.",
      retry: "Intentar de nuevo",
      portugueseOnly: "Los servicios se publican en portugués.",
    },
    weeklyMenu: {
      title: "Menú de la semana",
      subtitle: "Restaurante Universitario · almuerzo 11h–14h · cena 17h30–19h30",
      lunch: "Almuerzo",
      dinner: "Cena",
      main: "Plato principal",
      vegetarian: "Opción vegetariana",
      sides: "Acompañamientos",
      salad: "Ensalada",
      dessert: "Postre",
      drink: "Jugo",
      empty: "No hay menú publicado para esta semana.",
      today: "Hoy",
      error: "No fue posible cargar el menú.",
      retry: "Intentar de nuevo",
    },
    courses: {
      title: "Cursos y departamentos",
      subtitle: "Elige un departamento para ver sus cursos de grado y posgrado.",
      departmentsEmpty: "Aún no hay departamentos registrados.",
      loadErrorTitle: "No se pudieron cargar los datos",
      loadErrorText: "Revisa tu conexión e inténtalo de nuevo.",
      retry: "Intentar de nuevo",
      notFoundTitle: "No encontramos esta página",
      notFoundText: "El departamento o curso no existe o ya no está disponible.",
      backToList: "Cursos y departamentos",
      backToDepartment: "Volver al departamento",
      viewDepartment: "Ver departamento",
      about: "Sobre el departamento",
      foundedIn: "Fundado en",
      hours: "Horario de atención",
      contact: "Secretaría y teléfono",
      academicCenter: "Centro académico",
      linkedCourses: "Cursos vinculados",
      programsOffered: "programas ofrecidos",
      undergraduate: "Grado",
      postgraduate: "Posgrado",
      types: { BACHARELADO: "Licenciatura (bachillerato)", LICENCIATURA: "Profesorado", STRICTO_SENSU: "Stricto sensu" },
      viewCurriculum: "Ver malla",
      coordinations: "Coordinaciones de curso",
      extension: "Int.",
      duration: "Duración",
      semesters: "semestres",
      active: "Activo",
      courseCode: "Código",
      coordination: "Coordinación del curso",
      coordinator: "Coordinación",
      viceCoordinator: "Vicecoordinación",
      office: "Despacho y horario",
      officeHours: "Horario de atención",
      attendanceMode: "Modalidad de atención",
      channels: "Canales oficiales",
      phone: "Teléfono",
      email: "Correo electrónico",
      curriculum: "Malla curricular y asignaturas",
      totalWorkload: "de carga horaria total",
      period: "Período",
      electives: "Optativas / Electivas",
      subjectCode: "Código",
      subject: "Asignatura",
      workload: "Carga horaria",
      credits: "créditos",
      nature: "Naturaleza",
      prerequisites: "Requisitos previos",
      none: "Ninguno",
      obligatory: "Obligatoria",
      optional: "Optativa",
      noSubjects: "No hay asignaturas registradas en este período.",
    },
  },
};
