import type { Language } from "../i18n/dictionaries";
import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

// Ponto único de acesso a departamentos e cursos (backend: /api/departments e /api/courses).
// Os tipos espelham os DTOs do backend. Cursos, departamentos e locais têm tradução (?lang=, com o português quando falta).

export type CourseLevel = "GRADUACAO" | "POS";
export type CourseType = "BACHARELADO" | "LICENCIATURA" | "STRICTO_SENSU";
export type SubjectNature = "OBRIGATORIA" | "OPTATIVA";

export type Department = {
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
  // Local onde o departamento funciona; null se não houver local publicado vinculado.
  placeSlug: string | null;
  // Idioma em que `name` de fato veio (pt quando faltou a tradução), para o atributo lang do elemento.
  lang: Language;
  // O texto veio de uma tradução automática que ainda espera revisão humana.
  machineTranslated: boolean;
  // Idiomas em que o departamento tem tradução do nome.
  translatedLangs: Language[];
};

export type CourseSummary = {
  id: number;
  departmentId: number;
  code: string | null;
  name: string;
  level: CourseLevel;
  type: CourseType;
  modality: string | null;
  shift: string | null;
  durationSemesters: number | null;
  mecGrade: number | null;
  capesGrade: number | null;
  description: string | null;
  officeLocation: string | null;
  // Sempre true nas rotas públicas; só o painel recebe os cursos inativos.
  active: boolean;
  // Idioma em que `name` de fato veio (pt quando faltou a tradução), para o atributo lang do elemento.
  lang: Language;
};

export type Coordination = {
  courseId: number;
  courseName: string;
  coordinatorName: string;
  extension: string | null;
  email: string | null;
};

// Já vem ordenado pelo backend: níveis e cursos na ordem do RN-UC37-01.
export type DepartmentCourses = {
  departmentId: number;
  programsOffered: number;
  groups: { level: CourseLevel; courses: CourseSummary[] }[];
  coordinations: Coordination[];
};

export type Subject = {
  id: number;
  // null = bloco "Optativas / Eletivas".
  period: number | null;
  code: string;
  name: string;
  syllabus: string | null;
  workloadHours: number;
  credits: number | null;
  nature: SubjectNature;
  prerequisites: string[];
};

