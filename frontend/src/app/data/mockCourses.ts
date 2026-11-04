export type Course = { id: string; name: string; level: "graduacao" | "pos"; shift: string; mecGrade?: string };

// Cursos previamente cadastrados (RN-UC14.03: só estes podem ser vinculados a um local).
export const MOCK_COURSES: Course[] = [
  { id: "bcc", name: "Bacharelado em Ciência da Computação", level: "graduacao", shift: "Integral", mecGrade: "4" },
  { id: "bsi", name: "Bacharelado em Sistemas de Informação", level: "graduacao", shift: "Noturno", mecGrade: "4" },
  { id: "ppgia", name: "Pós-Graduação em Informática Aplicada", level: "pos", shift: "Integral" },
  { id: "agronomia", name: "Bacharelado em Agronomia", level: "graduacao", shift: "Integral" },
  { id: "medvet", name: "Bacharelado em Medicina Veterinária", level: "graduacao", shift: "Integral" },
  { id: "zootecnia", name: "Bacharelado em Zootecnia", level: "graduacao", shift: "Integral" },
];
