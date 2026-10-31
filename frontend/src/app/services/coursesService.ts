import { apiGet } from "../lib/api";

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

export const getDepartments = () => apiGet<Department[]>("/departments");

export const getDepartment = (id: string) => apiGet<Department>(`/departments/${encodeURIComponent(id)}`);

export const getDepartmentCourses = (id: string) =>
  apiGet<DepartmentCourses>(`/departments/${encodeURIComponent(id)}/courses`);

export const getCourse = (id: string) => apiGet<CourseDetail>(`/courses/${encodeURIComponent(id)}`);
