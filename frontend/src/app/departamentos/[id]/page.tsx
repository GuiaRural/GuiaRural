"use client";

import Link from "next/link";
import { use } from "react";
import AppShell from "../../components/common/AppShell";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import ApiFailure from "../../components/courses/ApiFailure";
import CourseCard from "../../components/courses/CourseCard";
import { useLanguage } from "../../context/LanguageContext";
import { useApi } from "../../hooks/useApi";
import { getDepartment, getDepartmentCourses, type Department } from "../../services/coursesService";

// UC37: o visitante consulta o departamento e os cursos vinculados a ele.
export default function DepartmentPage({ params }: PageProps<"/departamentos/[id]">) {
  const { id } = use(params);
  const { t } = useLanguage();
  const state = useApi(getDepartment, id);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href="/cursos" className="flex items-center gap-1 text-sm font-semibold text-navy-900 hover:underline">
              <span aria-hidden>←</span> {t.courses.backToList}
            </Link>
            <LanguageSwitcher />
          </div>
          {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
          {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
          {state.status === "ready" && <DepartmentDetails department={state.data} id={id} />}
        </div>
      </div>
    </AppShell>
  );
}

function DepartmentDetails({ department, id }: { department: Department; id: string }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        {department.academicCenter && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{department.academicCenter}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold text-navy-900">{department.name}</h1>
        {department.code && <p className="mt-1 text-xs text-slate-500">{department.code}</p>}
        {department.address && <p className="mt-2 text-sm text-slate-600">{department.address}</p>}
      </section>

      {(department.hours || department.phone || department.email) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {department.hours && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t.courses.hours}</h2>
              <p className="mt-1 font-semibold text-navy-900">{department.hours}</p>
            </div>
          )}
          {(department.phone || department.email) && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t.courses.contact}</h2>
              {department.phone && <p className="mt-1 font-semibold text-navy-900">{department.phone}</p>}
              {department.email && <p className="text-sm text-slate-600">{department.email}</p>}
            </div>
          )}
        </section>
      )}

      {department.description && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-navy-900">{t.courses.about}</h2>
            {department.foundedYear && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {t.courses.foundedIn} {department.foundedYear}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{department.description}</p>
        </section>
      )}

      <LinkedCourses id={id} />
    </div>
  );
}

function LinkedCourses({ id }: { id: string }) {
  const { t } = useLanguage();
  const state = useApi(getDepartmentCourses, id);

  if (state.status === "loading") return <p className="text-sm text-slate-600">{t.common.loading}</p>;
  if (state.status === "error") return <ApiFailure error={state.error} onRetry={state.retry} />;

  const { programsOffered, groups, coordinations } = state.data;
  // FE-37.01: sem cursos vinculados, a seção não é exibida.
  if (programsOffered === 0) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-navy-900">{t.courses.linkedCourses}</h2>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {programsOffered} {t.courses.programsOffered}
          </span>
        </div>
        {groups.map((group) => (
          <div key={group.level} className="mt-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
              {group.level === "GRADUACAO" ? t.courses.undergraduate : t.courses.postgraduate}
            </h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {group.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {coordinations.length > 0 && (
        <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-navy-900">{t.courses.coordinations}</h2>
          <ul className="mt-3 space-y-3">
            {coordinations.map((coordination) => (
              <li key={coordination.courseId} className="rounded-lg bg-slate-50 p-3 text-xs">
                <p className="font-bold text-navy-900">{coordination.courseName}</p>
                <p className="text-slate-600">{coordination.coordinatorName}</p>
                <p className="mt-1 font-semibold text-amber-700">
                  {[coordination.extension && `${t.courses.extension}: ${coordination.extension}`, coordination.email]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
