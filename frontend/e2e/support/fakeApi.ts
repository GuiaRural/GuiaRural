import type { Page, Route } from "@playwright/test";

// Backend simulado para os testes de interface. É interceptado no navegador (page.route em /api/**), então o
// Next, o React e as telas rodam de verdade; só as respostas do Spring Boot são substituídas. Tem estado
// (cursos, mensagens, sessão), para que "salvar" e "excluir" apareçam nas páginas públicas como no sistema real.
// Todos os dados são FICTÍCIOS: nenhum dado real da UFRPE ou de pessoas.

export type Permission = "geral" | "editor" | "leitura";

type Subject = {
  id: number;
  period: number | null;
  code: string;
  name: string;
  syllabus: string | null;
  workloadHours: number;
  credits: number | null;
  nature: "OBRIGATORIA" | "OPTATIVA";
  prerequisites: string[];
};

type Course = {
  id: number;
  departmentId: number;
  code: string | null;
  name: string;
  level: "GRADUACAO" | "POS";
  type: "BACHARELADO" | "LICENCIATURA" | "STRICTO_SENSU";
  modality: string | null;
  shift: string | null;
  durationSemesters: number | null;
  totalWorkloadHours: number | null;
  mecGrade: number | null;
  capesGrade: number | null;
  description: string | null;
  active: boolean;
  coordination: {
    coordinatorName: string | null;
    viceCoordinatorName: string | null;
    officeLocation: string | null;
    officeHours: string | null;
    attendanceMode: string | null;
    phone: string | null;
    extension: string | null;
    email: string | null;
    secondaryEmail: string | null;
  };
  subjects: Subject[];
};

type Department = {
  id: number;
  code: string | null;
  name: string;
  shortName: string | null;
  academicCenter: string | null;
  description: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  email: string | null;
  foundedYear: number | null;
  placeSlug: string | null;
};

export type StoredMessage = {
  id: number;
  nome: string | null;
  contato: string | null;
  mensagem: string;
  createdAt: string;
  read: boolean;
  readAt: string | null;
};

type PlaceSeed = { slug: string; name: string; shortName: string; category: string; lat: number; lng: number; departments: { id: number; name: string }[] };

// Contas de teste (Massa de Dados da planilha). A senha é fictícia.
const ACCOUNTS: Record<string, { name: string; sector: string; permission: Permission }> = {
  "coord.ti@ufrpe.br": { name: "Coordenação de TI", sector: "Coordenação de TI", permission: "geral" },
  "leitura.teste@ufrpe.br": { name: "Conta Somente Leitura", sector: "Comunicação", permission: "leitura" },
};
export const TEST_PASSWORD = "Guia@2026";

const PLACES: PlaceSeed[] = [
  { slug: "reitoria", name: "Prédio Central (Reitoria)", shortName: "Reitoria", category: "administrativo", lat: -8.0165, lng: -34.9478, departments: [] },
  { slug: "biblioteca", name: "Biblioteca Central", shortName: "Biblioteca", category: "biblioteca", lat: -8.0135867, lng: -34.9487799, departments: [] },
  { slug: "dc", name: "CEAGRI II / DC", shortName: "DC", category: "departamento", lat: -8.0176682, lng: -34.9445171, departments: [{ id: 1, name: "Departamento de Computação" }] },
];

const RECIFE_GUIDE = {
  categories: [
    { slug: "lazer-natureza", label: "Lazer & Natureza" },
    { slug: "cultura-historia", label: "Cultura & História" },
    { slug: "gastronomia", label: "Gastronomia" },
  ],
  spots: [
    spot("parque-teste", "Parque Fictício do Recife", "lazer-natureza", "Rua dos Testes, 100", "Área verde fictícia para os testes automatizados.", "08:00 – 18:00"),
    spot("museu-teste", "Museu Fictício da Cidade", "cultura-historia", "Av. dos Testes, 200", "Museu fictício com exposições de teste.", "09:00 – 17:00"),
    spot("mercado-teste", "Mercado Fictício", "gastronomia", "Praça dos Testes, 300", "Mercado fictício com comidas de teste.", "10:00 – 22:00"),
  ],
  tips: [],
  support: null,
};

