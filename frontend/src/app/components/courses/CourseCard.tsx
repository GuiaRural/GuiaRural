"use client";

import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import type { CourseSummary } from "../../services/coursesService";

export default function CourseCard({ course }: { course: CourseSummary }) {
  const { t } = useLanguage();
  const details = [
    course.modality,
    course.shift,
    course.durationSemesters ? `${t.courses.duration}: ${course.durationSemesters} ${t.courses.semesters}` : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded bg-navy-900 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
          {t.courses.types[course.type]}
        </span>
        {course.mecGrade && <span className="text-xs font-semibold text-emerald-700">MEC {course.mecGrade}</span>}
        {course.capesGrade && <span className="text-xs font-semibold text-emerald-700">CAPES {course.capesGrade}</span>}
      </div>
      <h3 className="mt-2 font-bold text-navy-900">{course.name}</h3>
      {details.length > 0 && <p className="mt-1 text-xs text-slate-600">{details.join(" • ")}</p>}
      {course.description && <p className="mt-1 text-xs text-slate-600">{course.description}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs">
        <span className="text-slate-500">{course.officeLocation}</span>
        <Link
          href={`/cursos/${course.id}`}
          className="font-semibold text-navy-900 hover:underline focus-visible:outline-2 focus-visible:outline-navy-700"
        >
          {t.courses.viewCurriculum} <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
