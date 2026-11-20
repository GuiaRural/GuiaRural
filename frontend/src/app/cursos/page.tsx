"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ApiFailure from "../components/courses/ApiFailure";
import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { filterCatalog } from "../lib/catalogFilter";
import { getCourses, getDepartments, type CourseSummary } from "../services/coursesService";

export default function CoursesAndDepartmentsPage() {
  const { t, language } = useLanguage();
  const state = useApi(getDepartments, language);
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<CourseSummary[]>([]);

  // Os cursos só servem ao filtro: sem eles, o filtro continua valendo para os departamentos.
  useEffect(() => {
    let cancelled = false;
    getCourses(language).then(
      (list) => !cancelled && setCourses(list),
      () => !cancelled && setCourses([]),
    );
    return () => {
      cancelled = true;
    };
  }, [language]);

  const matches = state.status === "ready" ? filterCatalog(state.data, courses, query) : [];

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.courses.title}</h1>
              <p className="mt-1 text-sm text-slate-600">{t.courses.subtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {state.status === "ready" && state.data.length > 0 && (
            <div className="mt-5">
              <label htmlFor="catalog-filter" className="sr-only">
                {t.courses.filterLabel}
              </label>
              <input
                id="catalog-filter"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.courses.filterPlaceholder}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-navy-700 focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
          )}

          <div className="mt-6">
            {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
            {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
            {state.status === "ready" && state.data.length === 0 && (
              <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.courses.departmentsEmpty}</p>
            )}
            {state.status === "ready" && state.data.length > 0 && matches.length === 0 && (
              <p role="status" className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
                {t.courses.filterEmpty}
              </p>
            )}
            {matches.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {matches.map(({ department, courses: matched }) => (
                  <li key={department.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:ring-navy-700">
                    <Link
                      href={`/departamentos/${department.id}`}
                      className="block rounded-2xl p-5 focus-visible:outline-2 focus-visible:outline-navy-700"
                    >
                      {department.academicCenter && (
                        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                          {department.academicCenter}
                        </p>
                      )}
                      <h2 lang={department.lang !== language ? department.lang : undefined} className="mt-1 font-bold text-navy-900">
                        {department.name}
                      </h2>
                      {department.shortName && <p className="text-sm text-slate-600">{department.shortName}</p>}
                    </Link>
                    {matched.length > 0 && (
                      <ul className="-mt-2 space-y-1 px-5 pb-4 text-sm">
                        {matched.map((course) => (
                          <li key={course.id}>
                            <Link
                              href={`/cursos/${course.id}`}
                              lang={course.lang !== language ? course.lang : undefined}
                              className="font-semibold text-navy-700 underline hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-navy-700"
                            >
                              {course.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