function spot(slug: string, title: string, category: string, address: string, description: string, hours: string) {
  return {
    slug,
    title,
    address,
    description,
    category,
    tag: null,
    badge: null,
    distance: null,
    image: null,
    detailsLayout: "stack",
    details: [{ label: "Horário de funcionamento", text: hours }],
  };
}

function seedCourses(): Course[] {
  const coordination = (name: string, extension: string, email: string) => ({
    coordinatorName: name,
    viceCoordinatorName: null,
    officeLocation: "Sala de teste 1",
    officeHours: "09:00 às 12:00",
    attendanceMode: "Presencial e por e-mail",
    phone: null,
    extension,
    email,
    secondaryEmail: null,
  });
  return [
    {
      id: 10,
      departmentId: 1,
      code: "T01",
      name: "Bacharelado em Computação Fictícia",
      level: "GRADUACAO",
      type: "BACHARELADO",
      modality: "Presencial",
      shift: "Integral",
      durationSemesters: 8,
      totalWorkloadHours: 3200,
      mecGrade: 5,
      capesGrade: null,
      description: "Curso fictício usado nos testes automatizados.",
      active: true,
      coordination: coordination("Coordenador Teste Um", "4101", "coord.um@example.com"),
      subjects: [
        { id: 1001, period: 1, code: "TST101", name: "Algoritmos de Teste", syllabus: null, workloadHours: 60, credits: 4, nature: "OBRIGATORIA", prerequisites: [] },
        { id: 1002, period: 2, code: "TST201", name: "Estruturas de Teste", syllabus: null, workloadHours: 60, credits: 4, nature: "OBRIGATORIA", prerequisites: ["TST101"] },
      ],
    },
    {
      id: 11,
      departmentId: 1,
      code: "T02",
      name: "Licenciatura em Computação Fictícia",
      level: "GRADUACAO",
      type: "LICENCIATURA",
      modality: "Presencial",
      shift: "Noturno",
      durationSemesters: 9,
      totalWorkloadHours: 3000,
      mecGrade: 4,
      capesGrade: null,
      description: null,
      active: true,
      coordination: coordination("Coordenadora Teste Dois", "4102", "coord.dois@example.com"),
      subjects: [{ id: 1101, period: 1, code: "LIC101", name: "Didática de Teste", syllabus: null, workloadHours: 45, credits: 3, nature: "OBRIGATORIA", prerequisites: [] }],
    },
    {
      id: 12,
      departmentId: 1,
      code: "T03",
      name: "Curso Descartável para Exclusão",
      level: "GRADUACAO",
      type: "BACHARELADO",
      modality: "Presencial",
      shift: "Diurno",
      durationSemesters: 8,
      totalWorkloadHours: 2800,
      mecGrade: 3,
      capesGrade: null,
      description: "Curso fictício criado só para ser excluído nos testes.",
      active: true,
      coordination: coordination("Coordenador Teste Três", "4103", "coord.tres@example.com"),
      subjects: [{ id: 1201, period: 1, code: "DEL101", name: "Disciplina Descartável", syllabus: null, workloadHours: 30, credits: 2, nature: "OBRIGATORIA", prerequisites: [] }],
    },
  ];
}

