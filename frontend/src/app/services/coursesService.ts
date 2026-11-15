import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

// Ponto único de acesso a departamentos e cursos (backend: /api/departments e /api/courses).
// Os tipos espelham os DTOs do backend; o conteúdo vem em português (sem modelo de tradução ainda).

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

export const getDepartments = () => apiGet<Department[]>("/departments");

export const getDepartment = (id: string) => apiGet<Department>(`/departments/${encodeURIComponent(id)}`);

export const getDepartmentCourses = (id: string) =>
  apiGet<DepartmentCourses>(`/departments/${encodeURIComponent(id)}/courses`);

export const getCourse = (id: string) => apiGet<CourseDetail>(`/courses/${encodeURIComponent(id)}`);

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
};

export type CourseField = Exclude<keyof CourseInput, "active">;
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
  };
}

export class CourseValidationError extends Error {
  constructor(
    readonly errors: CourseErrors,
    // Problema que não é de um campo só (ex.: departamento inativo): a tela mostra no resumo.
    readonly summary?: string,
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
  };
}

const COURSE_FIELDS = Object.keys(emptyCourseInput()).filter((k) => k !== "active") as CourseField[];

// Valida no cliente e, se o servidor recusar (400), devolve o erro no campo certo; o que não é de campo vira resumo.
async function send(input: CourseInput, request: () => Promise<CourseDetail>): Promise<CourseDetail> {
  const errors = validateCourse(input);
  if (Object.keys(errors).length) throw new CourseValidationError(errors);
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const fieldErrors: CourseErrors = {};
      for (const [key, message] of Object.entries(error.fields ?? {})) {
        const field = key as CourseField;
        if (COURSE_FIELDS.includes(field)) fieldErrors[field] = message;
      }
      if (Object.keys(fieldErrors).length || error.detail) throw new CourseValidationError(fieldErrors, error.detail);
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
