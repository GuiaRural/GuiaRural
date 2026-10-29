"use client";

import Link from "next/link";
import { use, useState } from "react";
import AppShell from "../../components/common/AppShell";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import ApiFailure from "../../components/courses/ApiFailure";
import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { getCourse, type CourseDetail } from "../../services/coursesService";

// Aba da matriz: número do período ou "optativas" (disciplinas sem período).
type Tab = number | "electives";

export default function CoursePage({ params }: PageProps<"/cursos/[id]">) {
  const { id } = use(params);
  const { t } = useLanguage();
  const state = useApi(getCourse, id);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href={state.status === "ready" ? `/departamentos/${state.data.departmentId}` : "/cursos"}
              className="flex items-center gap-1 text-sm font-semibold text-navy-900 hover:underline"
            >
              <span aria-hidden>←</span>{" "}
              {state.status === "ready" ? t.courses.backToDepartment : t.courses.backToList}
            </Link>
            <LanguageSwitcher />
          </div>
          {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
          {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
          {state.status === "ready" && <CourseDetails course={state.data} />}
        </div>
      </div>
    </AppShell>
  );
}

function CourseDetails({ course }: { course: CourseDetail }) {
  const { t } = useLanguage();
  const c = course.coordination;
  const subtitle = [course.academicCenter, course.code && `${t.courses.courseCode}: ${course.code}`, course.modality, course.shift]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
          <span className="rounded bg-brand-yellow px-2 py-0.5 text-navy-900">
            {course.level === "GRADUACAO" ? t.courses.undergraduate : t.courses.postgraduate}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{t.courses.types[course.type]}</span>
          <span className="rounded bg-emerald-50 px-2 py-0.5 normal-case text-emerald-700">
            {t.courses.active}
            {course.durationSemesters ? ` • ${t.courses.duration}: ${course.durationSemesters} ${t.courses.semesters}` : ""}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-navy-900">{course.name}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        <Link
          href={`/departamentos/${course.departmentId}`}
          className="mt-3 inline-block rounded-lg bg-slate-50 px-3 py-2 text-xs hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy-700"
        >
          <span className="block text-[10px] font-bold uppercase text-slate-500">{t.courses.viewDepartment}</span>
          <span className="font-bold text-navy-900">{course.departmentShortName ?? course.departmentName}</span>
        </Link>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-navy-900">{t.courses.coordination}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <InfoCard
            title={t.courses.coordinator}
            lines={[
              c.coordinatorName,
              c.viceCoordinatorName && `${t.courses.viceCoordinator}: ${c.viceCoordinatorName}`,
            ]}
          />
          <InfoCard
            title={t.courses.office}
            lines={[
              c.officeLocation,
              c.officeHours && `${t.courses.officeHours}: ${c.officeHours}`,
              c.attendanceMode && `${t.courses.attendanceMode}: ${c.attendanceMode}`,
            ]}
          />
          <InfoCard
            title={t.courses.channels}
            lines={[
              c.phone && `${t.courses.phone}: ${c.phone}`,
              c.extension && `${t.courses.extension}: ${c.extension}`,
              c.email,
              c.secondaryEmail,
            ]}
          />
        </div>
      </section>

      <Curriculum course={course} />
    </div>
  );
}

function InfoCard({ title, lines }: { title: string; lines: (string | null | undefined | false)[] }) {
  const shown = lines.filter(Boolean) as string[];
  if (shown.length === 0) return null;
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-sm">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{title}</h3>
      <div className="mt-1 space-y-1 text-slate-700">
        {shown.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function Curriculum({ course }: { course: CourseDetail }) {
  const { t } = useLanguage();
  const periodCount = Math.max(course.durationSemesters ?? 0, ...course.subjects.map((s) => s.period ?? 0));
  const tabs: Tab[] = [...Array.from({ length: periodCount }, (_, i) => i + 1), "electives"];
  const firstWithSubjects = tabs.find((tab) => course.subjects.some((s) => (tab === "electives" ? s.period === null : s.period === tab)));
  const [selected, setSelected] = useState<Tab | null>(null);
  const current = selected ?? firstWithSubjects ?? tabs[0];

  const subjects = course.subjects.filter((s) => (current === "electives" ? s.period === null : s.period === current));
  const totalHours = subjects.reduce((sum, s) => sum + s.workloadHours, 0);
  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits ?? 0), 0);
  const label = (tab: Tab) => (tab === "electives" ? t.courses.electives : `${t.courses.period} ${tab}`);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-navy-900">{t.courses.curriculum}</h2>
        {course.totalWorkloadHours && (
          <p className="text-sm text-slate-600">
            <strong className="text-navy-900">{course.totalWorkloadHours}h</strong> {t.courses.totalWorkload}
          </p>
        )}
      </div>

      <div role="group" aria-label={t.courses.curriculum} className="mt-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={tab === current}
            onClick={() => setSelected(tab)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-navy-700 ${
              tab === current ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {label(tab)}
          </button>
        ))}
      </div>

      {subjects.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{t.courses.noSubjects}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-3 py-2">{t.courses.subjectCode}</th>
                <th scope="col" className="px-3 py-2">{t.courses.subject}</th>
                <th scope="col" className="px-3 py-2">{t.courses.workload}</th>
                <th scope="col" className="px-3 py-2">{t.courses.nature}</th>
                <th scope="col" className="px-3 py-2">{t.courses.prerequisites}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-mono text-xs font-bold text-navy-900">{subject.code}</td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-navy-900">{subject.name}</p>
                    {subject.syllabus && <p className="text-xs text-slate-600">{subject.syllabus}</p>}
                  </td>
                  <td className="px-3 py-2">
                    {subject.workloadHours}h
                    {subject.credits !== null && (
                      <span className="block text-xs text-slate-500">
                        {subject.credits} {t.courses.credits}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold">
                      {subject.nature === "OBRIGATORIA" ? t.courses.obligatory : t.courses.optional}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {subject.prerequisites.length > 0 ? subject.prerequisites.join(", ") : t.courses.none}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {label(current)} • {totalHours}h{totalCredits > 0 ? ` (${totalCredits} ${t.courses.credits})` : ""}
          </p>
        </div>
      )}
    </section>
  );
}