export type CourseDetail = Omit<CourseSummary, "departmentId" | "officeLocation"> & {
  // O texto veio de uma tradução automática que ainda espera revisão humana.
  machineTranslated: boolean;
  // Idiomas em que o curso tem tradução do nome (o painel usa para avisar que o texto pode defasar).
  translatedLangs: Language[];
  totalWorkloadHours: number | null;
  departmentId: number;
  departmentName: string;
  departmentShortName: string | null;
  academicCenter: string | null;
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

// Lista plana dos cursos ativos (ex.: seletor de "cursos vinculados" do formulário de local).
export const getCourses = () => apiGet<CourseSummary[]>("/courses");

export const getDepartments = (language: Language = "pt") => apiGet<Department[]>(`/departments?lang=${language}`);

// useApi aceita um argumento só: o id e o idioma vão juntos ("12:en"), e a página refaz a chamada ao trocar de idioma.
export type CourseKey = `${string}:${Language}`;

function splitKey(key: CourseKey): { id: string; lang: Language } {
  const at = key.lastIndexOf(":");
  return { id: key.slice(0, at), lang: key.slice(at + 1) as Language };
}

export function getDepartment(key: CourseKey) {
  const { id, lang } = splitKey(key);
  return apiGet<Department>(`/departments/${encodeURIComponent(id)}?lang=${lang}`);
}

export function getDepartmentCourses(key: CourseKey) {
  const { id, lang } = splitKey(key);
  return apiGet<DepartmentCourses>(`/departments/${encodeURIComponent(id)}/courses?lang=${lang}`);
}

export function getCourse(key: CourseKey) {
  const { id, lang } = splitKey(key);
  return apiGet<CourseDetail>(`/courses/${encodeURIComponent(id)}?lang=${lang}`);
}

// ---------------------------------------------------------------------------------------------------------------
// Painel (UC35, UC36): ler pelas rotas /admin (incluem inativos) e escrever em /courses. Os limites e as regras
// abaixo espelham o CourseRequestDTO e o CourseService; o servidor valida de novo e é quem manda.
// ---------------------------------------------------------------------------------------------------------------

// O formulário trabalha com texto; `payloadOf` converte para o que a API espera.
export type CourseInput = {
  departmentId: string;
  name: string;
  level: CourseLevel | "";
  type: CourseType | "";
  code: string;
  modality: string;
  shift: string;
  durationSemesters: string;
  totalWorkloadHours: string;
  mecGrade: string;
  capesGrade: string;
  description: string;
  active: boolean;
  coordinatorName: string;
  viceCoordinatorName: string;
  officeLocation: string;
  officeHours: string;
  attendanceMode: string;
  phone: string;
  extension: string;
  email: string;
  secondaryEmail: string;
  // Matriz curricular (5c): enviada inteira a cada salvamento; ela substitui a anterior.
  subjects: SubjectInput[];
};

// Uma disciplina no formulário. `key` só identifica a linha na tela; `period` vazio = "Optativas / Eletivas".
export type SubjectInput = {
  key: number;
  period: string;
  code: string;
  name: string;
  // Ainda sem campo na tela: é devolvido como veio para não se perder ao salvar.
  syllabus: string;
  workloadHours: string;
  credits: string;
  nature: SubjectNature;
  // Códigos separados por vírgula, como o administrador digita.
  prerequisites: string;
};

export type SubjectField = "code" | "name" | "workloadHours" | "credits" | "prerequisites";
// Erros por posição da disciplina na lista (a tela mostra só as de um período por vez).
export type SubjectErrors = Record<number, Partial<Record<SubjectField, string>>>;

export type CourseField = Exclude<keyof CourseInput, "active" | "subjects">;
export type CourseErrors = Partial<Record<CourseField, string>>;

// D14: nível × tipo.
export const TYPES_BY_LEVEL: Record<CourseLevel, CourseType[]> = {
  GRADUACAO: ["BACHARELADO", "LICENCIATURA"],
  POS: ["STRICTO_SENSU"],
};

const TEXT_LIMITS: Partial<Record<CourseField, [number, string]>> = {
  name: [200, "Nome com no máximo 200 caracteres."],
  code: [30, "Código com no máximo 30 caracteres."],
  modality: [60, "Modalidade com no máximo 60 caracteres."],
  shift: [60, "Turno com no máximo 60 caracteres."],
  description: [5000, "Descrição com no máximo 5000 caracteres."],
  coordinatorName: [200, "Nome do coordenador com no máximo 200 caracteres."],
  viceCoordinatorName: [200, "Nome do vice com no máximo 200 caracteres."],
  officeLocation: [200, "Local de atendimento com no máximo 200 caracteres."],
  officeHours: [200, "Horário com no máximo 200 caracteres."],
  attendanceMode: [200, "Forma de atendimento com no máximo 200 caracteres."],
  phone: [30, "Telefone com no máximo 30 caracteres."],
  extension: [10, "Ramal com no máximo 10 caracteres."],
  email: [254, "E-mail longo demais."],
  secondaryEmail: [254, "E-mail secundário longo demais."],
};

const NUMBERS: { field: CourseField; min: number; max: number; message: string }[] = [
  { field: "durationSemesters", min: 1, max: 30, message: "A duração deve ser de 1 a 30 semestres." },
  { field: "totalWorkloadHours", min: 1, max: 32767, message: "A carga horária deve ser de 1 a 32767 horas." },
  { field: "mecGrade", min: 1, max: 5, message: "A nota do MEC vai de 1 a 5." },
  { field: "capesGrade", min: 1, max: 7, message: "A nota da CAPES vai de 1 a 7." },
];

export const emptyCourseInput = (): CourseInput => ({
  departmentId: "",
  name: "",
  level: "",
  type: "",
  code: "",
  modality: "",
  shift: "",
  durationSemesters: "",
  totalWorkloadHours: "",
  mecGrade: "",
  capesGrade: "",
  description: "",
  active: true,
  coordinatorName: "",
  viceCoordinatorName: "",
  officeLocation: "",
  officeHours: "",
  attendanceMode: "",
  phone: "",
  extension: "",
  email: "",
  secondaryEmail: "",
  subjects: [],
});

// Do que a API devolveu para o que o formulário edita (campos vazios viram texto vazio).
export function inputOf(course: CourseDetail): CourseInput {
  const text = (value: string | null | undefined) => value ?? "";
  const num = (value: number | null | undefined) => (value == null ? "" : String(value));
  const c = course.coordination;
  return {
    departmentId: String(course.departmentId),
    name: course.name,
    level: course.level,
    type: course.type,
    code: text(course.code),
    modality: text(course.modality),
    shift: text(course.shift),
    durationSemesters: num(course.durationSemesters),
    totalWorkloadHours: num(course.totalWorkloadHours),
    mecGrade: num(course.mecGrade),
    capesGrade: num(course.capesGrade),
    description: text(course.description),
    active: course.active,
    coordinatorName: text(c.coordinatorName),
    viceCoordinatorName: text(c.viceCoordinatorName),
    officeLocation: text(c.officeLocation),
    officeHours: text(c.officeHours),
    attendanceMode: text(c.attendanceMode),
    phone: text(c.phone),
    extension: text(c.extension),
    email: text(c.email),
    secondaryEmail: text(c.secondaryEmail),
    subjects: (course.subjects ?? []).map((subject) => ({
      key: subject.id,
      period: num(subject.period),
      code: subject.code,
      name: subject.name,
      syllabus: text(subject.syllabus),
      workloadHours: num(subject.workloadHours),
      credits: num(subject.credits),
      nature: subject.nature,
      prerequisites: subject.prerequisites.join(", "),
    })),
  };
}

export class CourseValidationError extends Error {
  constructor(
    readonly errors: CourseErrors,
    // Problema que não é de um campo só (ex.: departamento inativo): a tela mostra no resumo.
    readonly summary?: string,
    readonly subjectErrors: SubjectErrors = {},
  ) {
    super("Curso com campos inválidos.");
  }
}

const EMAIL = /^\S+@\S+\.\S+$/;

// FE-35.01 / RN-UC35-01: devolve só os campos com problema; objeto vazio quando está tudo certo.
export function validateCourse(input: CourseInput): CourseErrors {
  const errors: CourseErrors = {};
  if (!input.name.trim()) errors.name = "O nome do curso é obrigatório.";
  if (!input.departmentId) errors.departmentId = "O departamento é obrigatório.";
  if (!input.level) errors.level = "O nível é obrigatório.";
  if (!input.type) errors.type = "O tipo é obrigatório.";
  else if (input.level && !TYPES_BY_LEVEL[input.level].includes(input.type)) {
    errors.type = input.level === "POS" ? "Pós-graduação é só Stricto sensu." : "Graduação é Bacharelado ou Licenciatura.";
  }
  for (const [field, [max, message]] of Object.entries(TEXT_LIMITS) as [CourseField, [number, string]][]) {
    if (!errors[field] && input[field].trim().length > max) errors[field] = message;
  }
  for (const { field, min, max, message } of NUMBERS) {
    const raw = input[field].trim();
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max) errors[field] = message;
  }
  if (input.email.trim() && !errors.email && !EMAIL.test(input.email.trim())) errors.email = "E-mail inválido.";
  if (input.secondaryEmail.trim() && !errors.secondaryEmail && !EMAIL.test(input.secondaryEmail.trim())) {
    errors.secondaryEmail = "E-mail secundário inválido.";
  }
  return errors;
}

