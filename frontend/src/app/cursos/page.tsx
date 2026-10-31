"use client";

import Link from "next/link";
import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import ApiFailure from "../components/courses/ApiFailure";
import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { getDepartments } from "../services/coursesService";

const noArg = null;

export default function CoursesAndDepartmentsPage() {
  const { t } = useLanguage();
  const state = useApi(getDepartments, noArg);

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

          <div className="mt-6">
            {state.status === "loading" && <p className="text-sm text-slate-600">{t.common.loading}</p>}
            {state.status === "error" && <ApiFailure error={state.error} onRetry={state.retry} />}
            {state.status === "ready" && state.data.length === 0 && (
              <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.courses.departmentsEmpty}</p>
            )}
            {state.status === "ready" && state.data.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {state.data.map((department) => (
                  <li key={department.id}>
                    <Link
                      href={`/departamentos/${department.id}`}
                      className="block h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-navy-700 focus-visible:outline-2 focus-visible:outline-navy-700"
                    >
                      {department.academicCenter && (
                        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
                          {department.academicCenter}
                        </p>
                      )}
                      <h2 className="mt-1 font-bold text-navy-900">{department.name}</h2>
                      {department.shortName && <p className="text-sm text-slate-600">{department.shortName}</p>}
                    </Link>
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
