"use client";

import AppShell from "../components/common/AppShell";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { listAvisos } from "../services/avisosService";

const LOCALES = { pt: "pt-BR", en: "en-US", es: "es-ES" } as const;

const noArg = null;

// Avisos do campus (visão pública): publicados pelo painel em /admin/avisos.
export default function NoticesPage() {
  const { t, language } = useLanguage();
  const state = useApi(listAvisos, noArg);
  const avisos = state.status === "ready" ? state.data : null;

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.notices.title}</h1>
              <p className="mt-1 text-sm text-text-2nd">{t.notices.subtitle}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {t.notices.portugueseOnly && <p className="mt-4 text-xs text-text-2nd">{t.notices.portugueseOnly}</p>}

          {state.status === "error" && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {t.notices.error}{" "}
              <button type="button" onClick={state.retry} className="font-semibold underline">
                {t.notices.retry}
              </button>
            </div>
          )}
          {state.status === "loading" && <p className="mt-6 text-sm text-slate-600">{t.common.loading}</p>}
          {avisos?.length === 0 && <p className="mt-6 rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">{t.notices.empty}</p>}

          <ul className="mt-6 space-y-3">
            {avisos?.map((a) => (
              <li key={a.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-2nd">
                  <time dateTime={a.data}>{new Date(a.data).toLocaleDateString(LOCALES[language], { day: "2-digit", month: "long", year: "numeric" })}</time>
                </p>
                <h2 lang="pt" className="mt-1 font-semibold text-navy-900">
                  {a.nome}
                </h2>
                <p lang="pt" className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {a.descricao}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