// Pré-requisitos digitados como "AGR101, AGR102" viram a lista de códigos (vazios são descartados).
export function splitPrerequisites(text: string): string[] {
  return text.split(",").map((code) => code.trim()).filter(Boolean);
}

// FA-35.01: confere cada disciplina da matriz; devolve só as linhas com problema, pela posição na lista.
export function validateSubjects(subjects: SubjectInput[]): SubjectErrors {
  const errors: SubjectErrors = {};
  const seen = new Map<string, number>();
  subjects.forEach((subject, index) => {
    const row: Partial<Record<SubjectField, string>> = {};
    const code = subject.code.trim();
    if (!code) row.code = "Informe o código.";
    else if (code.length > 30) row.code = "Código com no máximo 30 caracteres.";
    else if (seen.has(code.toLowerCase())) row.code = "Código repetido na matriz.";
    else seen.set(code.toLowerCase(), index);
    const name = subject.name.trim();
    if (!name) row.name = "Informe o nome da disciplina.";
    else if (name.length > 200) row.name = "Nome com no máximo 200 caracteres.";
    const hours = Number(subject.workloadHours.trim());
    if (!subject.workloadHours.trim() || !Number.isInteger(hours) || hours < 1 || hours > 32767) {
      row.workloadHours = "Carga horária de 1 a 32767.";
    }
    const credits = subject.credits.trim();
    if (credits && (!Number.isInteger(Number(credits)) || Number(credits) < 0 || Number(credits) > 100)) {
      row.credits = "Créditos de 0 a 100.";
    }
    const prerequisites = splitPrerequisites(subject.prerequisites);
    if (prerequisites.length > 30 || prerequisites.some((c) => c.length > 30)) {
      row.prerequisites = "No máximo 30 pré-requisitos, com até 30 caracteres cada.";
    }
    if (Object.keys(row).length) errors[index] = row;
  });
  return errors;
}