function seedDepartments(): Department[] {
  return [
    {
      id: 1,
      code: "DTEST1",
      name: "Departamento de Computação",
      shortName: "DC",
      academicCenter: "Centro Acadêmico de Teste",
      description: "Departamento fictício com cursos vinculados.",
      address: "Campus Dois Irmãos, bloco de teste",
      hours: "08:00 às 17:00",
      phone: null,
      email: null,
      foundedYear: null,
      placeSlug: "dc",
    },
    {
      id: 2,
      code: "DTEST2",
      name: "Departamento sem Cursos",
      shortName: "DSC",
      academicCenter: "Centro Acadêmico de Teste",
      description: "Departamento fictício sem nenhum curso vinculado.",
      address: null,
      hours: null,
      phone: null,
      email: null,
      foundedYear: null,
      placeSlug: null,
    },
  ];
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
const problem = (route: Route, status: number, detail: string, extra: object = {}) =>
  json(route, status, { status, detail, ...extra });

export class FakeApi {
  courses = seedCourses();
  departments = seedDepartments();
  messages: StoredMessage[] = [];
  /** Cabeçalho de quem está logado; null = sem sessão. */
  private sessionEmail: string | null = null;
  private nextMessageId = 1;
  /** Instantes (ms) dos envios que contam para o limite de 20 mensagens em 10 minutos (todos os visitantes). */
  private sendTimes: number[] = [];
  private clockOffsetMs = 0;
  /** Simula queda de conexão: toda chamada a estes caminhos é abortada. */
  private offlinePaths = new Set<string>();
  /** Chamadas a /api que nenhum teste previu (ajuda a achar mock faltando). */
  readonly unhandled: string[] = [];
  /** Corpos das escritas recebidas, na ordem (para conferir o que a tela enviou). */
  readonly writes: { method: string; path: string; body: unknown }[] = [];

  static readonly RATE_LIMIT = 20;
  static readonly RATE_WINDOW_MS = 10 * 60 * 1000;

  private now() {
    return Date.now() + this.clockOffsetMs;
  }

  /** Entra no painel sem passar pela tela de login (para os casos que não testam o login). */
  loginAs(email: string) {
    this.sessionEmail = email;
  }

  setOffline(path: string, offline: boolean) {
    if (offline) this.offlinePaths.add(path);
    else this.offlinePaths.delete(path);
  }

  /** Simula outros visitantes que já enviaram mensagens na janela de 10 minutos. */
  preloadSends(count: number) {
    for (let i = 0; i < count; i++) this.sendTimes.push(this.now());
  }

  /** Avança o relógio do servidor simulado. */
  advanceClock(ms: number) {
    this.clockOffsetMs += ms;
  }

  seedMessage(partial: Partial<StoredMessage> & { mensagem: string }): StoredMessage {
    const message: StoredMessage = {
      id: this.nextMessageId++,
      nome: null,
      contato: null,
      createdAt: new Date(this.now()).toISOString(),
      read: false,
      readAt: null,
      ...partial,
    };
    this.messages.push(message);
    return message;
  }

  course(id: number) {
    return this.courses.find((c) => c.id === id);
  }

  async install(page: Page) {
    await page.route("**/api/**", (route) => this.handle(route));
  }

  // ---- DTOs ----

  private departmentDto(d: Department) {
    return { ...d, lang: "pt", machineTranslated: false, translatedLangs: [] };
  }

  private summaryDto(c: Course) {
    const { id, departmentId, code, name, level, type, modality, shift, durationSemesters, mecGrade, capesGrade, description, active, coordination } = c;
    return { id, departmentId, code, name, level, type, modality, shift, durationSemesters, mecGrade, capesGrade, description, active, officeLocation: coordination.officeLocation, lang: "pt" };
  }

  private detailDto(c: Course) {
    const d = this.departments.find((x) => x.id === c.departmentId);
    return {
      ...c,
      departmentName: d?.name ?? "",
      departmentShortName: d?.shortName ?? null,
      academicCenter: d?.academicCenter ?? null,
      lang: "pt",
      machineTranslated: false,
      translatedLangs: [],
    };
  }

  private placeDto(p: PlaceSeed) {
    return {
      slug: p.slug,
      name: p.name,
      shortName: p.shortName,
      category: p.category,
      status: "publicado",
      latitude: p.lat,
      longitude: p.lng,
      coordinatesSource: null,
      address: "Campus Dois Irmãos (endereço de teste)",
      hours: null,
      description: `${p.name}: local fictício dos testes automatizados.`,
      contacts: [],
      services: [],
      courses: [],
      departments: p.departments,
      photoUrl: null,
      lang: "pt",
      machineTranslated: false,
      translatedLangs: [],
    };
  }

  private session() {
    if (!this.sessionEmail) return null;
    const account = ACCOUNTS[this.sessionEmail];
    return { adminId: 1, email: this.sessionEmail, ...account };
  }

  // ---- roteador ----

  private async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, "");
    const method = request.method();

    if (this.offlinePaths.has(path)) return route.abort("internetdisconnected");

    let body: unknown;
    if (method !== "GET") {
      try {
        body = request.postDataJSON();
      } catch {
        body = undefined;
      }
      this.writes.push({ method, path, body });
    }

    const lang = url.searchParams.get("lang") ?? "pt";
    void lang; // só português nos dados simulados

    // --- autenticação ---
    if (path === "/auth/login" && method === "POST") {
      const { email, password } = body as { email: string; password: string };
      if (!ACCOUNTS[email] || password !== TEST_PASSWORD) return problem(route, 401, "Credenciais inválidas", { reason: "invalid" });
      this.sessionEmail = email;
      return json(route, 200, this.session());
    }
    if (path === "/auth/me") {
      const s = this.session();
      return s ? json(route, 200, s) : problem(route, 401, "Não autenticado");
    }
    if (path === "/auth/logout" && method === "POST") {
      this.sessionEmail = null;
      return route.fulfill({ status: 204 });
    }

    // --- leituras públicas ---
    if (path === "/places" && method === "GET") return json(route, 200, PLACES.map((p) => this.placeDto(p)));

    if (path === "/departments" && method === "GET") return json(route, 200, this.departments.map((d) => this.departmentDto(d)));
    let m = path.match(/^\/departments\/(\d+)$/);
    if (m && method === "GET") {
      const d = this.departments.find((x) => x.id === Number(m![1]));
      return d ? json(route, 200, this.departmentDto(d)) : problem(route, 404, "Departamento não encontrado");
    }
    m = path.match(/^\/departments\/(\d+)\/courses$/);
    if (m && method === "GET") return json(route, 200, this.departmentCourses(Number(m[1])));

    if (path === "/courses" && method === "GET") return json(route, 200, this.courses.filter((c) => c.active).map((c) => this.summaryDto(c)));
    m = path.match(/^\/courses\/(\d+)$/);
    if (m && method === "GET") {
      const c = this.course(Number(m[1]));
      return c?.active ? json(route, 200, this.detailDto(c)) : problem(route, 404, "Curso não encontrado");
    }

    if (path === "/search" && method === "GET") return json(route, 200, this.search(url.searchParams.get("q") ?? ""));

    if (path === "/guide/recife" && method === "GET") return json(route, 200, RECIFE_GUIDE);

    // --- listas que só o painel inicial consulta (vazias: os testes não dependem delas) ---
    if (method === "GET" && ["/admin/places", "/menus", "/admin/audit-logs"].includes(path)) {
      return this.session() ? json(route, 200, []) : problem(route, 401, "Não autenticado");
    }

    // --- painel: cursos (exigem login; escrita exige perfil geral ou editor) ---
    if (path.startsWith("/admin/courses") || (path.startsWith("/courses") && method !== "GET")) {
      const s = this.session();
      if (!s) return problem(route, 401, "Não autenticado");
      if (path === "/admin/courses") return json(route, 200, this.courses.map((c) => this.summaryDto(c)));
      m = path.match(/^\/admin\/courses\/(\d+)$/);
      if (m) {
        const c = this.course(Number(m[1]));
        return c ? json(route, 200, this.detailDto(c)) : problem(route, 404, "Curso não encontrado");
      }
      if (s.permission === "leitura") return problem(route, 403, "Sem permissão");
      m = path.match(/^\/courses\/(\d+)$/);
      if (m && method === "PUT") return this.updateCourse(route, Number(m[1]), body as Record<string, unknown>);
      if (m && method === "DELETE") {
        const id = Number(m[1]);
        if (!this.course(id)) return problem(route, 404, "Curso não encontrado");
        this.courses = this.courses.filter((c) => c.id !== id);
        return route.fulfill({ status: 204 });
      }
    }

    // --- mensagens para a equipe (UC39) ---
    if (path === "/messages" && method === "POST") return this.postMessage(route, body as { nome: string; contato: string; mensagem: string });
    if (path === "/messages" && method === "GET") {
      if (!this.session()) return problem(route, 401, "Não autenticado");
      return json(route, 200, [...this.messages].reverse());
    }
    m = path.match(/^\/messages\/(\d+)$/);
    if (m && method === "PATCH") {
      const s = this.session();
      if (!s) return problem(route, 401, "Não autenticado");
      if (s.permission === "leitura") return problem(route, 403, "Sem permissão");
      const message = this.messages.find((x) => x.id === Number(m![1]));
      if (!message) return problem(route, 404, "Mensagem não encontrada");
      message.read = (body as { read: boolean }).read;
      message.readAt = message.read ? new Date(this.now()).toISOString() : null;
      return json(route, 200, message);
    }

    this.unhandled.push(`${method} ${path}`);
    return problem(route, 404, `Rota não simulada: ${method} ${path}`);
  }

  private departmentCourses(departmentId: number) {
    const active = this.courses.filter((c) => c.departmentId === departmentId && c.active);
    const groupOf = (level: "GRADUACAO" | "POS") => ({ level, courses: active.filter((c) => c.level === level).map((c) => this.summaryDto(c)) });
    return {
      departmentId,
      programsOffered: active.length,
      groups: [groupOf("GRADUACAO"), groupOf("POS")].filter((g) => g.courses.length > 0),
      coordinations: active
        .filter((c) => c.coordination.coordinatorName)
        .map((c) => ({
          courseId: c.id,
          courseName: c.name,
          coordinatorName: c.coordination.coordinatorName,
          extension: c.coordination.extension,
          email: c.coordination.email,
        })),
    };
  }

  private search(query: string) {
    const q = norm(query.trim());
    if (q.length < 3) return [];
    const departments = this.departments
      .filter((d) => norm(d.name).includes(q) || norm(d.shortName ?? "").includes(q))
      .map((d) => ({ type: "DEPARTMENT", id: d.id, slug: null, name: d.name, detail: null }));
    const courses = this.courses
      .filter((c) => c.active && norm(c.name).includes(q))
      .map((c) => ({ type: "COURSE", id: c.id, slug: null, name: c.name, detail: this.departments.find((d) => d.id === c.departmentId)?.name ?? null }));
    return [...departments, ...courses];
  }

  private updateCourse(route: Route, id: number, body: Record<string, unknown>) {
    const course = this.course(id);
    if (!course) return problem(route, 404, "Curso não encontrado");
    const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
    if (!text(body.name)) return problem(route, 400, "Dados inválidos", { fields: { name: "O nome do curso é obrigatório." } });
    Object.assign(course, {
      departmentId: body.departmentId as number,
      name: body.name as string,
      level: body.level as Course["level"],
      type: body.type as Course["type"],
      code: text(body.code),
      modality: text(body.modality),
      shift: text(body.shift),
      durationSemesters: (body.durationSemesters as number | null) ?? null,
      totalWorkloadHours: (body.totalWorkloadHours as number | null) ?? null,
      mecGrade: (body.mecGrade as number | null) ?? null,
      capesGrade: (body.capesGrade as number | null) ?? null,
      description: text(body.description),
      active: body.active as boolean,
    });
    course.coordination = {
      coordinatorName: text(body.coordinatorName),
      viceCoordinatorName: text(body.viceCoordinatorName),
      officeLocation: text(body.officeLocation),
      officeHours: text(body.officeHours),
      attendanceMode: text(body.attendanceMode),
      phone: text(body.phone),
      extension: text(body.extension),
      email: text(body.email),
      secondaryEmail: text(body.secondaryEmail),
    };
    // A matriz enviada substitui a anterior (regra do backend).
    if (Array.isArray(body.subjects)) {
      let next = 5000 + id * 100;
      course.subjects = (body.subjects as Omit<Subject, "id">[]).map((s) => ({ ...s, id: next++ }));
    }
    return json(route, 200, this.detailDto(course));
  }

  private postMessage(route: Route, body: { nome: string; contato: string; mensagem: string }) {
    const now = this.now();
    this.sendTimes = this.sendTimes.filter((t) => now - t < FakeApi.RATE_WINDOW_MS);
    if (this.sendTimes.length >= FakeApi.RATE_LIMIT) {
      return problem(route, 429, "Muitas mensagens em pouco tempo.");
    }
    this.sendTimes.push(now);
    this.seedMessage({ nome: body.nome || null, contato: body.contato || null, mensagem: body.mensagem });
    return route.fulfill({ status: 204 });
  }
}