// Campo opcional vazio vai como nulo (o servidor também trata texto vazio como nulo).
function payloadOf(input: CourseInput) {
  const optional = (value: string) => value.trim() || null;
  const optionalNumber = (value: string) => (value.trim() ? Number(value) : null);
  return {
    departmentId: Number(input.departmentId),
    name: input.name.trim(),
    level: input.level,
    type: input.type,
    code: optional(input.code),
    modality: optional(input.modality),
    shift: optional(input.shift),
    durationSemesters: optionalNumber(input.durationSemesters),
    totalWorkloadHours: optionalNumber(input.totalWorkloadHours),
    mecGrade: optionalNumber(input.mecGrade),
    capesGrade: optionalNumber(input.capesGrade),
    description: optional(input.description),
    active: input.active,
    coordinatorName: optional(input.coordinatorName),
    viceCoordinatorName: optional(input.viceCoordinatorName),
    officeLocation: optional(input.officeLocation),
    officeHours: optional(input.officeHours),
    attendanceMode: optional(input.attendanceMode),
    phone: optional(input.phone),
    extension: optional(input.extension),
    email: optional(input.email),
    secondaryEmail: optional(input.secondaryEmail),
    subjects: input.subjects.map((subject) => ({
      period: optionalNumber(subject.period),
      code: subject.code.trim(),
      name: subject.name.trim(),
      syllabus: optional(subject.syllabus),
      workloadHours: Number(subject.workloadHours),
      credits: optionalNumber(subject.credits),
      nature: subject.nature,
      prerequisites: splitPrerequisites(subject.prerequisites),
    })),
  };
}

const SUBJECT_FIELDS: SubjectField[] = ["code", "name", "workloadHours", "credits", "prerequisites"];

const COURSE_FIELDS = Object.keys(emptyCourseInput()).filter((k) => k !== "active" && k !== "subjects") as CourseField[];

// Valida no cliente e, se o servidor recusar (400), devolve o erro no campo certo; o que não é de campo vira resumo.
async function send(input: CourseInput, request: () => Promise<CourseDetail>): Promise<CourseDetail> {
  const errors = validateCourse(input);
  const subjectErrors = validateSubjects(input.subjects);
  if (Object.keys(errors).length || Object.keys(subjectErrors).length) {
    throw new CourseValidationError(errors, undefined, subjectErrors);
  }
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const fieldErrors: CourseErrors = {};
      const rowErrors: SubjectErrors = {};
      for (const [key, message] of Object.entries(error.fields ?? {})) {
        // Erro de uma disciplina vem como "subjects[3].code".
        const row = key.match(/^subjects\[(\d+)\]\.(\w+)/);
        if (row) {
          const field = row[2] as SubjectField;
          if (SUBJECT_FIELDS.includes(field)) (rowErrors[Number(row[1])] ??= {})[field] = message;
          continue;
        }
        const field = key as CourseField;
        if (COURSE_FIELDS.includes(field)) fieldErrors[field] = message;
      }
      if (Object.keys(fieldErrors).length || Object.keys(rowErrors).length || error.detail) {
        throw new CourseValidationError(fieldErrors, error.detail, rowErrors);
      }
    }
    throw error;
  }
}

// O painel lista todos os cursos, inclusive os inativos (a lista pública mostra só os ativos).
export const listCoursesAdmin = () => apiGet<CourseSummary[]>("/admin/courses");

export const getCourseAdmin = (id: string) => apiGet<CourseDetail>(`/admin/courses/${encodeURIComponent(id)}`);

export function createCourse(input: CourseInput): Promise<CourseDetail> {
  return send(input, () => apiPost<CourseDetail>("/courses", payloadOf(input)));
}

// UC35: `active` publica ou despublica; o servidor registra antes e depois no histórico.
export function updateCourse(id: number, input: CourseInput): Promise<CourseDetail> {
  return send(input, () => apiPut<CourseDetail>(`/courses/${id}`, payloadOf(input)));
}

// UC36: exclusão definitiva (RN-UC36-01). Já excluído em outra aba (404) é tratado como sucesso.
export async function deleteCourse(id: number): Promise<void> {
  try {
    await apiDelete(`/courses/${id}`);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
}
